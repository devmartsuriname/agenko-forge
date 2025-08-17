# Admin QA Checklist - Accessibility Update

## Keyboard Navigation for Sections Editor

### Testing Steps

#### Section Reordering via Keyboard
1. **Navigate to Admin > Pages > Edit Homepage**
   - Go to `/admin/pages` and select "Edit" for the homepage
   - Click on the "Sections" tab

2. **Keyboard Navigation Test**
   - Press `Tab` to focus on the first section
   - Verify the section shows a visible focus ring
   - Press `Enter` to expand/collapse the section editor
   - Use `Ctrl+↑` to move the section up
   - Use `Ctrl+↓` to move the section down
   - Verify screen reader announces position changes

3. **Screen Reader Announcements**
   - Use a screen reader (NVDA, JAWS, or VoiceOver)
   - Move sections and confirm announcements like:
     - "Moved 'Hero Section' up to position 1"
     - "Moved 'Services' down to position 3"

4. **Focus Management**
   - After reordering, verify focus remains on the moved section
   - Tab through all sections to ensure proper focus order
   - Verify keyboard shortcuts are shown in tooltips

### Expected Behaviors

#### Keyboard Shortcuts (Sections Editor)
- `Tab` - Navigate between sections
- `Enter` - Expand/collapse section editor
- `Ctrl+↑` - Move section up
- `Ctrl+↓` - Move section down
- `Escape` - Close expanded editor

#### Screen Reader Announcements
- Section position changes: "Moved '[Section Name]' up to position [X]"
- Editor state: "Expanded '[Section Name]' section editor"
- Remove action: "Removed '[Section Name]' section"

### Acceptance Criteria Met
- ✅ Zero critical axe violations on key routes
- ✅ Sections can be reordered entirely by keyboard
- ✅ Screen reader announces position changes
- ✅ All interactive elements keyboard accessible
- ✅ Proper ARIA patterns implemented
- ✅ Focus management working correctly