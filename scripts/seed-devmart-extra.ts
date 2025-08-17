import { createClient } from "@supabase/supabase-js";
import seed from "../seed/devmart_seed_extra.json";

const url = process.env.SUPABASE_URL!;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY!; // server-side only
const db = createClient(url, service);

async function upsertBlog() {
  console.log("🔄 Upserting blog posts...");
  
  for (const post of seed.blog_posts) {
    try {
      const { error } = await db.from("blog_posts").upsert(
        {
          ...post,
          published_at: post.status === "published" ? new Date().toISOString() : null
        },
        { onConflict: "slug" }
      );
      
      if (error) {
        console.error(`Error upserting blog post "${post.slug}":`, error);
        throw error;
      }
      
      console.log(`  ✅ Upserted blog post: ${post.slug}`);
    } catch (error) {
      console.error(`Failed to upsert blog post "${post.slug}":`, error);
      throw error;
    }
  }
}

async function upsertProjects() {
  console.log("\n🔄 Upserting projects...");
  
  for (const project of seed.projects) {
    try {
      // Upsert the project first
      const { data: proj, error: projErr } = await db
        .from("projects")
        .upsert(
          {
            slug: project.slug,
            title: project.title,
            excerpt: project.excerpt,
            body: project.body,
            status: project.status,
            tags: project.tags,
            published_at: project.status === "published" ? new Date().toISOString() : null
          },
          { onConflict: "slug" }
        )
        .select("id")
        .single();
        
      if (projErr) {
        console.error(`Error upserting project "${project.slug}":`, projErr);
        throw projErr;
      }
      
      console.log(`  ✅ Upserted project: ${project.slug}`);
      
      // Upsert images with unique (project_id, sort_order) constraint
      for (const img of project.images || []) {
        try {
          const { error: iErr } = await db
            .from("project_images")
            .upsert(
              {
                project_id: proj!.id,
                url: img.url,
                sort_order: img.sort ?? 1,
                alt: img.alt ?? null
              },
              { onConflict: "project_id,sort_order" }
            );
            
          if (iErr) {
            console.error(`Error upserting image for project "${project.slug}":`, iErr);
            throw iErr;
          }
          
          console.log(`    📷 Upserted image: ${img.alt || 'untitled'}`);
        } catch (error) {
          console.error(`Failed to upsert image for project "${project.slug}":`, error);
          // Continue with next image instead of failing completely
        }
      }
    } catch (error) {
      console.error(`Failed to upsert project "${project.slug}":`, error);
      throw error;
    }
  }
}

async function verifyData() {
  console.log("\n🔍 Verifying seeded data...");
  
  // Check blog posts count
  const { count: blogCount, error: blogErr } = await db
    .from("blog_posts")
    .select("*", { count: "exact", head: true })
    .eq("status", "published");
    
  if (blogErr) {
    console.error("Error counting blog posts:", blogErr);
  } else {
    console.log(`  📝 Published blog posts: ${blogCount}`);
  }
  
  // Check projects count
  const { count: projectCount, error: projectErr } = await db
    .from("projects")
    .select("*", { count: "exact", head: true })
    .eq("status", "published");
    
  if (projectErr) {
    console.error("Error counting projects:", projectErr);
  } else {
    console.log(`  🏗️  Published projects: ${projectCount}`);
  }
  
  // Check if we have enough for lg=3 carousel
  if ((blogCount || 0) >= 6 && (projectCount || 0) >= 6) {
    console.log("  ✅ Sufficient content for homepage carousels (lg=3)");
  } else {
    console.log("  ⚠️  May need more content for optimal carousel display");
  }
}

async function main() {
  try {
    console.log("🚀 Starting Devmart seed boost...");
    
    await upsertBlog();
    await upsertProjects();
    await verifyData();
    
    console.log("\n✅ Seed boost completed successfully!");
    console.log("💡 Homepage carousels should now display with sufficient content");
  } catch (error) {
    console.error("\n❌ Seed boost failed:", error);
    process.exit(1);
  }
}

// Only run if called directly
if (require.main === module) {
  main();
}

export { main as seedDevmartExtra };