import { Component, createSignal, createResource, Show } from 'solid-js';
import { navigationStore } from '../stores/navigationStore';
import { textNotesDB } from '../lib/db';
import { Button, Modal } from '../components';
import { Back, Trashcan, Location } from '../components/icons';
import toast from 'solid-toast';
import type { TextNote } from '../types';
import Editor from './Editor';

interface NoteViewProps {
  noteId: string;
}

const NoteView: Component<NoteViewProps> = (props) => {
  const [showDeleteModal, setShowDeleteModal] = createSignal(false);

  // Load note from database
  const [note] = createResource<TextNote | undefined>(
    () => props.noteId,
    async (id) => {
      const data = await textNotesDB.get(id);
      return data;
    }
  );

  const handleBack = () => {
    navigationStore.pop();
  };

  const handleEdit = () => {
    navigationStore.push(<Editor noteId={props.noteId} />);
  };

  const handleDelete = async () => {
    try {
      await textNotesDB.delete(props.noteId);
      toast.success('Note deleted successfully');
      setShowDeleteModal(false);
      navigationStore.pop();
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div class="flex flex-col h-screen bg-gray-50">
      {/* Top Bar */}
      <div class="bg-white border-b border-gray-200 shadow-sm">
        <div class="flex items-center justify-between px-4 py-3">
          <Button
            variant="outline"
            size="sm"
            icon={<Back />}
            onClick={handleBack}
            aria-label="Go back"
          />

          <div class="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleEdit}
            >
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<Trashcan />}
              onClick={() => setShowDeleteModal(true)}
              aria-label="Delete note"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div class="flex-1 overflow-y-auto">
        <Show
          when={!note.loading && note()}
          fallback={
            <div class="flex items-center justify-center h-full">
              <div class="text-gray-500">
                {note.loading ? 'Loading...' : 'Note not found'}
              </div>
            </div>
          }
        >
          {(noteData) => (
            <div class="max-w-4xl mx-auto p-6">
              {/* Title */}
              <h1 class="text-3xl font-bold text-gray-900 mb-4">
                {noteData().title}
              </h1>

              {/* Site Name */}
              <div class="flex items-center gap-2 text-gray-600 mb-2">
                <Location size={20} color="#4B5563" />
                <span class="text-lg">{noteData().site}</span>
              </div>

              {/* Timestamp */}
              <p class="text-sm text-gray-500 mb-6">
                {formatDate(noteData().created)}
              </p>

              {/* Body Content */}
              <div
                class="prose prose-lg max-w-none text-gray-800"
                innerHTML={noteData().body}
              />
            </div>
          )}
        </Show>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal()}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Note"
        size="sm"
        footer={
          <div class="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleDelete}
              class="bg-red-600 hover:bg-red-700 active:bg-red-800"
            >
              Delete
            </Button>
          </div>
        }
      >
        <p class="text-gray-700">
          Are you sure you want to delete this note? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default NoteView;
