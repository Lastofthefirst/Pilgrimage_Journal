import { createSignal } from 'solid-js';
import { navigationStore } from '../stores/navigationStore';
import { textNotesDB } from '../lib/db';
import { colors } from '../styles/colors';
import { sites } from '../data/sites';
import type { TextNote } from '../types';
import Editor from '../views/Editor';
import toast from 'solid-toast';

interface TextNoteCardProps {
  note: TextNote;
  onUpdate: () => void;
}

const TextNoteCard = (props: TextNoteCardProps) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = createSignal(false);

  const site = () => sites.find((s) => s.name === props.note.site);

  const handleCardClick = () => {
    navigationStore.push(() => <Editor noteId={props.note.id} />);
  };

  const handleEdit = (e: MouseEvent) => {
    e.stopPropagation();
    navigationStore.push(() => <Editor noteId={props.note.id} />);
  };

  const handleShare = async (e: MouseEvent) => {
    e.stopPropagation();
    const body = props.note.body.replace(/<br>/g, '\n').replace(/<\/[^>]+?>/g, '$&\n');
    const parsed = body.replace(/(<([^>]+)>)/gi, '');
    const complete = `${props.note.title}\n\n${parsed}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: props.note.title,
          text: complete,
        });
        toast.success('Shared successfully!');
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          toast.error('Failed to share');
        }
      }
    } else {
      await navigator.clipboard.writeText(complete);
      toast.success('Copied to clipboard!');
    }
  };

  const handleDelete = async (e: MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(false);
    await textNotesDB.delete(props.note.id);
    toast.success('Note deleted!');
    props.onUpdate();
  };

  const wordCount = () => {
    let cont = props.note.body;
    cont = cont.replace(/<[^>]*>/g, ' ');
    cont = cont.replace(/\s+/g, ' ');
    cont = cont.trim();
    const count = cont.split(' ').length;
    return count === 1 ? `${count} word` : `${count} words`;
  };

  const formatDate = () => {
    const date = new Date(props.note.created);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        class="relative mx-auto my-5 overflow-hidden cursor-pointer"
        style={{
          width: '85%',
          height: '190px',
          background: colors.white,
          'box-shadow': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          'border-radius': '16px',
        }}
      >
        {/* Main Content */}
        <div class="relative z-10 w-11/12 h-full overflow-hidden" style={{ 'border-radius': '16px' }}>
          {/* Header */}
          <div class="px-5 p-2" style={{ background: colors.primaryBg }}>
            <div class="flex items-center justify-between">
              <div
                class="text-base"
                style={{ color: props.note.title ? 'black' : '#9CA3AF' }}
              >
                {props.note.title || 'Untitled Note'}
              </div>
              <div class="text-sm mt-1">{formatDate()}</div>
            </div>
            <div class="flex items-center justify-between">
              <div class="font-bold" style={{ color: colors.darkBlue }}>
                {props.note.site}
              </div>
              <div class="text-gray-600 text-sm">{wordCount()}</div>
            </div>
          </div>

          {/* Body Content */}
          <div
            class="p-3 px-5 h-full w-full overflow-hidden"
            style={{ background: colors.white }}
            innerHTML={props.note.body}
          />
        </div>

        {/* Action Buttons (right side) */}
        <div class="absolute right-4 top-0 flex flex-col justify-evenly z-20 py-8 gap-2">
          {/* Share Button */}
          <button
            onClick={handleShare}
            class="flex items-center justify-center"
            style={{
              background: colors.primaryBg,
              'box-shadow': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              'border-radius': '9999px',
              width: '36px',
              height: '36px',
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke={colors.primaryText}
              stroke-width="2"
            >
              <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>

          {/* Edit Button */}
          <button
            onClick={handleEdit}
            class="flex items-center justify-center"
            style={{
              background: colors.primaryBg,
              'box-shadow': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              'border-radius': '9999px',
              width: '36px',
              height: '36px',
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke={colors.primaryText}
              stroke-width="2"
            >
              <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>

          {/* Delete Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteConfirm(true);
            }}
            class="flex items-center justify-center"
            style={{
              background: colors.primaryBg,
              'box-shadow': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              'border-radius': '9999px',
              width: '36px',
              height: '36px',
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke={colors.primaryText}
              stroke-width="2"
            >
              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        {/* Site Image (right edge) */}
        <img
          src={site()?.image || ''}
          alt={props.note.site}
          class="absolute right-0 top-0 h-full object-cover"
          style={{
            width: '20%',
            'border-radius': '4px',
          }}
        />
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
            style={{ 'box-shadow': '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
          >
            <div class="font-bold text-lg mb-2">Delete Note?</div>
            <div class="mb-4 text-gray-700">
              This will remove the entire note. This action cannot be reversed. Deleted data can not be recovered.
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

export default TextNoteCard;
