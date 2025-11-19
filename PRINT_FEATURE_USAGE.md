# Print/Export Feature - Usage Guide

## Overview

The Print/Export feature allows users to generate, download, share, and print their complete pilgrimage journal as a professional PDF document.

## Files Created

### 1. `/home/user/Pilgrimage_Journal/src/views/Print.tsx`
Main Print/Export view component (762 lines)

### 2. `/home/user/Pilgrimage_Journal/src/utils/pdfHelpers.ts`
Helper functions for PDF generation (142 lines)

### 3. Updated: `/home/user/Pilgrimage_Journal/src/views/index.ts`
Added Print export to the views index

## Features

### View Structure

#### Top Bar
- **Back button**: Returns to the previous view
- **Title**: "Export Journal"

#### Content Section

**Export Preview:**
- Print icon (🖨️)
- Title: "Pilgrimage Journal"
- Description
- **Statistics Grid**:
  - Total sites visited (sites with notes)
  - Total text notes
  - Total photos
  - Total audio recordings

**Export Options (Checkboxes):**
- ✅ Include site information and quotes
- ⬜ Include images (note: increases file size)
- ⬜ Include audio transcripts (if available)
- ✅ Include table of contents
- ✅ Include timestamps

**Generation Button:**
- Large primary button: "Generate PDF Journal"
- Shows loading spinner during generation
- Disabled during generation or when no notes exist

### After Generation

Once PDF is generated, users see:
- ✅ Success message
- **Download** button - Downloads PDF file
- **Share** button - Uses Web Share API if available
- **Print** button - Opens print dialog
- **Generate New PDF** button - Resets to generate another

## PDF Content Structure

### 1. Cover Page
- Title: "Pilgrimage Journal"
- Subtitle: "A Spiritual Journey"
- Date range of pilgrimage
- Generated date

### 2. Table of Contents (if enabled)
- Lists all sites with page numbers
- Dotted lines connecting sites to page numbers
- Section for each site visited

### 3. For Each Site (sorted by index)
- **Site Header**:
  - Site name (18pt bold)
  - City (12pt italic)

- **Site Information** (if enabled):
  - Quote (10pt italic, indented)
  - Reference (9pt)
  - Address (9pt)

- **Text Notes**:
  - Note title (11pt bold)
  - Timestamp (8pt italic, if enabled)
  - Note content (10pt, HTML converted to plain text)

- **Photos**:
  - Photo title (11pt bold)
  - Timestamp (8pt italic, if enabled)
  - Image (if "Include images" is checked)

- **Audio Notes**:
  - Note title (11pt bold)
  - Timestamp (8pt italic, if enabled)
  - "[Audio Recording - Not playable in PDF]" note

### 4. Footer on Each Page
- "Pilgrim Notes" watermark (left)
- Page number (right)

## Usage Example

To navigate to the Print view from anywhere in the app:

```typescript
import { navigationStore } from '../stores/navigationStore';
import Print from '../views/Print';

// Navigate to Print view
const handlePrintExport = () => {
  navigationStore.push(<Print />);
};
```

### Adding a Print Button to NotesList

Add this button to the NotesList view:

```typescript
<button
  onClick={() => navigationStore.push(<Print />)}
  class="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors flex items-center gap-2"
>
  <span>🖨️</span>
  <span>Export Journal</span>
</button>
```

## Helper Functions

### `stripHtml(html: string): string`
Converts HTML content to plain text for PDF rendering.

**Example:**
```typescript
const plainText = stripHtml('<p><strong>Hello</strong> World</p>');
// Returns: "Hello World"
```

### `groupNotesBySite(textNotes, audioNotes, imageNotes, sites)`
Organizes all notes by their associated site, sorted by site index.

**Returns:**
```typescript
[
  {
    site: Site,
    textNotes: TextNote[],
    audioNotes: AudioNote[],
    imageNotes: ImageNote[]
  },
  ...
]
```

### `calculateStats(textNotes, audioNotes, imageNotes)`
Computes statistics about the notes collection.

**Returns:**
```typescript
{
  totalSites: number,
  totalTextNotes: number,
  totalAudioNotes: number,
  totalImageNotes: number,
  totalNotes: number
}
```

