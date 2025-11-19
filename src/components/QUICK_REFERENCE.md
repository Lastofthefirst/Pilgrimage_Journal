# Component Quick Reference

## Import Syntax

```tsx
// Import all components
import { Button, Card, Input, SearchBar, Modal, Fab } from '@/components';

// Import with icons
import { AddNote, Save, Trashcan, Map, Location } from '@/components/icons';

// Import types
import type { ButtonProps, CardProps, ModalProps } from '@/components';
```

---

## Button - Common Patterns

```tsx
// Primary action
<Button variant="primary">Save</Button>

// Secondary action
<Button variant="secondary">Cancel</Button>

// Outline button
<Button variant="outline">Learn More</Button>

// With icon (left)
<Button icon={<AddNote />}>Add Note</Button>

// With icon (right)
<Button icon={<Save />} iconPosition="right">Save</Button>

// Icon only
<Button icon={<Map />} />

// Full width
<Button fullWidth>Continue</Button>

// Disabled
<Button disabled>Processing...</Button>

// Different sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
```

---

## Card - Common Patterns

```tsx
// Basic card
<Card title="My Note">
  <p>Content goes here</p>
</Card>

// Card with image
<Card
  image="/images/site.jpg"
  imageAlt="Holy Site"
  title="Church of the Nativity"
>
  <p>A beautiful place...</p>
</Card>

// Clickable card (for notes/sites)
<Card
  title="My Reflection"
  onClick={() => handleOpenNote(noteId)}
>
  <div>
    <p class="text-sm text-gray-600">Sea of Galilee</p>
    <p class="text-gray-700">Today I visited...</p>
  </div>
</Card>

// Card with custom padding
<Card padding="lg">
  <div>Large padding content</div>
</Card>

// Card without hover effect
<Card hoverable={false}>
  <p>Static card</p>
</Card>
```

---

## Input - Common Patterns

```tsx
const [value, setValue] = createSignal('');
const [error, setError] = createSignal('');

// Basic input
<Input
  label="Title"
  placeholder="Enter title"
  fullWidth
/>

// With validation
<Input
  label="Email"
  type="email"
  value={value()}
  onInput={(e) => setValue(e.currentTarget.value)}
  error={error()}
  fullWidth
/>

// With helper text
<Input
  label="Password"
  type="password"
  helperText="Must be at least 8 characters"
  fullWidth
/>

// With icon
<Input
  label="Search"
  leftIcon={<SearchIcon />}
  placeholder="Search..."
/>

// Disabled
<Input
  label="Created Date"
  value="11/19/2025"
  disabled
/>
```

---

## SearchBar - Common Patterns

```tsx
const [search, setSearch] = createSignal('');

// Basic search
<SearchBar
  value={search()}
  onInput={(e) => setSearch(e.currentTarget.value)}
  onClear={() => setSearch('')}
/>

// Custom placeholder
<SearchBar
  placeholder="Search notes and sites..."
  value={search()}
  onInput={(e) => setSearch(e.currentTarget.value)}
  onClear={() => setSearch('')}
/>

// Without clear button
<SearchBar
  placeholder="Type to search..."
  clearable={false}
/>
```

---

## Modal - Common Patterns

```tsx
const [isOpen, setIsOpen] = createSignal(false);

// Basic modal
<Modal
  isOpen={isOpen()}
  onClose={() => setIsOpen(false)}
  title="Confirm"
>
  <p>Are you sure?</p>
</Modal>

// Modal with footer actions
<Modal
  isOpen={isOpen()}
  onClose={() => setIsOpen(false)}
  title="Delete Note"
  footer={
    <div class="flex justify-end gap-2">
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button onClick={handleDelete}>
        Delete
      </Button>
    </div>
  }
>
  <p>This action cannot be undone.</p>
</Modal>

// Large modal
<Modal
  isOpen={isOpen()}
  onClose={() => setIsOpen(false)}
  title="Edit Note"
  size="lg"
>
  <form>
    <Input label="Title" fullWidth />
    <Input label="Content" fullWidth />
  </form>
</Modal>

// Modal without close button
<Modal
  isOpen={isOpen()}
  onClose={() => setIsOpen(false)}
  showCloseButton={false}
  closeOnBackdrop={false}
  closeOnEscape={false}
>
  <p>Must click button to close</p>
  <Button onClick={() => setIsOpen(false)}>OK</Button>
</Modal>
```

---

## Fab - Common Patterns

```tsx
// Basic FAB (bottom-right)
<Fab
  icon={<AddNote />}
  onClick={handleAddNote}
/>

// Extended FAB with label
<Fab
  icon={<AddNote />}
  label="Add Note"
  extended
  onClick={handleAddNote}
/>

// Different positions
<Fab icon={<Map />} position="bottom-left" />
<Fab icon={<Help />} position="top-right" />
<Fab icon={<Menu />} position="top-left" />

// Different sizes
<Fab icon={<AddNote />} size="sm" />
<Fab icon={<AddNote />} size="md" />
<Fab icon={<AddNote />} size="lg" />

// Disabled
<Fab
  icon={<Save />}
  label="Saving..."
  extended
  disabled
/>
```

