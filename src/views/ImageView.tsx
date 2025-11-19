import { Component, createSignal, createResource, Show, onCleanup } from 'solid-js';
import { navigationStore } from '../stores/navigationStore';
import { imageNotesDB, mediaBlobsDB, blobToDataURL } from '../lib/db';
import { Button, Modal, Input } from '../components';
import { Back, Trashcan, Share, Download, Location } from '../components/icons';
import toast from 'solid-toast';
import type { ImageNote } from '../types';

interface ImageViewProps {
  noteId: string;
}

const ImageView: Component<ImageViewProps> = (props) => {
  const [showDeleteModal, setShowDeleteModal] = createSignal(false);
  const [imageUrl, setImageUrl] = createSignal<string>('');
  const [isEditingTitle, setIsEditingTitle] = createSignal(false);
  const [editedTitle, setEditedTitle] = createSignal('');

  // Load note from database
  const [note, { mutate: mutateNote }] = createResource<ImageNote | undefined>(
    () => props.noteId,
    async (id) => {
      const data = await imageNotesDB.get(id);
      if (data) {
        setEditedTitle(data.title);
      }
      return data;
    }
  );

  // Load image blob
  const [imageBlob] = createResource(
    () => props.noteId,
    async (id) => {
      try {
        const blob = await mediaBlobsDB.get(id);
        if (blob) {
          const url = URL.createObjectURL(blob);
          setImageUrl(url);
          return blob;
        }
        return undefined;
      } catch (error) {
        console.error('Error loading image:', error);
        toast.error('Failed to load image');
        return undefined;
      }
    }
  );

  // Cleanup blob URL
  onCleanup(() => {
    const url = imageUrl();
    if (url) {
      URL.revokeObjectURL(url);
    }
  });

  const handleBack = () => {
    navigationStore.pop();
  };

  const handleDelete = async () => {
    try {
      await imageNotesDB.delete(props.noteId);
      await mediaBlobsDB.delete(props.noteId);
      toast.success('Image note deleted successfully');
      setShowDeleteModal(false);
      navigationStore.pop();
    } catch (error) {
      console.error('Error deleting image note:', error);
      toast.error('Failed to delete image note');
    }
  };

  const handleShare = async () => {
    const blob = imageBlob();
    const noteData = note();

    if (!blob || !noteData) {
      toast.error('Image not available');
      return;
    }

    // Check if Web Share API is available
    if (navigator.share) {
      try {
        const file = new File([blob], `${noteData.title}.jpg`, { type: blob.type });
        await navigator.share({
          title: noteData.title,
          text: `Photo from ${noteData.site}`,
          files: [file],
        });
        toast.success('Shared successfully');
      } catch (error: any) {
        // User cancelled or error occurred
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
          toast.error('Failed to share');
        }
      }
    } else {
      // Fallback: copy image URL to clipboard
      try {
        await navigator.clipboard.writeText(imageUrl());
        toast.success('Image URL copied to clipboard');
      } catch (error) {
        toast.error('Sharing not supported on this device');
      }
    }
  };

  const handleDownload = async () => {
    const blob = imageBlob();
    const noteData = note();

    if (!blob || !noteData) {
      toast.error('Image not available');
      return;
    }

    try {
      const url = imageUrl();
      const a = document.createElement('a');
      a.href = url;
      a.download = `${noteData.title}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('Image downloaded');
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error('Failed to download image');
    }
  };

  const handleSaveTitle = async () => {
    const noteData = note();
    if (!noteData) return;

    const newTitle = editedTitle().trim();
    if (!newTitle) {
      toast.error('Title cannot be empty');
      return;
    }

    try {
      const updatedNote: ImageNote = {
        ...noteData,
        title: newTitle,
      };
      await imageNotesDB.add(updatedNote);
      mutateNote(updatedNote);
      setIsEditingTitle(false);
      toast.success('Title updated');
    } catch (error) {
      console.error('Error updating title:', error);
      toast.error('Failed to update title');
    }
  };

  const handleCancelEdit = () => {
    const noteData = note();
    if (noteData) {
      setEditedTitle(noteData.title);
    }
    setIsEditingTitle(false);
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
              variant="outline"
              size="sm"
              icon={<Share />}
              onClick={handleShare}
              aria-label="Share image"
            />
            <Button
              variant="outline"
              size="sm"
              icon={<Trashcan />}
              onClick={() => setShowDeleteModal(true)}
              aria-label="Delete image"
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
                {note.loading ? 'Loading...' : 'Image note not found'}
              </div>
            </div>
          }
        >
          {(noteData) => (
            <div class="max-w-4xl mx-auto p-6">
              {/* Title - Editable */}
              <Show
                when={isEditingTitle()}
                fallback={
                  <div class="mb-4">
                    <h1
                      class="text-3xl font-bold text-gray-900 cursor-pointer hover:text-[#015D7C] transition-colors"
                      onClick={() => setIsEditingTitle(true)}
                      title="Click to edit"
                    >
                      {noteData().title}
                    </h1>
                    <p class="text-sm text-gray-400 mt-1">Click to edit title</p>
                  </div>
                }
              >
                <div class="mb-4 space-y-2">
                  <Input
                    value={editedTitle()}
                    onInput={(e) => setEditedTitle(e.currentTarget.value)}
                    placeholder="Enter title"
                    class="text-2xl font-bold"
                  />
                  <div class="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSaveTitle}
                    >
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </Show>

              {/* Site Name */}
              <div class="flex items-center gap-2 text-gray-600 mb-2">
                <Location size={20} color="#4B5563" />
                <span class="text-lg">{noteData().site}</span>
              </div>

              {/* Timestamp */}
              <p class="text-sm text-gray-500 mb-6">
                {formatDate(noteData().created)}
              </p>

              {/* Image Display */}
              <div class="bg-white rounded-lg shadow-md overflow-hidden">
                <Show
                  when={!imageBlob.loading && imageUrl()}
                  fallback={
                    <div class="aspect-video flex items-center justify-center text-gray-500">
                      {imageBlob.loading ? 'Loading image...' : 'Image not available'}
                    </div>
                  }
                >
                  <img
                    src={imageUrl()}
                    alt={noteData().title}
                    class="w-full h-auto max-h-[70vh] object-contain"
                    style="touch-action: pinch-zoom;"
                  />
                </Show>
              </div>

              {/* Download Button */}
              <div class="mt-6 flex justify-center">
                <Button
                  variant="primary"
                  size="lg"
                  icon={<Download />}
                  onClick={handleDownload}
                  disabled={imageBlob.loading || !imageUrl()}
                >
                  Download Image
                </Button>
              </div>
            </div>
          )}
        </Show>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal()}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Image"
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
          Are you sure you want to delete this image? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default ImageView;