### `getDateRange(textNotes, audioNotes, imageNotes): string`
Generates a formatted date range string for the cover page.

**Example output:**
- "January 15, 2025 - January 20, 2025"
- "January 15, 2025" (if all notes on same day)
- "No notes" (if no notes exist)

### `formatTimestamp(dateString: string): string`
Formats ISO date strings for display in PDF.

**Example:**
```typescript
formatTimestamp("2025-01-15T14:30:00.000Z")
// Returns: "Jan 15, 2025, 2:30 PM"
```

## Dependencies

Already installed in `pwa-package.json`:
- ✅ `jspdf` (^2.5.2) - PDF generation
- ✅ `solid-toast` (^0.5.0) - Toast notifications
- ✅ `uuid` (^10.0.0) - Not directly used but available
- ✅ `idb` (^8.0.0) - IndexedDB wrapper (used indirectly)

## Technical Implementation Details

### PDF Generation Process

1. **Data Loading**: Loads all notes and image blobs from IndexedDB
2. **PDF Initialization**: Creates jsPDF instance with default A4 settings
3. **Cover Page**: Renders title, subtitle, date range, and generation date
4. **Table of Contents**: Lists sites with page numbers (updated after content generation)
5. **Content Pages**:
   - Iterates through sites (sorted by index)
   - Renders site information, quotes, address
   - Renders all notes for each site
   - Handles page breaks automatically
   - Adds footers to each page
6. **Blob Creation**: Converts PDF to Blob for download/share

### Loading State Management

```typescript
const [loading, setLoading] = createSignal(true);        // Initial data loading
const [generating, setGenerating] = createSignal(false); // PDF generation
const [generatedPDF, setGeneratedPDF] = createSignal<Blob | null>(null);
```

### Export Options State

```typescript
interface ExportOptions {
  includeSiteInfo: boolean;         // Default: true
  includeImages: boolean;           // Default: false (file size concern)
  includeAudioTranscripts: boolean; // Default: false (not yet implemented)
  includeTableOfContents: boolean;  // Default: true
  includeTimestamps: boolean;       // Default: true
}
```

### Web Share API

The share functionality uses the modern Web Share API with feature detection:

```typescript
if (navigator.share && navigator.canShare({ files: [file] })) {
  await navigator.share({
    title: 'My Pilgrimage Journal',
    text: 'My spiritual journey',
    files: [file]
  });
}
```

**Browser Support:**
- ✅ Chrome/Edge on Android
- ✅ Safari on iOS
- ⚠️ Limited desktop support
- ❌ Firefox (limited)

### Print Functionality

Opens the PDF in a hidden iframe and triggers the browser's print dialog:

```typescript
const iframe = document.createElement('iframe');
iframe.style.display = 'none';
iframe.src = url;
document.body.appendChild(iframe);
iframe.onload = () => {
  iframe.contentWindow?.print();
};
```

## Error Handling

- **Loading Errors**: Shows toast notification and logs to console
- **Generation Errors**: Shows toast notification and maintains state
- **Image Loading Errors**: Displays "[Image could not be loaded]" in PDF
- **Share API Errors**: Provides helpful error messages for unsupported features

## Performance Considerations

1. **Image Blobs**: Loaded once on mount and cached in state
2. **Large PDFs**: Generation happens synchronously; may take 5-10 seconds for journals with many sites
3. **File Size**: Including images significantly increases file size (can be 10-50MB+)
4. **Memory**: Large image collections may cause memory issues on low-end devices

## Future Enhancements

- [ ] Audio transcription support
- [ ] Custom PDF themes/templates
- [ ] Date range filtering
- [ ] Site selection (choose which sites to include)
- [ ] Progress indicator during generation
- [ ] Background generation using Web Workers
- [ ] PDF preview before download
- [ ] Custom cover page with user photo
- [ ] Batch export (multiple PDFs, one per site)

## Styling

The view uses Tailwind CSS classes consistent with the rest of the application:
- Clean, card-based layout
- Responsive design
- Blue primary color scheme (#2563eb)
- Gray scale for secondary elements
- Hover and active states for interactive elements

## Accessibility

- Proper semantic HTML
- Keyboard navigation support
- Disabled states clearly indicated
- Screen reader friendly labels
- High contrast text
- Focus indicators on interactive elements
