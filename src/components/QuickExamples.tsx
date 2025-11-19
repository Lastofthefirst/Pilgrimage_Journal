/**
 * Quick Examples - Common usage patterns with existing icons
 *
 * This file shows practical examples of using the UI components
 * with the app's existing icon set.
 */

import { Component, createSignal } from 'solid-js';
import { Button, Card, Input, SearchBar, Modal, Fab } from './index';
import * as Icons from './icons';

export const ButtonExamples: Component = () => {
  return (
    <div class="space-y-4">
      {/* Add Note Button */}
      <Button
        icon={<Icons.AddNote />}
        onClick={() => console.log('Add note')}
      >
        Add Note
      </Button>

      {/* Save Button */}
      <Button
        variant="primary"
        icon={<Icons.Save />}
        onClick={() => console.log('Save')}
      >
        Save
      </Button>

      {/* Delete Button */}
      <Button
        variant="outline"
        icon={<Icons.Trashcan />}
        onClick={() => console.log('Delete')}
      >
        Delete
      </Button>

      {/* Share Button */}
      <Button
        variant="secondary"
        icon={<Icons.Share />}
        iconPosition="right"
      >
        Share
      </Button>
    </div>
  );
};

export const SearchExample: Component = () => {
  const [searchTerm, setSearchTerm] = createSignal('');

  return (
    <SearchBar
      value={searchTerm()}
      onInput={(e) => setSearchTerm(e.currentTarget.value)}
      onClear={() => setSearchTerm('')}
      placeholder="Search notes and sites..."
    />
  );
};

export const NoteCardExample: Component<{ note: any }> = (props) => {
  return (
    <Card
      title={props.note.title}
      onClick={() => console.log('Open note', props.note.id)}
    >
      <div class="space-y-2">
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <Icons.Location class="w-4 h-4" />
          <span>{props.note.site}</span>
        </div>
        <p class="text-gray-700 line-clamp-2">
          {props.note.body || 'No content'}
        </p>
        <div class="text-xs text-gray-500">
          {props.note.easyCreatedTime}
        </div>
      </div>
    </Card>
  );
};

export const SiteCardExample: Component<{ site: any }> = (props) => {
  return (
    <Card
      image={props.site.image}
      imageAlt={props.site.name}
      title={props.site.name}
      onClick={() => console.log('Open site', props.site.index)}
    >
      <div class="space-y-2">
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <Icons.Location class="w-4 h-4" />
          <span>{props.site.city}</span>
        </div>
        <p class="text-sm text-gray-600 italic">
          "{props.site.quote}"
        </p>
      </div>
    </Card>
  );
};

