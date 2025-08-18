# Storage Orphan Management

## Overview

The storage orphan scanner is an automated system that identifies files in Supabase Storage that are no longer referenced by any database records. This helps maintain a clean storage bucket and manage storage costs.

## How It Works

### Automated Scanning

The system runs daily at 2:00 AM UTC via a scheduled cron job that:

1. **Lists all files** in the `media` storage bucket (including subdirectories)
2. **Cross-references** against database tables:
   - `project_images.url` - Project gallery images
   - `pages.body` - Section images in page layouts
   - `blog_posts.body` - Images embedded in blog content
   - `services.content` - Images in service descriptions
   - `projects.body` - Images in project details

3. **Identifies orphans** - Files that exist in storage but have no database references
4. **Logs results** to `logs_app_events` with area `storage-orphan-scan`

### Log Structure

**Summary Log** (`area: storage-orphan-scan`):
```json
{
  "total_files": 150,
  "referenced_files": 142,
  "orphaned_count": 8,
  "scan_duration_ms": 2500,
  "orphaned_files": ["sections/hero/old-image.webp", "..."],
  "scan_timestamp": "2025-01-17T02:00:00.000Z"
}
```

**Detail Logs** (`area: storage-orphan-scan-detail`):
- Contains chunks of orphaned file lists when there are many orphans
- Each chunk contains up to 100 file paths

## Manual Review Process

### 1. Check Scan Results

Query recent scan results:
```sql
SELECT 
  ts,
  message,
  meta->>'orphaned_count' as orphan_count,
  meta->>'total_files' as total_files
FROM logs_app_events 
WHERE area = 'storage-orphan-scan' 
ORDER BY ts DESC 
LIMIT 10;
```

### 2. Review Orphaned Files

Get detailed list of orphaned files:
```sql
SELECT 
  ts,
  meta->'files' as orphaned_files
FROM logs_app_events 
WHERE area = 'storage-orphan-scan-detail' 
  AND ts > NOW() - INTERVAL '7 days'
ORDER BY ts DESC;
```

### 3. Manual Verification

Before deleting any files, manually verify they are truly orphaned:

1. **Check file URLs** - Search for the file path in your database:
   ```sql
   -- Search across all text/jsonb columns for file references
   SELECT 'project_images' as table_name, id, url 
   FROM project_images 
   WHERE url LIKE '%filename.webp%'
   
   UNION ALL
   
   SELECT 'pages' as table_name, id, body::text 
   FROM pages 
   WHERE body::text LIKE '%filename.webp%'
   
   -- Add similar queries for other tables
   ```

2. **Check recent uploads** - Ensure files weren't uploaded after the last scan
3. **Verify file importance** - Some files might be referenced in ways the scanner doesn't detect

### 4. Safe Deletion Process

**⚠️ IMPORTANT: Always backup before deleting files!**

#### Option 1: Supabase Dashboard
1. Go to [Storage Dashboard](https://supabase.com/dashboard/project/dvgubqqjvmsepkilnkak/storage/buckets/media)
2. Navigate to the file location
3. Select and delete individual files

#### Option 2: SQL (via storage API)
```sql
-- Delete a single file
SELECT storage.delete_object('media', 'path/to/orphaned-file.webp');

-- Delete multiple files (be very careful!)
SELECT storage.delete_object('media', file_path)
FROM unnest(ARRAY[
  'sections/hero/old-image-1.webp',
  'sections/hero/old-image-2.webp'
]) AS file_path;
```

#### Option 3: Batch Delete Script
For large cleanups, you can create a one-time edge function:

```typescript
// Delete orphaned files in batches
const orphanedFiles = ['file1.webp', 'file2.webp', /*...*/];

for (const filePath of orphanedFiles) {
  const { error } = await supabase.storage
    .from('media')
    .remove([filePath]);
  
  if (error) {
    console.error(`Failed to delete ${filePath}:`, error);
  } else {
    console.log(`Deleted: ${filePath}`);
  }
}
```

## Manual Scan Trigger

You can manually trigger a scan by calling the edge function:

```bash
curl -X POST https://dvgubqqjvmsepkilnkak.supabase.co/functions/v1/storage-orphan-scan \
  -H "Content-Type: application/json" \
  -d '{"manual_trigger": true}'
```

## False Positives

The scanner might report false positives in these cases:

1. **Recently uploaded files** - Files uploaded between scans
2. **External references** - Files referenced outside the database
3. **Temporary files** - Files used in frontend state but not yet saved
4. **Backup files** - Intentionally kept files for rollback purposes

## Best Practices

1. **Review regularly** - Check scan results weekly
2. **Delete conservatively** - When in doubt, keep the file
3. **Test first** - Try deleting one file and verify no issues
4. **Monitor after deletion** - Watch for broken images after cleanup
5. **Keep backups** - Always backup before bulk deletions

## Troubleshooting

### Scanner Not Running
- Check cron job status: `SELECT * FROM cron.job WHERE jobname = 'daily-storage-orphan-scan';`
- Check function logs: [Edge Function Logs](https://supabase.com/dashboard/project/dvgubqqjvmsepkilnkak/functions/storage-orphan-scan/logs)

### High Orphan Count
- Review recent changes to content structure
- Check if bulk deletions occurred in database
- Verify file upload processes are updating references

### Missing Files After Deletion
1. Check recent scan logs for the file
2. Restore from backup if available
3. Re-upload the file if necessary

## Configuration

### Changing Scan Schedule
To modify the scan frequency, update the cron job:

```sql
-- Change to run twice daily (6 AM and 6 PM UTC)
SELECT cron.unschedule('daily-storage-orphan-scan');
SELECT cron.schedule(
  'twice-daily-storage-orphan-scan',
  '0 6,18 * * *',
  $$...$$
);
```

### Excluding Paths
To exclude certain paths from orphan detection, modify the edge function to filter out specific patterns before checking for orphans.