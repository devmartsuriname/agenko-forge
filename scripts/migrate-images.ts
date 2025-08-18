/*
  scripts/migrate-images.ts
  -------------------------
  Bulk-migrate external images to your storage with responsive WebP variants.
  Provider-agnostic (Supabase Storage or S3-compatible). Idempotent.
*/

import 'dotenv/config';
import crypto from 'node:crypto';
import path from 'node:path';
import sharp from 'sharp';
import { Client as Pg } from 'pg';
import { createClient as createSupabase } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// ------------------ Config ------------------
const PROVIDER = (process.env.STORAGE_PROVIDER || 'SUPABASE').toUpperCase();
const BUCKET = process.env.MEDIA_BUCKET || 'media';
const IMAGE_QUALITY = Number(process.env.IMAGE_QUALITY || 80);

const VARIANTS = [1200, 960, 640, 320] as const; // widths (16:9 → height computed)
const aspect = { w: 16, h: 9 };

// ------------------ Helpers ------------------
const hash = (s: string) => crypto.createHash('sha1').update(s).digest('hex').slice(0, 8);
const isExternal = (url?: string | null) => !!url && !/\.(supabase|amazonaws|cloudfront|your-domain)\./i.test(url);

function baseNameFromUrl(u: string, fallback: string) {
  try { return path.parse(new URL(u).pathname).name || fallback; } catch { return fallback; }
}