---

## Real-World Examples

### Note List View

```tsx
import { SearchBar, Card, Fab } from '@/components';
import { AddNote, Location } from '@/components/icons';
import { createSignal, For } from 'solid-js';

const NotesList = () => {
  const [search, setSearch] = createSignal('');
  const [notes, setNotes] = createSignal([...]);

  return (
    <div class="h-full flex flex-col">
      {/* Header with search */}
      <div class="bg-[#015D7C] p-4">
        <h1 class="text-white text-2xl font-bold mb-4">My Notes</h1>
        <SearchBar
          value={search()}
          onInput={(e) => setSearch(e.currentTarget.value)}
          onClear={() => setSearch('')}
        />
      </div>

      {/* Notes grid */}
      <div class="flex-1 overflow-y-auto p-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <For each={notes()}>
            {(note) => (
              <Card
                title={note.title}
                onClick={() => openNote(note.id)}
              >
                <div class="space-y-2">
                  <div class="flex items-center gap-2 text-sm text-gray-600">
                    <Location class="w-4 h-4" />
                    <span>{note.site}</span>
                  </div>
                  <p class="text-gray-700 line-clamp-3">{note.body}</p>
                </div>
              </Card>
            )}
          </For>
        </div>
      </div>

      {/* Add button */}
      <Fab
        icon={<AddNote />}
        label="Add Note"
        extended
        onClick={handleAddNote}
      />
    </div>
  );
};
```

### Create Note Form

```tsx
import { Input, Button, Modal } from '@/components';
import { Save } from '@/components/icons';
import { createSignal } from 'solid-js';

const CreateNoteModal = (props) => {
  const [title, setTitle] = createSignal('');
  const [content, setContent] = createSignal('');
  const [errors, setErrors] = createSignal({});

  const handleSubmit = () => {
    // Validate and save
    if (!title()) {
      setErrors({ title: 'Title is required' });
      return;
    }
    props.onSave({ title: title(), content: content() });
  };

  return (
    <Modal
      isOpen={props.isOpen}
      onClose={props.onClose}
      title="Create New Note"
      size="lg"
      footer={
        <div class="flex justify-end gap-2">
          <Button variant="outline" onClick={props.onClose}>
            Cancel
          </Button>
          <Button icon={<Save />} onClick={handleSubmit}>
            Save Note
          </Button>
        </div>
      }
    >
      <div class="space-y-4">
        <Input
          label="Title"
          value={title()}
          onInput={(e) => setTitle(e.currentTarget.value)}
          error={errors().title}
          placeholder="Enter note title"
          fullWidth
        />
        <Input
          label="Content"
          value={content()}
          onInput={(e) => setContent(e.currentTarget.value)}
          placeholder="Write your reflection..."
          fullWidth
        />
      </div>
    </Modal>
  );
};
```

### Site Details View

```tsx
import { Card, Button } from '@/components';
import { Map, Star } from '@/components/icons';

const SiteDetails = (props) => {
  return (
    <div class="p-4">
      <Card
        image={props.site.image}
        imageAlt={props.site.name}
        padding="lg"
      >
        <h1 class="text-2xl font-bold mb-2">{props.site.name}</h1>
        <p class="text-gray-600 mb-4">{props.site.city}</p>

        <div class="bg-gray-50 p-4 rounded-lg mb-4">
          <p class="italic">"{props.site.quote}"</p>
          <p class="text-sm text-gray-600 mt-2">{props.site.reference}</p>
        </div>

        <div class="flex gap-2">
          <Button icon={<Map />} onClick={handleShowMap}>
            Show on Map
          </Button>
          <Button icon={<Star />} variant="outline" onClick={handleFavorite}>
            Add to Favorites
          </Button>
        </div>
      </Card>
    </div>
  );
};
```

---

## Styling Tips

### Custom Classes

All components accept a `class` prop for custom styling:

```tsx
<Button class="mt-4 custom-class">Click Me</Button>
<Card class="my-custom-card">Content</Card>
```

### Theme Colors

Use the brand colors in your custom styles:

```tsx
<div class="bg-[#015D7C] text-white">
  <Button variant="secondary">Contrasting Button</Button>
</div>
```

### Responsive Design

Use Tailwind responsive utilities:

```tsx
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card>Card 1</Card>
  <Card>Card 2</Card>
  <Card>Card 3</Card>
</div>
```

---

## Common Gotchas

1. **Modal z-index**: Modals use `z-50` - ensure other fixed elements use lower z-index
2. **FAB positioning**: FAB is `fixed` - ensure parent doesn't have `transform` or `position: relative`
3. **SearchBar width**: Always use within a sized container
4. **Card images**: Use proper aspect ratio images (16:9 recommended)
5. **Input controlled values**: Always use signals with value prop

---

For complete documentation, see **README.md** in the components directory.
