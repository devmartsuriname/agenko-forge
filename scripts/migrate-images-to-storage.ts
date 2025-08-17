import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL!;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY!; // server-side only
const supa = createClient(url, service);

async function fetchAsBlob(remoteUrl: string): Promise<Blob> {
  try {
    const res = await fetch(remoteUrl);
    if (!res.ok) throw new Error(`Fetch failed: ${remoteUrl} - ${res.status}`);
    const buf = await res.arrayBuffer();
    return new Blob([buf], { type: 'image/jpeg' });
  } catch (error) {
    console.error(`Failed to fetch ${remoteUrl}:`, error);
    throw error;
  }
}

function filePath(kind: "projects" | "blog", slug: string, filename: string) {
  return `${kind}/${slug}/${filename}`.toLowerCase();
}

async function ensureUpload(kind: "projects" | "blog", slug: string, srcUrl: string, sortOrder: number = 1) {
  // Generate a consistent filename based on sort order
  const name = `image-${sortOrder}.jpg`;
  const path = filePath(kind, slug, name);

  // Check if already exists
  const { data: exists, error: listError } = await supa.storage
    .from("media")
    .list(`${kind}/${slug}`, { search: name });
  
  if (listError) {
    console.warn(`Error checking existing files: ${listError.message}`);
  }

  if ((exists || []).some(f => f.name === name)) {
    console.log(`File already exists: ${path}`);
    return supa.storage.from("media").getPublicUrl(path).data.publicUrl;
  }

  console.log(`Uploading ${srcUrl} to ${path}...`);
  const blob = await fetchAsBlob(srcUrl);
  
  const { error: upErr } = await supa.storage.from("media").upload(path, blob, {
    cacheControl: "31536000", // 1 year cache
    upsert: false,
    contentType: "image/jpeg"
  });
  
  if (upErr) {
    console.error(`Upload error for ${path}:`, upErr);
    throw upErr;
  }
  
  const publicUrl = supa.storage.from("media").getPublicUrl(path).data.publicUrl;
  console.log(`Successfully uploaded: ${publicUrl}`);
  return publicUrl;
}

async function migrateProjectImages() {
  console.log("🔄 Migrating project images to Supabase Storage...");
  
  // Load projects with their images
  const { data: projects, error: pErr } = await supa
    .from("projects")
    .select(`
      id, 
      slug, 
      project_images(
        id,
        url,
        sort_order,
        alt
      )
    `);
    
  if (pErr) {
    console.error("Error fetching projects:", pErr);
    throw pErr;
  }

  for (const project of projects || []) {
    console.log(`\n📁 Processing project: ${project.slug}`);
    
    for (const img of (project as any).project_images || []) {
      // Skip if already using Supabase Storage
      if (!img.url || /storage\/v1\/object\/public\/media/i.test(img.url)) {
        console.log(`  ⏭️  Skipping already migrated image: ${img.url}`);
        continue;
      }

      try {
        const publicUrl = await ensureUpload("projects", project.slug, img.url, img.sort_order || 1);
        
        // Update the project_images record with the new URL
        const { error: uErr } = await supa
          .from("project_images")
          .update({ url: publicUrl })
          .eq("id", img.id);
          
        if (uErr) {
          console.error(`Error updating image record ${img.id}:`, uErr);
          throw uErr;
        }
        
        console.log(`  ✅ Updated image ${img.id} to use local storage`);
      } catch (error) {
        console.error(`  ❌ Failed to migrate image ${img.id}:`, error);
        // Continue with next image instead of failing completely
      }
    }
  }
}

async function migrateBlogCovers() {
  console.log("\n🔄 Checking for blog cover images...");
  // If you add blog cover images in the future, implement similar logic here
  console.log("  ℹ️  No blog cover images to migrate currently");
}

async function main() {
  try {
    console.log("🚀 Starting image migration to Supabase Storage");
    
    // Ensure the media bucket exists
    const { data: buckets, error: bucketError } = await supa.storage.listBuckets();
    if (bucketError) throw bucketError;
    
    const mediaBucket = buckets?.find(b => b.id === 'media');
    if (!mediaBucket) {
      console.log("📦 Creating media bucket...");
      const { error: createError } = await supa.storage.createBucket('media', { public: true });
      if (createError) throw createError;
    }
    
    await migrateProjectImages();
    await migrateBlogCovers();
    
    console.log("\n✅ Image migration completed successfully!");
  } catch (error) {
    console.error("\n❌ Image migration failed:", error);
    process.exit(1);
  }
}

// Only run if called directly
if (require.main === module) {
  main();
}

export { main as migrateImages };