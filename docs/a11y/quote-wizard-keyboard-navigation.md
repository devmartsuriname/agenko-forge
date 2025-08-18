# Quote Wizard Accessibility & Keyboard Navigation

## Overview
The Quote Wizard is a multi-step form with comprehensive keyboard navigation support and accessibility features.

## Keyboard Navigation Paths

### Step Navigation
- **Tab**: Move forward through form fields and buttons
- **Shift+Tab**: Move backward through form fields and buttons
- **Enter/Space**: Activate buttons and submit forms
- **Arrow Keys**: Navigate between radio button options in service type and budget/timeline selections

### Step 1: Contact Information
1. **Name field** (required) - Text input with validation
2. **Email field** (required) - Email input with validation
3. **Company field** (optional) - Text input
4. **Phone field** (optional) - Tel input
5. **Next button** - Advances to Step 2

### Step 2: Service Details
1. **Service Type Selection** (required)
   - Use Tab to focus on service cards
   - Use Enter/Space to select a service
   - Arrow keys to navigate between options
   - Visual focus indicators on each card
2. **Project Description** (required)
   - Large textarea with character count
   - Tab to focus, type to enter description
3. **Next/Previous buttons**

### Step 3: Budget & Timeline
1. **Budget Range Selection** (required)
   - Tab through budget option cards
   - Enter/Space to select budget range
   - Arrow keys for navigation
2. **Timeline Selection** (required)
   - Tab through timeline option cards
   - Enter/Space to select timeline
   - Arrow keys for navigation
3. **Next/Previous buttons**

### Step 4: Review & Submit
1. **Additional Requirements** (optional)
   - Textarea for extra project details
2. **Review Information**
   - All form data displayed for review
   - Read-only sections with clear labels
3. **Submit button** - Final form submission

## ARIA Labels and Attributes

### Form Validation
- `aria-invalid`: Set to "true" for fields with validation errors
- `aria-describedby`: Links error messages to form fields
- `role="alert"`: Error messages announce immediately to screen readers

### Progress Indication
- `aria-label`: Step indicator describes current progress
- `aria-current="step"`: Indicates the currently active step
- Step numbers are announced as "Step X of 4"

### Interactive Elements
- All buttons have descriptive `aria-label` attributes
- Form fields have associated `label` elements
- Required fields are marked with `aria-required="true"`
- Selection cards have `role="radio"` and `aria-checked` states

### Status Updates
- Form submission status announced via `aria-live` regions
- Success/error messages immediately communicated to screen readers
- Loading states have appropriate `aria-busy` attributes

## Screen Reader Support

### Announcement Patterns
- Step changes: "Step 2 of 4: Service Details"
- Validation errors: "Error: Email is required"
- Form submission: "Submitting quote request..."
- Success: "Quote request submitted successfully"

### Content Structure
- Semantic headings (h1, h2, h3) for proper document outline
- Lists for grouped options (service types, budget ranges)
- Clear form field associations with labels
- Meaningful link text for navigation

## Focus Management

### Focus Indicators
- High contrast focus rings on all interactive elements
- Focus visible on keyboard navigation only (not mouse clicks)
- Focus trapped within modal dialogs when applicable

### Focus Flow
- Linear tab order through each step
- Focus moves to first field when advancing steps
- Focus returns to triggering element when going back
- Skip links available for complex sections

## Error Handling

### Validation Feedback
- Inline validation on field blur
- Error summaries at step level
- Clear, actionable error messages
- Errors announced immediately to screen readers

### Error Recovery
- Clear instructions for fixing validation errors
- Focus moved to first error field on submission
- Persistent error state until resolved

## Color and Contrast

### Visual Design
- Minimum 4.5:1 contrast ratio for all text
- Focus indicators with 3:1 contrast minimum
- Error states use both color and iconography
- No color-only information conveyance

### Dark Mode Support
- All accessibility features work in both light and dark themes
- Appropriate contrast maintained across theme changes
- Focus indicators visible in all color schemes

## Testing Checklist

### Manual Testing
- [ ] Complete form using only keyboard
- [ ] Navigate backward and forward between steps
- [ ] Test with screen reader (NVDA, JAWS, VoiceOver)
- [ ] Verify focus management throughout flow
- [ ] Test form validation and error states
- [ ] Verify all interactive elements are reachable

### Automated Testing
- [ ] axe-core accessibility audit passes
- [ ] Wave tool reports no errors
- [ ] Lighthouse accessibility score 95+
- [ ] All ARIA attributes validated

## Browser Support
- Chrome/Chromium (including Edge)
- Firefox
- Safari (macOS and iOS)
- Mobile browsers with assistive technology

## Assistive Technology Tested
- NVDA (Windows)
- JAWS (Windows)
- VoiceOver (macOS/iOS)
- TalkBack (Android)
- Dragon NaturallySpeaking (Voice Control)