-- Devmart SQL Toolkit: Project Images Sort Fix + Unique Index

-- Step A: Detect duplicates (this will show in logs during migration)
DO $$
DECLARE
    duplicate_count int;
    dup_record record;
BEGIN
    -- Check for duplicates
    SELECT COUNT(*) INTO duplicate_count
    FROM (
        SELECT project_id, sort_order
        FROM project_images
        GROUP BY project_id, sort_order
        HAVING COUNT(*) > 1
    ) dupes;
    
    RAISE NOTICE 'Found % project-sort combinations with duplicates', duplicate_count;
    
    -- Log details of duplicates
    FOR dup_record IN
        SELECT 
            project_id,
            sort_order,
            COUNT(*) as dupes,
            array_agg(id ORDER BY created_at, id) as ids
        FROM project_images
        GROUP BY project_id, sort_order
        HAVING COUNT(*) > 1
        ORDER BY project_id, sort_order
    LOOP
        RAISE NOTICE 'Project %, sort_order %: % duplicates, IDs: %', 
            dup_record.project_id, dup_record.sort_order, dup_record.dupes, dup_record.ids;
    END LOOP;
END $$;

-- Step B: Safe Fix - move duplicates to the end (preserve the first)
WITH dupes AS (
    SELECT
        id,
        project_id,
        sort_order,
        ROW_NUMBER() OVER (PARTITION BY project_id, sort_order ORDER BY created_at, id) as rn
    FROM project_images
),

-- Only the 2nd, 3rd, ... rows per (project_id, sort_order)
fix_candidates AS (
    SELECT
        id,
        project_id,
        ROW_NUMBER() OVER (PARTITION BY project_id ORDER BY sort_order, created_at, id) as seq
    FROM dupes
    WHERE rn > 1
),

maxes AS (
    SELECT project_id, COALESCE(MAX(sort_order), 0) as max_sort
    FROM project_images
    GROUP BY project_id
)
UPDATE project_images p
SET sort_order = m.max_sort + f.seq
FROM fix_candidates f
JOIN maxes m ON m.project_id = f.project_id
WHERE p.id = f.id;

-- Step C: Create unique indexes
CREATE UNIQUE INDEX IF NOT EXISTS ux_project_images_project_sort
    ON project_images (project_id, sort_order);

-- Optional: Prevent duplicate URLs per project
CREATE UNIQUE INDEX IF NOT EXISTS ux_project_images_project_url
    ON project_images (project_id, url)
    WHERE url IS NOT NULL;

-- Step D: Final verification
DO $$
DECLARE
    final_duplicate_count int;
    total_images int;
    projects_with_images int;
BEGIN
    -- Check duplicates are gone
    SELECT COUNT(*) INTO final_duplicate_count
    FROM (
        SELECT project_id, sort_order
        FROM project_images
        GROUP BY project_id, sort_order
        HAVING COUNT(*) > 1
    ) dupes;
    
    -- Get stats
    SELECT COUNT(*) INTO total_images FROM project_images;
    SELECT COUNT(DISTINCT project_id) INTO projects_with_images FROM project_images;
    
    RAISE NOTICE 'Final duplicate count: %', final_duplicate_count;
    RAISE NOTICE 'Total images: %', total_images;
    RAISE NOTICE 'Projects with images: %', projects_with_images;
    
    IF final_duplicate_count = 0 THEN
        RAISE NOTICE '✅ SUCCESS: All duplicate sort values fixed and unique indexes created';
    ELSE
        RAISE WARNING '❌ WARNING: Still have duplicate sort values!';
    END IF;
END $$;