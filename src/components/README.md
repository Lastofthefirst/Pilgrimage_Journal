# UI Components

Reusable SolidJS components with Tailwind CSS 4 styling for the Pilgrim Notes PWA. These components replace the original NativeBase components from the React Native app.

## Components

### Button

A versatile button component with multiple variants, sizes, and icon support.

**Props:**
- `variant?: 'primary' | 'secondary' | 'outline'` - Button style variant (default: 'primary')
- `size?: 'sm' | 'md' | 'lg'` - Button size (default: 'md')
- `icon?: JSX.Element` - Optional icon element
- `iconPosition?: 'left' | 'right'` - Icon position (default: 'left')
- `fullWidth?: boolean` - Make button full width
- `disabled?: boolean` - Disable the button

**Usage:**
```tsx
import { Button } from '@/components';

// Basic usage
<Button>Click Me</Button>

// With variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>

// With sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// With icon
<Button icon={<PlusIcon />} iconPosition="left">
  Add Item
</Button>

// Full width
<Button fullWidth>Full Width Button</Button>
```

**Color Scheme:**
- Primary: `#015D7C` (brand teal)
- Secondary: `#DCF1FA` (light blue)
- Outline: Transparent with `#015D7C` border

---

### Card

A card component for displaying content with optional images, titles, and click handlers.

**Props:**
- `image?: string` - Optional image URL displayed at top
- `imageAlt?: string` - Alt text for the image
- `title?: string | JSX.Element` - Card title
- `children?: JSX.Element` - Card content
- `onClick?: (e: MouseEvent) => void` - Click handler
- `hoverable?: boolean` - Enable hover effects (auto-enabled if onClick provided)
- `padding?: 'none' | 'sm' | 'md' | 'lg'` - Content padding (default: 'md')

**Usage:**
```tsx
import { Card } from '@/components';

// Basic card
<Card title="Card Title">
  <p>Card content goes here</p>
</Card>

// Card with image
<Card
  image="/path/to/image.jpg"
  imageAlt="Description"
  title="Beautiful Place"
>
  <p>Description of the place</p>
</Card>

// Clickable card
<Card
  title="Clickable Card"
  onClick={() => console.log('Card clicked')}
>
  <p>Click anywhere on this card</p>
</Card>

// Custom padding
<Card padding="lg">
  <div>Custom content with large padding</div>
</Card>
```

**Features:**
- Responsive design
- Lazy loading for images
- Keyboard accessible (Enter/Space for clickable cards)
- Smooth hover animations
- Shadow effects

---

### Input

A styled text input component with label, error states, and icon support.

**Props:**
- `label?: string` - Input label
- `error?: string` - Error message (displays below input)
- `helperText?: string` - Helper text (displays below input when no error)
- `fullWidth?: boolean` - Make input full width
- `leftIcon?: JSX.Element` - Icon on the left side
- `rightIcon?: JSX.Element` - Icon on the right side

**Usage:**
```tsx
import { Input } from '@/components';
import { createSignal } from 'solid-js';

const [value, setValue] = createSignal('');
const [error, setError] = createSignal('');

// Basic input
<Input
  label="Name"
  placeholder="Enter your name"
  fullWidth
/>

// With validation
<Input
  label="Email"
  type="email"
  value={value()}
  onInput={(e) => setValue(e.currentTarget.value)}
  error={error()}
  helperText="Enter a valid email address"
  fullWidth
/>

// With icons
<Input
  label="Search"
  leftIcon={<SearchIcon />}
  placeholder="Search..."
/>
```

**Features:**
- Focus ring with brand color
- Error state styling
- Helper text support
- Icon support on both sides
- ARIA attributes for accessibility
- Auto-generated IDs

---

### SearchBar

A specialized search input with search icon and clear button.

**Props:**
- `value?: string` - Search value
- `onClear?: () => void` - Clear button click handler
- `clearable?: boolean` - Show clear button (default: true)
- `placeholder?: string` - Placeholder text (default: 'Search...')

**Usage:**
```tsx
import { SearchBar } from '@/components';
import { createSignal } from 'solid-js';

const [searchValue, setSearchValue] = createSignal('');

<SearchBar
  value={searchValue()}
  onInput={(e) => setSearchValue(e.currentTarget.value)}
  onClear={() => setSearchValue('')}
  placeholder="Search notes..."
/>
```

