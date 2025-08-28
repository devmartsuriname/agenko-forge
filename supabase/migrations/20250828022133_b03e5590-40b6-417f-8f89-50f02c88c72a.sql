-- Assign categories to remaining blog posts and add feature images
DO $$
DECLARE
    post_record RECORD;
    digital_marketing_id UUID;
    web_design_id UUID; 
    seo_id UUID;
    branding_id UUID;
    sample_images TEXT[] := ARRAY[
        'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=1200&h=630&fit=crop',
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop', 
        'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=630&fit=crop',
        'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=1200&h=630&fit=crop',
        'https://images.unsplash.com/photo-1559028012-481c04fa702d?w=1200&h=630&fit=crop',
        'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=1200&h=630&fit=crop'
    ];
    image_index INTEGER := 1;
BEGIN
    -- Get category IDs
    SELECT id INTO digital_marketing_id FROM blog_categories WHERE slug = 'digital-marketing';
    SELECT id INTO web_design_id FROM blog_categories WHERE slug = 'web-design';
    SELECT id INTO seo_id FROM blog_categories WHERE slug = 'seo';
    SELECT id INTO branding_id FROM blog_categories WHERE slug = 'branding';
    
    -- Update posts that don't have categories or feature images
    FOR post_record IN 
        SELECT bp.id, bp.title, bp.slug, bp.feature_image_url
        FROM blog_posts bp
        LEFT JOIN blog_post_categories bpc ON bp.id = bpc.blog_post_id
        WHERE bp.status = 'published' 
        AND (bpc.blog_post_id IS NULL OR bp.feature_image_url IS NULL)
        ORDER BY bp.created_at
    LOOP
        -- Add feature image if missing
        IF post_record.feature_image_url IS NULL THEN
            UPDATE blog_posts 
            SET feature_image_url = sample_images[image_index]
            WHERE id = post_record.id;
            
            image_index := image_index + 1;
            IF image_index > array_length(sample_images, 1) THEN
                image_index := 1;
            END IF;
        END IF;
        
        -- Assign categories based on post content/title
        IF post_record.slug LIKE '%seo%' OR post_record.title ILIKE '%seo%' OR post_record.title ILIKE '%search%' THEN
            INSERT INTO blog_post_categories (blog_post_id, category_id) 
            VALUES (post_record.id, seo_id) 
            ON CONFLICT DO NOTHING;
        ELSIF post_record.slug LIKE '%design%' OR post_record.title ILIKE '%design%' OR post_record.title ILIKE '%creative%' OR post_record.title ILIKE '%ui%' OR post_record.title ILIKE '%ux%' THEN
            INSERT INTO blog_post_categories (blog_post_id, category_id) 
            VALUES (post_record.id, web_design_id) 
            ON CONFLICT DO NOTHING;
        ELSIF post_record.title ILIKE '%brand%' OR post_record.title ILIKE '%creative%' OR post_record.title ILIKE '%visual%' THEN
            INSERT INTO blog_post_categories (blog_post_id, category_id) 
            VALUES (post_record.id, branding_id) 
            ON CONFLICT DO NOTHING;
        ELSE
            INSERT INTO blog_post_categories (blog_post_id, category_id) 
            VALUES (post_record.id, digital_marketing_id) 
            ON CONFLICT DO NOTHING;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Successfully assigned categories and feature images to blog posts';
END $$;