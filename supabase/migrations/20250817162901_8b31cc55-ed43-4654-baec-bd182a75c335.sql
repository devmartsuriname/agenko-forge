-- Devmart SQL Toolkit: Add Unique Indexes for Project Images

-- Create unique indexes to prevent future duplicates
CREATE UNIQUE INDEX IF NOT EXISTS ux_project_images_project_sort
    ON project_images (project_id, sort_order);

-- Optional: Prevent duplicate URLs per project
CREATE UNIQUE INDEX IF NOT EXISTS ux_project_images_project_url
    ON project_images (project_id, url)
    WHERE url IS NOT NULL;

-- Verification
DO $$
DECLARE
    total_images int;
    projects_with_images int;
    index_exists boolean;
BEGIN
    -- Get stats
    SELECT COUNT(*) INTO total_images FROM project_images;
    SELECT COUNT(DISTINCT project_id) INTO projects_with_images FROM project_images;
    
    -- Check if unique index exists
    SELECT EXISTS(
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'project_images' 
        AND indexname = 'ux_project_images_project_sort'
    ) INTO index_exists;
    
    RAISE NOTICE 'Total images: %', total_images;
    RAISE NOTICE 'Projects with images: %', projects_with_images;
    RAISE NOTICE 'Unique sort index created: %', index_exists;
    
    IF index_exists THEN
        RAISE NOTICE '✅ SUCCESS: Unique indexes created to prevent duplicate sort values';
    ELSE
        RAISE WARNING '❌ WARNING: Failed to create unique index!';
    END IF;
END $$;