async function download(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed ${res.status}: ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function makeVariants(buf: Buffer) {
  // Force 16:9 letterboxed if needed; output webp in widths
  const out: Record<number, Buffer> = {};
  for (const w of VARIANTS) {
    const h = Math.round((w * aspect.h) / aspect.w);
    out[w] = await sharp(buf)
      .resize({ width: w, height: h, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp({ quality: IMAGE_QUALITY })
      .toBuffer();
  }
  return out;
}

// ------------------ Storage Adapters ------------------
interface UploadedRefs { src: string; srcset: string; sizes: string; key1200: string }
interface StorageAdapter {
  putObject(key: string, body: Buffer, contentType: string, cacheControl?: string): Promise<string>; // returns public URL
  publicUrl(key: string): string;
}

class SupabaseStorage implements StorageAdapter {
  private sb = createSupabase(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  async putObject(key: string, body: Buffer, contentType: string, cacheControl = 'public, max-age=31536000, immutable') {
    const { error } = await this.sb.storage.from(BUCKET).upload(key, body, {
      upsert: true,
      contentType,
      cacheControl,
    });
    if (error) throw error;
    return this.publicUrl(key);
  }
  publicUrl(key: string) {
    const { data } = this.sb.storage.from(BUCKET).getPublicUrl(key);
    return data.publicUrl;
  }
}

class S3Storage implements StorageAdapter {
  private s3 = new S3Client({
    region: process.env.S3_REGION,
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
  });
  async putObject(key: string, body: Buffer, contentType: string, cacheControl = 'public, max-age=31536000, immutable') {
    await this.s3.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: key,
      Body: body,
      ContentType: contentType,
      ACL: 'public-read',
      CacheControl: cacheControl,
    }));
    return this.publicUrl(key);
  }
  publicUrl(key: string) {
    const base = (process.env.S3_PUBLIC_BASE_URL || '').replace(/\/$/, '');
    if (!base) throw new Error('S3_PUBLIC_BASE_URL required for public URL construction');
    return `${base}/${key}`;
  }
}

function storage(): StorageAdapter {
  return PROVIDER === 'S3' ? new S3Storage() : new SupabaseStorage();
}

// ------------------ DB Adapter (PG direct) ------------------
class Db {
  private pg: Pg;
  
  constructor() {
    // Use existing Supabase URL for database connection if no DATABASE_URL provided
    const dbUrl = process.env.DATABASE_URL || 
      `postgresql://postgres.dvgubqqjvmsepkilnkak:${process.env.SUPABASE_SERVICE_ROLE_KEY?.split('.')[1] || '[key]'}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;
    this.pg = new Pg({ 
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false }
    });
  }
  
  async init() { await this.pg.connect(); }
  async end() { await this.pg.end(); }

  // Projects
  async getProjectImagesExternal() {
    const q = `
      SELECT pi.id, pi.url, p.slug as project_slug
      FROM project_images pi
      JOIN projects p ON p.id = pi.project_id
      WHERE pi.url IS NOT NULL AND pi.url <> ''
      AND pi.url NOT ILIKE '%/storage/v1/object/public/%' -- supabase public
      AND pi.url NOT ILIKE '%${BUCKET}%' -- quick heuristic
    `;
    const { rows } = await this.pg.query(q);
    return rows as { id: string; url: string; project_slug: string }[];
  }
  async updateProjectImageUrl(id: string, url: string) {
    await this.pg.query('UPDATE project_images SET url = $1 WHERE id = $2', [url, id]);
  }

  // Blog
  async getBlogHeroesExternal() {
    const q = `
      SELECT id, slug, body
      FROM blog_posts
      WHERE body IS NOT NULL
      AND status = 'published'
    `;
    const { rows } = await this.pg.query(q);
    return rows as { id: string; slug: string; body: any }[];
  }
  async updateBlogBody(id: string, body: any) {
    await this.pg.query('UPDATE blog_posts SET body = $1 WHERE id = $2', [JSON.stringify(body), id]);
  }

  // Pages (sections)
  async getPagesWithBody() {
    const { rows } = await this.pg.query(`SELECT id, slug, body FROM pages WHERE body IS NOT NULL`);
    return rows as { id: string; slug: string; body: any }[];
  }
  async updatePageBody(id: string, body: any) {
    await this.pg.query('UPDATE pages SET body = $1 WHERE id = $2', [JSON.stringify(body), id]);
  }
}

// ------------------ Migration core ------------------
function srcsetFor(basePath: string, keyBase: string, makeUrl: (k: string) => string) {
  const entries = VARIANTS.map((w) => `${makeUrl(`${basePath}/${keyBase}-${w}.webp`)} ${w}w`);
  return entries.join(', ');
}

async function uploadAll(imgBuf: Buffer, basePath: string, keyBase: string, st: StorageAdapter) {
  const variants = await makeVariants(imgBuf);
  let src1200 = '';
  for (const w of VARIANTS) {
    const key = `${basePath}/${keyBase}-${w}.webp`;
    const url = await st.putObject(key, variants[w], 'image/webp');
    if (w === 1200) src1200 = url;
  }
  const srcset = srcsetFor(basePath, keyBase, (k) => st.publicUrl(k));
  return { 
    src: src1200, 
    srcset, 
    sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw", 
    key1200: `${basePath}/${keyBase}-1200.webp` 
  } as UploadedRefs;
}

function rewriteIfExternal(u?: string | null) {
  return !!u && isExternal(u) ? u : null;
}

// Handle blog post images in structured content
async function migrateBlogImages(slug: string, body: any, st: StorageAdapter) {
  if (!body || !body.blocks || !Array.isArray(body.blocks)) return body;
  
  let changed = false;
  const updatedBlocks = await Promise.all(body.blocks.map(async (block: any) => {
    if (block.type === 'hero' && block.data?.backgroundImage) {
      const imageData = block.data.backgroundImage;
      const imageUrl = typeof imageData === 'string' ? imageData : imageData.src;
      
      if (isExternal(imageUrl)) {
        try {
          const buf = await download(imageUrl);
          const basePath = `blog/${slug}`;
          const base = `hero-${hash(imageUrl)}`;
          const { src, srcset } = await uploadAll(buf, basePath, base, st);
          
          block.data.backgroundImage = {
            src,
            srcset,
            sizes: "100vw",
            alt: imageData?.alt || "Blog hero image",
            width: 1200,
            height: 675
          };
          changed = true;
        } catch (e) {
          console.error(`Failed to migrate blog hero image: ${e}`);
        }
      }
    }
    return block;
  }));
  
  return changed ? { ...body, blocks: updatedBlocks } : body;
}

// Traverse limited, known sections only
async function migrateSectionsImages(pageSlug: string, body: any, st: StorageAdapter) {
  if (!body || !body.blocks || !Array.isArray(body.blocks)) return body;
  
  let changed = false;
  const updatedBlocks = await Promise.all(body.blocks.map(async (sec: any) => {
    const type = sec?.type;
    const secBase = `sections/${pageSlug}/${type || 'section'}`;

    const rewriteField = async (field: string, sizesHint?: string) => {
      const v = sec.data?.[field];
      // supports string URL or { src, srcset }
      const url = typeof v === 'string' ? v : v?.src;
      const ext = rewriteIfExternal(url);
      if (!ext) return;
      
      try {
        const buf = await download(ext);
        const base = `${type}-${hash(ext)}`;
        const { src, srcset } = await uploadAll(buf, secBase, base, st);
        sec.data = sec.data || {};
        sec.data[field] = { 
          src, 
          srcset, 
          sizes: sizesHint || sec.data[field]?.sizes || '100vw',
          alt: sec.data[field]?.alt || `${type} image`,
          width: 1200,
          height: 675
        };
        changed = true;
      } catch (e) {
        console.error(`Failed to migrate ${field} in ${type} section: ${e}`);
      }
    };

    if (['hero', 'about', 'cta'].includes(type)) {
      await rewriteField('backgroundImage', '100vw');
      await rewriteField('image', '100vw');
    }
    if (['servicesPreview', 'blogPreview', 'portfolioPreview'].includes(type)) {
      await rewriteField('image'); // cards image (if present)
    }

    return sec;
  }));
  
  return changed ? { ...body, blocks: updatedBlocks } : body;
}

async function main() {
  console.log(`→ Phase 5E Migration start (provider=${PROVIDER})`);
  const st = storage();
  const db = new Db();
  await db.init();

  try {
    // 1) Project gallery images
    const projImgs = await db.getProjectImagesExternal();
    console.log(`Projects: ${projImgs.length} external images to migrate`);
    for (const row of projImgs) {
      try {
        const buf = await download(row.url);
        const basePath = `projects/${row.project_slug}`;
        const base = `${row.project_slug}-${hash(row.url)}`;
        const { src } = await uploadAll(buf, basePath, base, st);
        await db.updateProjectImageUrl(row.id, src);
        console.log(`✓ project_images ${row.id} → ${src}`);
      } catch (e) {
        console.error(`✗ project_images ${row.id}:`, e);
      }
    }

    // 2) Blog images (from structured content)
    const blogPosts = await db.getBlogHeroesExternal();
    console.log(`Blog: ${blogPosts.length} posts to scan for images`);
    for (const row of blogPosts) {
      try {
        const newBody = await migrateBlogImages(row.slug, row.body, st);
        if (newBody !== row.body) {
          await db.updateBlogBody(row.id, newBody);
          console.log(`✓ blog_posts ${row.id} (${row.slug}) updated`);
        }
      } catch (e) {
        console.error(`✗ blog_posts ${row.id} (${row.slug}):`, e);
      }
    }

    // 3) Pages sections images
    const pages = await db.getPagesWithBody();
    console.log(`Pages: scanning ${pages.length} pages for section images`);
    for (const p of pages) {
      try {
        const newBody = await migrateSectionsImages(p.slug || 'page', p.body, st);
        if (newBody !== p.body) {
          await db.updatePageBody(p.id, newBody);
          console.log(`✓ pages ${p.id} (${p.slug}) updated`);
        }
      } catch (e) {
        console.error(`✗ pages ${p.id} (${p.slug}):`, e);
      }
    }

  } finally {
    await db.end();
  }
  
  console.log('✔ Phase 5E Migration complete');
}

main().catch((e) => { 
  console.error('Migration failed:', e); 
  process.exit(1); 
});

// Export for potential programmatic use
export { main as migrateImages };