export const NewNoteModalExample: Component = () => {
  const [isOpen, setIsOpen] = createSignal(false);
  const [noteType, setNoteType] = createSignal<'text' | 'audio' | 'image' | null>(null);

  return (
    <>
      <Button
        icon={<Icons.AddNote />}
        onClick={() => setIsOpen(true)}
      >
        New Note
      </Button>

      <Modal
        isOpen={isOpen()}
        onClose={() => {
          setIsOpen(false);
          setNoteType(null);
        }}
        title="Create New Note"
        size="md"
      >
        <div class="space-y-4">
          <p class="text-gray-600">Choose a note type:</p>

          <div class="grid grid-cols-3 gap-4">
            <button
              class="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-gray-300 hover:border-[#015D7C] hover:bg-[#015D7C]/5 transition-colors"
              onClick={() => setNoteType('text')}
            >
              <Icons.NoteText class="w-8 h-8 text-[#015D7C]" />
              <span class="text-sm font-medium">Text</span>
            </button>

            <button
              class="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-gray-300 hover:border-[#015D7C] hover:bg-[#015D7C]/5 transition-colors"
              onClick={() => setNoteType('audio')}
            >
              <Icons.Audio class="w-8 h-8 text-[#015D7C]" />
              <span class="text-sm font-medium">Audio</span>
            </button>

            <button
              class="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-gray-300 hover:border-[#015D7C] hover:bg-[#015D7C]/5 transition-colors"
              onClick={() => setNoteType('image')}
            >
              <Icons.Photo class="w-8 h-8 text-[#015D7C]" />
              <span class="text-sm font-medium">Photo</span>
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export const SettingsFormExample: Component = () => {
  const [formData, setFormData] = createSignal({
    name: '',
    email: '',
  });

  const [errors, setErrors] = createSignal({
    name: '',
    email: '',
  });

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    // Validation logic here
    console.log('Form submitted:', formData());
  };

  return (
    <form onSubmit={handleSubmit} class="space-y-4">
      <Input
        label="Name"
        value={formData().name}
        onInput={(e) => setFormData({ ...formData(), name: e.currentTarget.value })}
        error={errors().name}
        placeholder="Enter your name"
        fullWidth
      />

      <Input
        label="Email"
        type="email"
        value={formData().email}
        onInput={(e) => setFormData({ ...formData(), email: e.currentTarget.value })}
        error={errors().email}
        placeholder="your@email.com"
        fullWidth
      />

      <div class="flex gap-2">
        <Button type="submit" variant="primary" icon={<Icons.Save />}>
          Save Changes
        </Button>
        <Button type="button" variant="outline">
          Cancel
        </Button>
      </div>
    </form>
  );
};

export const FabExamples: Component = () => {
  return (
    <>
      {/* Add Note FAB */}
      <Fab
        icon={<Icons.AddNote />}
        label="Add Note"
        extended
        position="bottom-right"
        onClick={() => console.log('Add note')}
      />

      {/* Map FAB */}
      <Fab
        icon={<Icons.Map />}
        position="bottom-left"
        onClick={() => console.log('Open map')}
      />

      {/* Help FAB */}
      <Fab
        icon={<Icons.Help />}
        size="sm"
        position="top-right"
        onClick={() => console.log('Show help')}
      />
    </>
  );
};

export const DeleteConfirmationExample: Component<{
  onConfirm: () => void;
  onCancel: () => void;
}> = (props) => {
  const [isOpen, setIsOpen] = createSignal(true);

  return (
    <Modal
      isOpen={isOpen()}
      onClose={props.onCancel}
      title="Delete Note"
      size="sm"
      footer={
        <div class="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={props.onCancel}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            icon={<Icons.Trashcan />}
            onClick={() => {
              props.onConfirm();
              setIsOpen(false);
            }}
          >
            Delete
          </Button>
        </div>
      }
    >
      <p>Are you sure you want to delete this note? This action cannot be undone.</p>
    </Modal>
  );
};

// Usage in a view component:
export const NoteListViewExample: Component = () => {
  const [searchTerm, setSearchTerm] = createSignal('');
  const [notes] = createSignal([
    { id: '1', title: 'My First Note', site: 'Church of the Nativity', body: 'This was amazing...', easyCreatedTime: '11/19/2025' },
    { id: '2', title: 'Beautiful Place', site: 'Sea of Galilee', body: 'The view was incredible...', easyCreatedTime: '11/18/2025' },
  ]);

  return (
    <div class="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div class="bg-[#015D7C] text-white p-4 shadow-md">
        <h1 class="text-2xl font-bold mb-4">My Notes</h1>
        <SearchExample />
      </div>

      {/* Notes List */}
      <div class="flex-1 overflow-y-auto p-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes().map(note => (
            <NoteCardExample note={note} />
          ))}
        </div>
      </div>

      {/* FAB */}
      <Fab
        icon={<Icons.AddNote />}
        label="Add Note"
        extended
        onClick={() => console.log('Add new note')}
      />
    </div>
  );
};

export default {
  ButtonExamples,
  SearchExample,
  NoteCardExample,
  SiteCardExample,
  NewNoteModalExample,
  SettingsFormExample,
  FabExamples,
  DeleteConfirmationExample,
  NoteListViewExample,
};
