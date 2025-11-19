import { Component, createSignal, createResource, Show, onCleanup } from 'solid-js';
import { navigationStore } from '../stores/navigationStore';
import { audioNotesDB, mediaBlobsDB } from '../lib/db';
import { Button, Modal } from '../components';
import { Back, Trashcan, Play, Stop, Location } from '../components/icons';
import toast from 'solid-toast';
import type { AudioNote } from '../types';

interface AudioViewProps {
  noteId: string;
}

const AudioView: Component<AudioViewProps> = (props) => {
  const [showDeleteModal, setShowDeleteModal] = createSignal(false);
  const [isPlaying, setIsPlaying] = createSignal(false);
  const [currentTime, setCurrentTime] = createSignal(0);
  const [duration, setDuration] = createSignal(0);
  const [audioElement, setAudioElement] = createSignal<HTMLAudioElement | null>(null);
  const [audioUrl, setAudioUrl] = createSignal<string>('');

  // Load note from database
  const [note] = createResource<AudioNote | undefined>(
    () => props.noteId,
    async (id) => {
      const data = await audioNotesDB.get(id);
      return data;
    }
  );

  // Load audio blob
  const [audioBlob] = createResource(
    () => props.noteId,
    async (id) => {
      try {
        const blob = await mediaBlobsDB.get(id);
        if (blob) {
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);

          // Create audio element
          const audio = new Audio(url);
          audio.addEventListener('loadedmetadata', () => {
            setDuration(audio.duration);
          });
          audio.addEventListener('timeupdate', () => {
            setCurrentTime(audio.currentTime);
          });
          audio.addEventListener('ended', () => {
            setIsPlaying(false);
            setCurrentTime(0);
          });
          setAudioElement(audio);

          return blob;
        }
        return undefined;
      } catch (error) {
        console.error('Error loading audio:', error);
        toast.error('Failed to load audio');
        return undefined;
      }
    }
  );

  // Cleanup audio element and blob URL
  onCleanup(() => {
    const audio = audioElement();
    if (audio) {
      audio.pause();
      audio.src = '';
    }
    const url = audioUrl();
    if (url) {
      URL.revokeObjectURL(url);
    }
  });

  const handleBack = () => {
    navigationStore.pop();
  };

  const handleDelete = async () => {
    try {
      await audioNotesDB.delete(props.noteId);
      await mediaBlobsDB.delete(props.noteId);
      toast.success('Audio note deleted successfully');
      setShowDeleteModal(false);
      navigationStore.pop();
    } catch (error) {
      console.error('Error deleting audio note:', error);
      toast.error('Failed to delete audio note');
    }
  };

  const handlePlayPause = () => {
    const audio = audioElement();
    if (!audio) return;

    if (isPlaying()) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: Event) => {
    const audio = audioElement();
    if (!audio) return;

    const target = e.target as HTMLInputElement;
    const time = parseFloat(target.value);
    audio.currentTime = time;
    setCurrentTime(time);
  };

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

          <Button
            variant="outline"
            size="sm"
            icon={<Trashcan />}
            onClick={() => setShowDeleteModal(true)}
            aria-label="Delete audio note"
          />
        </div>
      </div>

      {/* Content */}
      <div class="flex-1 overflow-y-auto">
        <Show
          when={!note.loading && note()}
          fallback={
            <div class="flex items-center justify-center h-full">
              <div class="text-gray-500">
                {note.loading ? 'Loading...' : 'Audio note not found'}
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

              {/* Audio Player */}
              <div class="bg-white rounded-lg shadow-md p-6 mt-8">
                <Show
                  when={!audioBlob.loading && audioBlob()}
                  fallback={
                    <div class="text-center text-gray-500">
                      {audioBlob.loading ? 'Loading audio...' : 'Audio not available'}
                    </div>
                  }
                >
                  <div class="space-y-4">
                    {/* Play/Pause Button */}
                    <div class="flex justify-center">
                      <button
                        onClick={handlePlayPause}
                        class="w-16 h-16 bg-[#015D7C] hover:bg-[#014560] active:bg-[#013347] text-white rounded-full flex items-center justify-center shadow-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#015D7C] focus:ring-offset-2"
                        aria-label={isPlaying() ? 'Pause' : 'Play'}
                      >
                        {isPlaying() ? (
                          <Stop size={32} color="white" />
                        ) : (
                          <Play size={32} color="white" />
                        )}
                      </button>
                    </div>

                    {/* Progress Bar */}
                    <div class="space-y-2">
                      <input
                        type="range"
                        min="0"
                        max={duration()}
                        value={currentTime()}
                        onInput={handleSeek}
                        class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#015D7C]"
                        style={{
                          background: `linear-gradient(to right, #015D7C ${(currentTime() / duration()) * 100}%, #E5E7EB ${(currentTime() / duration()) * 100}%)`
                        }}
                      />

                      {/* Time Display */}
                      <div class="flex justify-between text-sm text-gray-600">
                        <span>{formatTime(currentTime())}</span>
                        <span>{formatTime(duration())}</span>
                      </div>
                    </div>

                    {/* Waveform Visualization (Simple Progress Bar) */}
                    <div class="h-20 bg-gray-100 rounded-lg overflow-hidden">
                      <div
                        class="h-full bg-gradient-to-r from-[#015D7C] to-[#DCF1FA] transition-all duration-300"
                        style={{ width: `${(currentTime() / duration()) * 100}%` }}
                      />
                    </div>
                  </div>
                </Show>
              </div>
            </div>
          )}
        </Show>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal()}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Audio Note"
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
          Are you sure you want to delete this audio note? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default AudioView;
