import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Image processing utilities
function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = new OffscreenCanvas(width, height) as any;
  return canvas;
}

async function processImage(
  imageBuffer: ArrayBuffer,
  targetWidth: number,
  targetHeight: number,
  format: string = 'webp',
  quality: number = 0.8
): Promise<ArrayBuffer> {
  // Create image from buffer
  const blob = new Blob([imageBuffer]);
  const imageBitmap = await createImageBitmap(blob);
  
  // Calculate dimensions maintaining aspect ratio with letterboxing
  const sourceRatio = imageBitmap.width / imageBitmap.height;
  const targetRatio = targetWidth / targetHeight;
  
  let drawWidth = targetWidth;
  let drawHeight = targetHeight;
  let offsetX = 0;
  let offsetY = 0;
  
  if (sourceRatio > targetRatio) {
    // Source is wider - letterbox vertically
    drawHeight = targetWidth / sourceRatio;
    offsetY = (targetHeight - drawHeight) / 2;
  } else {
    // Source is taller - letterbox horizontally
    drawWidth = targetHeight * sourceRatio;
    offsetX = (targetWidth - drawWidth) / 2;
  }
  
  // Create canvas and draw
  const canvas = createCanvas(targetWidth, targetHeight);
  const ctx = canvas.getContext('2d');
  
  // Fill with black background for letterboxing
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, targetWidth, targetHeight);
  
  // Draw image
  ctx.drawImage(imageBitmap, offsetX, offsetY, drawWidth, drawHeight);
  
  // Convert to desired format
  const outputBlob = await canvas.convertToBlob({ 
    type: `image/${format}`, 
    quality 
  });
  
  imageBitmap.close();
  return await outputBlob.arrayBuffer();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify user authentication and role
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Authentication failed');
    }

    // Check user role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || !['admin', 'editor'].includes(profile.role)) {
      throw new Error('Insufficient permissions');
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const sectionType = formData.get('sectionType') as string;
    const sectionId = formData.get('sectionId') as string;

    if (!file || !sectionType || !sectionId) {
      throw new Error('Missing required fields: file, sectionType, sectionId');
    }

    // Validate file
    const maxSize = 1.5 * 1024 * 1024; // 1.5MB
    if (file.size > maxSize) {
      throw new Error('File size exceeds 1.5MB limit');
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed');
    }

    console.log(`Processing image for section ${sectionType}:${sectionId}`);

    // Read file buffer
    const imageBuffer = await file.arrayBuffer();

    // Define output variants (maintaining 16:9 aspect ratio)
    const variants = [
      { width: 320, height: 180, suffix: '-sm' },
      { width: 640, height: 360, suffix: '-md' },
      { width: 960, height: 540, suffix: '-lg' },
      { width: 1200, height: 675, suffix: '-xl' }
    ];

    const uploadedFiles: { url: string; width: number; height: number }[] = [];
    
    // Process and upload each variant
    for (const variant of variants) {
      console.log(`Processing variant ${variant.width}x${variant.height}`);
      
      const processedBuffer = await processImage(
        imageBuffer,
        variant.width,
        variant.height,
        'webp',
        0.85
      );

      const fileName = `sections/${sectionType}/${sectionId}${variant.suffix}.webp`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, processedBuffer, {
          contentType: 'image/webp',
          upsert: true,
          cacheControl: '31536000' // 1 year cache
        });

      if (uploadError) {
        console.error(`Upload error for ${fileName}:`, uploadError);
        throw new Error(`Failed to upload ${variant.suffix} variant: ${uploadError.message}`);
      }

      const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(fileName);

      uploadedFiles.push({
        url: urlData.publicUrl,
        width: variant.width,
        height: variant.height
      });

      console.log(`Uploaded variant: ${fileName}`);
    }

    // Generate responsive image data
    const baseUrl = uploadedFiles.find(f => f.width === 1200)?.url || uploadedFiles[uploadedFiles.length - 1].url;
    const srcset = uploadedFiles
      .map(f => `${f.url} ${f.width}w`)
      .join(', ');
    
    const sizes = '(max-width: 640px) 320px, (max-width: 960px) 640px, (max-width: 1200px) 960px, 1200px';

    console.log('Image processing completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        image: {
          src: baseUrl,
          srcset,
          sizes,
          alt: `${sectionType} section image`,
          width: 1200,
          height: 675
        },
        variants: uploadedFiles
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in upload-section-image function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'An unexpected error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});