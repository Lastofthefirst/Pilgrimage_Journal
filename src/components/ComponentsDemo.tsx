import { Component, createSignal } from 'solid-js';
import Button from './Button';
import Card from './Card';
import Input from './Input';
import SearchBar from './SearchBar';
import Modal from './Modal';
import Fab from './Fab';

/**
 * Demo component showing usage examples for all UI components
 * This file serves as documentation and can be used for testing
 */
const ComponentsDemo: Component = () => {
  const [searchValue, setSearchValue] = createSignal('');
  const [inputValue, setInputValue] = createSignal('');
  const [inputError, setInputError] = createSignal('');
  const [isModalOpen, setIsModalOpen] = createSignal(false);

  // Icons (using simple SVG)
  const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
    </svg>
  );

  const SaveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
    </svg>
  );

  const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );

  const handleValidation = (value: string) => {
    if (value.length < 3) {
      setInputError('Must be at least 3 characters');
    } else {
      setInputError('');
    }
    setInputValue(value);
  };

  return (
    <div class="min-h-screen bg-gray-50 p-8">
      <div class="max-w-6xl mx-auto space-y-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">UI Components Demo</h1>

        {/* Button Examples */}
        <section class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-2xl font-semibold mb-4">Buttons</h2>

          <div class="space-y-4">
            <div>
              <h3 class="text-sm font-medium text-gray-600 mb-2">Variants</h3>
              <div class="flex flex-wrap gap-4">
                <Button variant="primary">Primary Button</Button>
                <Button variant="secondary">Secondary Button</Button>
                <Button variant="outline">Outline Button</Button>
                <Button variant="primary" disabled>Disabled</Button>
              </div>
            </div>

            <div>
              <h3 class="text-sm font-medium text-gray-600 mb-2">Sizes</h3>
              <div class="flex flex-wrap items-center gap-4">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>

            <div>
              <h3 class="text-sm font-medium text-gray-600 mb-2">With Icons</h3>
              <div class="flex flex-wrap gap-4">
                <Button icon={<PlusIcon />} iconPosition="left">Add Item</Button>
                <Button icon={<SaveIcon />} iconPosition="right" variant="secondary">Save</Button>
                <Button icon={<PlusIcon />} variant="primary" />
              </div>
            </div>

            <div>
              <h3 class="text-sm font-medium text-gray-600 mb-2">Full Width</h3>
              <Button fullWidth variant="primary">Full Width Button</Button>
            </div>
          </div>
        </section>

        {/* Card Examples */}
        <section class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-2xl font-semibold mb-4">Cards</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card
              title="Simple Card"
              padding="md"
            >
              <p class="text-gray-600">This is a basic card with a title and content.</p>
            </Card>

            <Card
              image="https://via.placeholder.com/400x225"
              imageAlt="Placeholder"
              title="Card with Image"
              hoverable
            >
              <p class="text-gray-600">This card has an image at the top and is hoverable.</p>
            </Card>

            <Card
              title="Clickable Card"
              onClick={() => alert('Card clicked!')}
            >
              <p class="text-gray-600">Click this card to see an alert.</p>
            </Card>

            <Card padding="lg">
              <div>
                <h3 class="text-lg font-semibold mb-2">Custom Title Element</h3>
                <p class="text-gray-600">This card uses custom content without the title prop.</p>
              </div>
            </Card>
          </div>
        </section>

        {/* Input Examples */}
        <section class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-2xl font-semibold mb-4">Inputs</h2>

          <div class="space-y-4 max-w-md">
            <Input
              label="Name"
              placeholder="Enter your name"
              fullWidth
            />

            <Input
              label="Email"
              type="email"
              placeholder="your@email.com"
              helperText="We'll never share your email"
              leftIcon={<UserIcon />}
              fullWidth
            />

            <Input
              label="Validated Input"
              value={inputValue()}
              onInput={(e) => handleValidation(e.currentTarget.value)}
              error={inputError()}
              placeholder="Type at least 3 characters"
              fullWidth
            />

            <Input
              label="Disabled Input"
              value="Disabled value"
              disabled
              fullWidth
            />
          </div>
        </section>

        {/* SearchBar Examples */}
        <section class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-2xl font-semibold mb-4">Search Bar</h2>

          <div class="space-y-4">
            <SearchBar
              value={searchValue()}
              onInput={(e) => setSearchValue(e.currentTarget.value)}
              onClear={() => setSearchValue('')}
              placeholder="Search notes..."
            />

            <SearchBar
              placeholder="Search without clear button..."
              clearable={false}
            />
          </div>
        </section>

        {/* Modal Examples */}
        <section class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-2xl font-semibold mb-4">Modal</h2>

          <div class="flex flex-wrap gap-4">
            <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
          </div>

          <Modal
            isOpen={isModalOpen()}
            onClose={() => setIsModalOpen(false)}
            title="Example Modal"
            size="md"
            footer={
              <div class="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={() => setIsModalOpen(false)}>
                  Confirm
                </Button>
              </div>
            }
          >
            <div class="space-y-4">
              <p>This is an example modal with a title, content, and footer.</p>
              <p>You can close it by:</p>
              <ul class="list-disc list-inside space-y-1 text-gray-600">
                <li>Clicking the X button</li>
                <li>Pressing the Escape key</li>
                <li>Clicking outside the modal</li>
                <li>Clicking the Cancel or Confirm buttons</li>
              </ul>
            </div>
          </Modal>
        </section>

        {/* FAB Example */}
        <section class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-2xl font-semibold mb-4">Floating Action Button (FAB)</h2>

          <div class="space-y-4">
            <p class="text-gray-600">
              The FAB is positioned at the bottom-right of the screen. Scroll down to see it!
            </p>

            <div class="space-y-2">
              <p class="text-sm font-medium">Variants:</p>
              <ul class="list-disc list-inside text-gray-600 space-y-1">
                <li>Icon only (default)</li>
                <li>Extended with label</li>
                <li>Different sizes (sm, md, lg)</li>
                <li>Different positions (bottom-right, bottom-left, top-right, top-left)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Spacer for FAB visibility */}
        <div class="h-32" />
      </div>

      {/* FAB positioned at bottom-right */}
      <Fab
        icon={<PlusIcon />}
        label="Add Note"
        extended
        onClick={() => alert('FAB clicked!')}
      />
    </div>
  );
};

export default ComponentsDemo;
