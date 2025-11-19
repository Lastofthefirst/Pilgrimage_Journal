# Print/Export Feature - Integration Example

## Quick Start

To add the Print/Export feature to your app, simply add a button that navigates to the Print view.

## Example 1: Add Export Button to NotesList Top Bar

Add this button to the top bar in `/home/user/Pilgrimage_Journal/src/views/NotesList.tsx`:

```typescript
// At the top of the file, add the import
import Print from './Print';

// In the component, after the search bar (around line 174):
<div class="relative">
  <input
    type="text"
    placeholder={viewMode() === 'notes' ? 'Search notes...' : 'Search sites...'}
    value={searchQuery()}
    onInput={(e) => setSearchQuery(e.currentTarget.value)}
    class="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  />
  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
</div>

{/* ADD THIS EXPORT BUTTON */}
<button
  onClick={() => navigationStore.push(<Print />)}
  class="mt-3 w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors flex items-center justify-center gap-2"
>
  <span>🖨️</span>
  <span>Export Journal</span>
</button>
```

## Example 2: Add Export Option to Settings Menu

If you have a settings or menu view, add this option:

```typescript
import { navigationStore } from '../stores/navigationStore';
import Print from '../views/Print';

const SettingsMenu = () => {
  return (
    <div class="space-y-2">
      {/* Other menu items */}

      <button
        onClick={() => navigationStore.push(<Print />)}
        class="w-full flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm hover:bg-gray-50 active:bg-gray-100 transition-colors"
      >
        <span class="text-2xl">🖨️</span>
        <div class="flex-1 text-left">
          <div class="font-medium text-gray-900">Export Journal</div>
          <div class="text-sm text-gray-600">
            Generate PDF of your pilgrimage
          </div>
        </div>
      </button>
    </div>
  );
};
```

## Example 3: Add Export FAB on Sites View

Add a floating action button on the Sites view:

```typescript
import Print from '../views/Print';

// Add this near the bottom of the Sites component (after the main content)
<button
  onClick={() => navigationStore.push(<Print />)}
  class="fixed bottom-20 right-6 w-14 h-14 bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-green-700 active:bg-green-800 transition-colors"
  aria-label="Export journal"
  title="Export Journal"
>
  🖨️
</button>
```

## Example 4: Add to NotesList View Mode Toggle Area

Replace or add alongside the view mode toggle in NotesList:

```typescript
<div class="flex gap-2 mb-3">
  <button
    onClick={() => setViewMode('notes')}
    class={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
      viewMode() === 'notes'
        ? 'bg-blue-600 text-white'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`}
  >
    Notes View
  </button>
  <button
    onClick={() => setViewMode('sites')}
    class={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
      viewMode() === 'sites'
        ? 'bg-blue-600 text-white'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`}
  >
    Sites View
  </button>

  {/* ADD THIS EXPORT BUTTON */}
  <button
    onClick={() => navigationStore.push(<Print />)}
    class="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 active:bg-green-800 transition-colors flex items-center gap-1"
    title="Export Journal"
  >
    <span>🖨️</span>
    <span class="hidden sm:inline">Export</span>
  </button>
</div>
```

## Example 5: Add to Site Page

Add an export button to individual site pages to export just that site (you'd need to modify Print.tsx to accept a site prop):

```typescript
// In SitePage.tsx, add this button in the quick actions section:
<button
  onClick={() => navigationStore.push(<Print />)}
  class="flex flex-col items-center gap-2 py-4 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 active:bg-orange-200 transition-colors col-span-3"
>
  <span class="text-3xl">🖨️</span>
  <span class="text-sm font-medium">Export All Notes</span>
</button>
```

## Testing the Integration

After adding the button:

1. **Start the dev server**: `npm run dev` (if not already running)
2. **Navigate to the NotesList** or wherever you added the button
3. **Click the Export button** to open the Print view
4. **Review the statistics** showing your notes count
5. **Configure export options** using the checkboxes
6. **Click "Generate PDF Journal"** to create the PDF
7. **Download, Share, or Print** the generated PDF

## Recommended Placement

For the best user experience, we recommend:

1. **Primary location**: Add to the NotesList top bar (after search)
2. **Secondary location**: Add as a menu item in settings/options
3. **Optional**: Add a FAB on the Sites view for quick access

## Full Example: Modified NotesList Top Bar

Here's a complete example of the top bar section with an Export button:

```typescript
{/* Top Bar */}
<div class="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
  <h1 class="text-2xl font-bold text-gray-900 mb-3">Pilgrim Notes</h1>

  {/* View Mode Toggle */}
  <div class="flex gap-2 mb-3">
    <button
      onClick={() => setViewMode('notes')}
      class={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
        viewMode() === 'notes'
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      Notes View
    </button>
    <button
      onClick={() => setViewMode('sites')}
      class={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
        viewMode() === 'sites'
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      Sites View
    </button>
  </div>

  {/* Search Bar */}
  <div class="relative mb-3">
    <input
      type="text"
      placeholder={viewMode() === 'notes' ? 'Search notes...' : 'Search sites...'}
      value={searchQuery()}
      onInput={(e) => setSearchQuery(e.currentTarget.value)}
      class="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
  </div>

  {/* Export Journal Button */}
  <Show when={allNotes() && (allNotes()!.text.length > 0 || allNotes()!.audio.length > 0 || allNotes()!.image.length > 0)}>
    <button
      onClick={() => navigationStore.push(<Print />)}
      class="w-full py-2 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 active:bg-green-800 transition-colors flex items-center justify-center gap-2"
    >
      <span>🖨️</span>
      <span>Export Journal as PDF</span>
    </button>
  </Show>
</div>
```

This example also includes a `<Show>` component to only display the export button when there are notes to export.

## Note About Dependencies

All required dependencies are already installed:
- ✅ `jspdf` - For PDF generation
- ✅ `solid-toast` - For toast notifications
- ✅ `idb` - For database access

No additional installation is needed!

## Customization

To customize the PDF appearance, edit these values in `/home/user/Pilgrimage_Journal/src/views/Print.tsx`:

```typescript
// PDF settings (around line 108)
const pageWidth = doc.internal.pageSize.getWidth();
const pageHeight = doc.internal.pageSize.getHeight();
const margin = 20;  // Change this to adjust margins
const contentWidth = pageWidth - 2 * margin;

// Font sizes (throughout the file)
doc.setFontSize(32);  // Cover title
doc.setFontSize(18);  // Site headers
doc.setFontSize(10);  // Body text
```

## Troubleshooting

**Issue: Export button doesn't appear**
- Make sure you imported Print: `import Print from './Print';`
- Check that the button is inside the component's return statement

**Issue: PDF generation fails**
- Check browser console for errors
- Ensure all notes are loading correctly
- Try disabling "Include images" option if file is too large

**Issue: Share button doesn't work**
- Web Share API is not supported on all browsers/platforms
- The error message will indicate if sharing is not supported
- Users can still download and manually share the PDF

**Issue: Images not showing in PDF**
- Make sure "Include images" option is checked
- Check that image blobs are loading correctly from IndexedDB
- Try with fewer images if memory issues occur
