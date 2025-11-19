import { Component, createSignal, onMount, onCleanup, createEffect } from 'solid-js';
import { navigationStore } from '../stores/navigationStore';
import { textNotesDB } from '../lib/db';
import { sites } from '../data/sites';
import { getCurrentDate, getEasyCreatedTime } from '../utils/date';
import { debounce } from '../utils/debounce';
import type { TextNote } from '../types';
import toast from 'solid-toast';
import Back from '../components/icons/Back';

interface EditorProps {
  noteId?: string;
  initialSite?: string;
}

const Editor: Component<EditorProps> = (props) => {
  const [title, setTitle] = createSignal('');
  const [selectedSite, setSelectedSite] = createSignal(props.initialSite || '');
  const [noteId, setNoteId] = createSignal(props.noteId || '');
  const [editorContent, setEditorContent] = createSignal('');
  const [totalTypingTime, setTotalTypingTime] = createSignal(0);
  const [isTyping, setIsTyping] = createSignal(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = createSignal(false);

  let editorRef: HTMLDivElement | undefined;
  let typingStartTime: number | null = null;
  let typingIntervalId: number | null = null;

  // Generate UUID fallback
  const generateId = (): string => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback UUID v4 generator
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  // Load existing note if editing
  onMount(async () => {
    if (props.noteId) {
      const note = await textNotesDB.get(props.noteId);
      if (note) {
        setTitle(note.title);
        setSelectedSite(note.site);
        setEditorContent(note.body);
        if (editorRef) {
          editorRef.innerHTML = note.body;
        }
      }
    } else {
      // Generate new ID for new note
      setNoteId(generateId());
    }

    // Set placeholder if empty
    if (editorRef && !editorRef.innerHTML) {
      editorRef.innerHTML = '<p><br></p>';
    }
  });

  // Track typing time
  const startTypingTimer = () => {
    if (!typingStartTime) {
      typingStartTime = Date.now();
      setIsTyping(true);
    }
  };

  const stopTypingTimer = () => {
    if (typingStartTime) {
      const elapsed = Date.now() - typingStartTime;
      setTotalTypingTime(totalTypingTime() + elapsed);
      typingStartTime = null;
      setIsTyping(false);
    }
  };

  // Auto-save with debounce
  const saveNote = async () => {
    // Only save if user has typed for 10+ seconds total
    if (totalTypingTime() < 10000) {
      return;
    }

    const currentTitle = title() || 'Untitled Note';
    const currentSite = selectedSite() || sites[0].name;
    const currentBody = editorRef?.innerHTML || '';

    const note: TextNote = {
      id: noteId(),
      title: currentTitle,
      body: currentBody,
      site: currentSite,
      type: 'text',
      created: props.noteId ? (await textNotesDB.get(props.noteId))?.created || getCurrentDate() : getCurrentDate(),
      easyCreatedTime: getEasyCreatedTime(),
    };

    await textNotesDB.add(note);
    setHasUnsavedChanges(false);
    toast.success('Note saved');
  };

  const debouncedSave = debounce(saveNote, 500);

  // Handle content change
  const handleContentChange = () => {
    if (editorRef) {
      setEditorContent(editorRef.innerHTML);
      setHasUnsavedChanges(true);
      startTypingTimer();
      debouncedSave();
    }
  };

  // Handle typing stopped (for timing)
  createEffect(() => {
    if (isTyping()) {
      if (typingIntervalId) clearTimeout(typingIntervalId);
      typingIntervalId = window.setTimeout(() => {
        stopTypingTimer();
      }, 1000); // Stop counting after 1 second of inactivity
    }
  });

  // Cleanup
  onCleanup(() => {
    stopTypingTimer();
    if (typingIntervalId) clearTimeout(typingIntervalId);
  });

  // Format commands
  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef?.focus();
    handleContentChange();
  };

  const formatBold = () => execCommand('bold');
  const formatItalic = () => execCommand('italic');
  const formatUnderline = () => execCommand('underline');
  const formatH1 = () => execCommand('formatBlock', '<h1>');
  const formatP = () => execCommand('formatBlock', '<p>');
  const formatBulletList = () => execCommand('insertUnorderedList');
  const formatOrderedList = () => execCommand('insertOrderedList');
  const formatBlockquote = () => execCommand('formatBlock', '<blockquote>');
  const clearFormatting = () => {
    execCommand('removeFormat');
    execCommand('formatBlock', '<p>');
  };

  // Save and go back
  const handleBack = async () => {
    stopTypingTimer();

    // Save one final time if there are unsaved changes
    if (hasUnsavedChanges() || totalTypingTime() >= 10000) {
      await saveNote();
    }

    navigationStore.pop();
  };

  // Prevent data loss on page unload
  onMount(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    onCleanup(() => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    });
  });

  return (
    <div class="flex flex-col h-screen bg-gray-50">
      {/* Top Bar */}
      <div class="bg-white border-b border-gray-200 shadow-sm">
        <div class="px-4 py-3 flex items-center gap-3">
          {/* Back Button */}
          <button
            onClick={handleBack}
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Back"
          >
            <Back color="#1f2937" size={24} />
          </button>

          {/* Title Input */}
          <input
            type="text"
            placeholder="Note Title"
            value={title()}
            onInput={(e) => {
              setTitle(e.currentTarget.value);
              setHasUnsavedChanges(true);
              startTypingTimer();
              debouncedSave();
            }}
            class="flex-1 text-2xl font-bold text-gray-900 placeholder-gray-400 focus:outline-none"
          />
        </div>

        {/* Site Selector */}
        <div class="px-4 pb-3">
          <select
            value={selectedSite()}
            onChange={(e) => {
              setSelectedSite(e.currentTarget.value);
              setHasUnsavedChanges(true);
              debouncedSave();
            }}
            class="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          >
            <option value="">Select a site...</option>
            {sites.map((site) => (
              <option value={site.name}>{site.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Formatting Toolbar */}
      <div class="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-1 overflow-x-auto">
        <button
          onClick={formatBold}
          class="px-3 py-2 hover:bg-gray-100 rounded font-bold text-gray-700 transition-colors"
          title="Bold"
        >
          B
        </button>
        <button
          onClick={formatItalic}
          class="px-3 py-2 hover:bg-gray-100 rounded italic text-gray-700 transition-colors"
          title="Italic"
        >
          I
        </button>
        <button
          onClick={formatUnderline}
          class="px-3 py-2 hover:bg-gray-100 rounded underline text-gray-700 transition-colors"
          title="Underline"
        >
          U
        </button>

        <div class="w-px h-6 bg-gray-300 mx-1" />

        <button
          onClick={formatH1}
          class="px-3 py-2 hover:bg-gray-100 rounded font-bold text-gray-700 transition-colors"
          title="Heading 1"
        >
          H1
        </button>
        <button
          onClick={formatP}
          class="px-3 py-2 hover:bg-gray-100 rounded text-gray-700 transition-colors"
          title="Paragraph"
        >
          P
        </button>

        <div class="w-px h-6 bg-gray-300 mx-1" />

        <button
          onClick={formatBulletList}
          class="px-3 py-2 hover:bg-gray-100 rounded text-gray-700 transition-colors"
          title="Bullet List"
        >
          •
        </button>
        <button
          onClick={formatOrderedList}
          class="px-3 py-2 hover:bg-gray-100 rounded text-gray-700 transition-colors"
          title="Ordered List"
        >
          1.
        </button>
        <button
          onClick={formatBlockquote}
          class="px-3 py-2 hover:bg-gray-100 rounded text-gray-700 transition-colors"
          title="Blockquote"
        >
          "
        </button>

        <div class="w-px h-6 bg-gray-300 mx-1" />

        <button
          onClick={clearFormatting}
          class="px-3 py-2 hover:bg-gray-100 rounded text-gray-700 transition-colors"
          title="Clear Formatting"
        >
          ×
        </button>
      </div>

      {/* Editor Area */}
      <div class="flex-1 overflow-y-auto bg-white">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleContentChange}
          onKeyDown={startTypingTimer}
          onKeyUp={handleContentChange}
          onPaste={handleContentChange}
          class="min-h-full px-4 py-6 focus:outline-none prose max-w-none"
          style={{
            "min-height": "100%",
          }}
          data-placeholder="Write your pilgrimage notes here..."
        />
      </div>

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
          position: absolute;
        }

        [contenteditable] {
          outline: none;
        }

        [contenteditable] h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.67em 0;
        }

        [contenteditable] p {
          margin: 1em 0;
        }

        [contenteditable] blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1em;
          margin: 1em 0;
          color: #6b7280;
        }

        [contenteditable] ul,
        [contenteditable] ol {
          margin: 1em 0;
          padding-left: 2em;
        }

        [contenteditable] ul {
          list-style-type: disc;
        }

        [contenteditable] ol {
          list-style-type: decimal;
        }

        [contenteditable] strong,
        [contenteditable] b {
          font-weight: bold;
        }

        [contenteditable] em,
        [contenteditable] i {
          font-style: italic;
        }

        [contenteditable] u {
          text-decoration: underline;
        }

        /* Focus state */
        [contenteditable]:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
};

export default Editor;