**Features:**
- Pill-shaped design
- Built-in search icon
- Clear button (appears when there's text)
- Focus state with brand color
- Responsive design

---

### Modal

A modal/dialog component with backdrop, animations, and customization options.

**Props:**
- `isOpen: boolean` - Whether modal is open
- `onClose: () => void` - Close handler
- `title?: string | JSX.Element` - Modal title
- `children: JSX.Element` - Modal content
- `size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'` - Modal size (default: 'md')
- `closeOnBackdrop?: boolean` - Close when clicking backdrop (default: true)
- `closeOnEscape?: boolean` - Close when pressing Escape (default: true)
- `showCloseButton?: boolean` - Show X close button (default: true)
- `footer?: JSX.Element` - Optional footer content

**Usage:**
```tsx
import { Modal, Button } from '@/components';
import { createSignal } from 'solid-js';

const [isOpen, setIsOpen] = createSignal(false);

<>
  <Button onClick={() => setIsOpen(true)}>Open Modal</Button>

  <Modal
    isOpen={isOpen()}
    onClose={() => setIsOpen(false)}
    title="Confirm Action"
    size="md"
    footer={
      <div class="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
        <Button onClick={() => {
          // Handle confirm
          setIsOpen(false);
        }}>
          Confirm
        </Button>
      </div>
    }
  >
    <p>Are you sure you want to perform this action?</p>
  </Modal>
</>
```

**Features:**
- Backdrop overlay with blur effect
- Slide-up animation
- Keyboard support (Escape to close)
- Click outside to close
- Prevents body scroll when open
- Portal rendering
- ARIA attributes
- Responsive sizing

---

### Fab (Floating Action Button)

A circular floating action button positioned at screen corners.

**Props:**
- `icon?: JSX.Element` - Button icon
- `position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'` - Position (default: 'bottom-right')
- `size?: 'sm' | 'md' | 'lg'` - Button size (default: 'md')
- `label?: string` - Optional label text
- `extended?: boolean` - Show as extended FAB with label
- `disabled?: boolean` - Disable the button

**Usage:**
```tsx
import { Fab } from '@/components';

// Icon only
<Fab
  icon={<PlusIcon />}
  onClick={() => console.log('FAB clicked')}
/>

// Extended with label
<Fab
  icon={<PlusIcon />}
  label="Add Note"
  extended
  position="bottom-right"
  onClick={() => console.log('Add note')}
/>

// Different positions
<Fab
  icon={<SaveIcon />}
  position="bottom-left"
  size="lg"
/>
```

**Features:**
- Fixed positioning
- Circular design
- Shadow and hover effects
- Scale animation on hover/click
- Focus ring
- Supports both icon-only and extended (with label) variants
- Brand color background

---

## Importing Components

### Individual Imports
```tsx
import Button from '@/components/Button';
import Card from '@/components/Card';
```

### Barrel Imports
```tsx
import { Button, Card, Input, SearchBar, Modal, Fab } from '@/components';
```

### Type Imports
```tsx
import type { ButtonProps, CardProps, InputProps } from '@/components';
```

---

## Design System

### Colors
- **Primary:** `#015D7C` - Main brand color (teal)
- **Secondary:** `#DCF1FA` - Light blue accent
- **Background:** `#024359` - Dark teal background

### Typography
- **Font Family:** 'Comic Neue', system fonts
- **Sizes:** Tailwind default scale (text-sm, text-base, text-lg, etc.)

### Spacing
- Follows Tailwind's spacing scale
- Consistent padding and margins across components

### Shadows
- `shadow-md` - Default shadow
- `shadow-lg` - Hover shadow
- `shadow-xl` - Elevated elements

### Border Radius
- **Small:** `rounded-md` (0.375rem)
- **Medium:** `rounded-lg` (0.5rem)
- **Pill:** `rounded-full`

---

## Accessibility

All components follow WAI-ARIA guidelines:
- Proper ARIA attributes
- Keyboard navigation support
- Focus indicators
- Screen reader support
- Semantic HTML

---

## Demo

See `ComponentsDemo.tsx` for a comprehensive demonstration of all components with various configurations.

To view the demo:
```tsx
import ComponentsDemo from '@/components/ComponentsDemo';

// In your app
<ComponentsDemo />
```

---

## Tailwind CSS 4

These components are built for Tailwind CSS 4 and use:
- Modern CSS features
- Custom properties for theming
- Responsive design utilities
- Animation utilities

Make sure your `tailwind.config.js` is properly configured with the brand colors.
