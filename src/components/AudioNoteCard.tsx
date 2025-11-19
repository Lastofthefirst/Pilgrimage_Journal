import { createSignal } from 'solid-js';
import { audioNotesDB, mediaBlobsDB } from '../lib/db';
import { colors } from '../styles/colors';
import type { AudioNote } from '../types';
import toast from 'solid-toast';

interface AudioNoteCardProps {
  note: AudioNote;
  onUpdate: () => void;
}

const AudioNoteCard = (props: AudioNoteCardProps) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = createSignal(false);

  const handleDelete = async (e: MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(false);
    await audioNotesDB.delete(props.note.id);
    await mediaBlobsDB.delete(props.note.id);
    toast.success('Audio note deleted!');
    props.onUpdate();
  };

  const formatDate = () => {
    const date = new Date(props.note.created);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  return (
    <>
      <div
        class="mx-auto my-5"
        style={{
          width: '85%',
          background: colors.white,
          'box-shadow': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          'border-radius': '16px',
          padding: '16px',
        }}
      >
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <div class="text-2xl">🎤</div>
            <div>
              <div
                class="font-medium"
                style={{ color: props.note.title ? 'black' : '#9CA3AF' }}
              >
                {props.note.title || 'Untitled Audio'}
              </div>
              <div class="text-sm" style={{ color: colors.primaryText }}>
                {props.note.site}
              </div>
            </div>
          </div>
          <div class="text-sm text-gray-600">{formatDate()}</div>
        </div>

        <div class="flex gap-2 mt-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteConfirm(true);
            }}
            class="px-3 py-1 text-sm rounded"
            style={{
              background: colors.primaryBg,
              color: colors.primaryText,
            }}
          >
            Delete
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm() && (
        <div
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            class="bg-white rounded-lg p-4 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div class="font-bold text-lg mb-2">Delete Audio Note?</div>
            <div class="mb-4 text-gray-700">
              This will remove the audio recording. This action cannot be reversed.
            </div>
            <div class="flex gap-2 justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(false);
                }}
                class="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                class="px-4 py-2 rounded text-white bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AudioNoteCard;
