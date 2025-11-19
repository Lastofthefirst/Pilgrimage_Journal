import { Component, createSignal, onMount, onCleanup, createEffect } from 'solid-js';
import { navigationStore } from '../stores/navigationStore';
import { textNotesDB } from '../lib/db';
import { sites } from '../data/sites';
import { getCurrentDate, getEasyCreatedTime } from '../utils/date';
import { debounce } from '../utils/debounce';
import type { TextNote } from '../types';
import toast from 'solid-toast';

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
  const [isSaving, setIsSaving] = createSignal(false);
  const [lastSaved, setLastSaved] = createSignal<Date | null>(null);
  const [showToolbar, setShowToolbar] = createSignal(true);
  const [characterCount, setCharacterCount] = createSignal(0);

  let editorRef: HTMLDivElement | undefined;
  let typingStartTime: number | null = null;
  let typingIntervalId: number | null = null;
  let scrollTimeout: number | null = null;

  // Generate UUID fallback
  const generateId = (): string => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
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
        updateCharacterCount(note.body);
      }
    } else {
      setNoteId(generateId());
    }

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

  // Update character count
  const updateCharacterCount = (html: string) => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const text = temp.textContent || temp.innerText || '';
    setCharacterCount(text.length);
  };

  // Auto-save
  const saveNote = async () => {
    if (totalTypingTime() < 10000) return;

    setIsSaving(true);
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
    setIsSaving(false);
    setLastSaved(new Date());
    toast.success('Note saved', {
      duration: 2000,
      position: 'bottom-center',
    });
  };

  const debouncedSave = debounce(saveNote, 500);

  // Handle content change
  const handleContentChange = () => {
    if (editorRef) {
      const content = editorRef.innerHTML;
      setEditorContent(content);
      updateCharacterCount(content);
      setHasUnsavedChanges(true);
      startTypingTimer();
      debouncedSave();
    }
  };

  // Handle typing stopped
  createEffect(() => {
    if (isTyping()) {
      if (typingIntervalId) clearTimeout(typingIntervalId);
      typingIntervalId = window.setTimeout(() => {
        stopTypingTimer();
      }, 1000);
    }
  });

  // Cleanup
  onCleanup(() => {
    stopTypingTimer();
    if (typingIntervalId) clearTimeout(typingIntervalId);
    if (scrollTimeout) clearTimeout(scrollTimeout);
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
  const formatH2 = () => execCommand('formatBlock', '<h2>');
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

  // Format last saved time
  const getLastSavedText = () => {
    const saved = lastSaved();
    if (!saved) return '';

    const now = new Date();
    const diffMs = now.getTime() - saved.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffMs / 60000);

    if (diffSecs < 10) return 'Just now';
    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffMins < 60) return `${diffMins}m ago`;

    return saved.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div class="flex flex-col h-screen bg-gradient-to-br from-white via-blue-50/20 to-white">
      {/* Modern Top Bar */}
      <div class="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm sticky top-0 z-20">
        <div class="px-5 py-4">
          {/* Back Button and Save Indicator */}
          <div class="flex items-center justify-between mb-4">
            <button
              onClick={handleBack}
              class="flex items-center gap-2 text-[#015D7C] hover:text-[#014A63] font-semibold transition-colors active-scale"
            >
              <span class="text-2xl">←</span>
              <span>Back</span>
            </button>

            {/* Auto-save Indicator */}
            <div class="flex items-center gap-3">
              <div class={`flex items-center gap-2 text-sm ${isSaving() ? 'text-blue-600' : hasUnsavedChanges() ? 'text-orange-600' : 'text-green-600'}`}>
                <span class={isSaving() ? 'animate-pulse' : ''}>
                  {isSaving() ? '💾' : hasUnsavedChanges() ? '⏳' : '✓'}
                </span>
                <span class="font-medium">
                  {isSaving() ? 'Saving...' : hasUnsavedChanges() ? 'Unsaved' : lastSaved() ? getLastSavedText() : 'Draft'}
                </span>
              </div>

              {/* Character Count */}
              <div class="text-sm text-gray-500 font-medium">
                {characterCount()} chars
              </div>
            </div>
          </div>

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
            class="w-full text-3xl font-bold text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent mb-4"
          />

          {/* Site Selector - Beautiful Dropdown */}
          <div class="relative">
            <select
              value={selectedSite()}
              onChange={(e) => {
                setSelectedSite(e.currentTarget.value);
                setHasUnsavedChanges(true);
                debouncedSave();
              }}
              class="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100/50 border-2 border-blue-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#015D7C] focus:border-transparent text-gray-900 font-semibold cursor-pointer transition-all hover:shadow-md"
            >
              <option value="">Select a sacred site...</option>
              {sites.map((site) => (
                <option value={site.name}>{site.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Floating Toolbar */}
      <div class={`sticky top-0 z-10 transition-all duration-300 ${showToolbar() ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <div class="bg-white/95 backdrop-blur-lg border-b border-gray-200/50 shadow-lg">
          <div class="px-4 py-3 flex items-center gap-2 overflow-x-auto">
            <button
              onClick={formatBold}
              class="px-3 py-2 hover:bg-blue-100 rounded-lg font-bold text-gray-700 transition-all active-scale min-w-[40px]"
              title="Bold (Ctrl+B)"
            >
              B
            </button>
            <button
              onClick={formatItalic}
              class="px-3 py-2 hover:bg-blue-100 rounded-lg italic text-gray-700 transition-all active-scale min-w-[40px]"
              title="Italic (Ctrl+I)"
            >
              I
            </button>
            <button
              onClick={formatUnderline}
              class="px-3 py-2 hover:bg-blue-100 rounded-lg underline text-gray-700 transition-all active-scale min-w-[40px]"
              title="Underline (Ctrl+U)"
            >
              U
            </button>

            <div class="w-px h-6 bg-gray-300 mx-1" />

            <button
              onClick={formatH1}
              class="px-3 py-2 hover:bg-blue-100 rounded-lg font-bold text-gray-700 transition-all active-scale"
              title="Heading 1"
            >
              H1
            </button>
            <button
              onClick={formatH2}
              class="px-3 py-2 hover:bg-blue-100 rounded-lg font-semibold text-gray-700 transition-all active-scale"
              title="Heading 2"
            >
              H2
            </button>
            <button
              onClick={formatP}
              class="px-3 py-2 hover:bg-blue-100 rounded-lg text-gray-700 transition-all active-scale"
              title="Paragraph"
            >
              P
            </button>

            <div class="w-px h-6 bg-gray-300 mx-1" />

            <button
              onClick={formatBulletList}
              class="px-3 py-2 hover:bg-blue-100 rounded-lg text-gray-700 transition-all active-scale text-xl"
              title="Bullet List"
            >
              •
            </button>
            <button
              onClick={formatOrderedList}
              class="px-3 py-2 hover:bg-blue-100 rounded-lg text-gray-700 transition-all active-scale"
              title="Numbered List"
            >
              1.
            </button>
            <button
              onClick={formatBlockquote}
              class="px-3 py-2 hover:bg-blue-100 rounded-lg text-gray-700 transition-all active-scale text-xl"
              title="Quote"
            >
              "
            </button>

            <div class="w-px h-6 bg-gray-300 mx-1" />

            <button
              onClick={clearFormatting}
              class="px-3 py-2 hover:bg-red-100 rounded-lg text-red-600 transition-all active-scale text-xl font-bold"
              title="Clear Formatting"
            >
              ×
            </button>
          </div>
        </div>
      </div>

      {/* Editor Area - Clean and Distraction-Free */}
      <div class="flex-1 overflow-y-auto bg-white">
        <div class="max-w-4xl mx-auto px-6 py-8">
          <div
            ref={editorRef}
            contentEditable
            onInput={handleContentChange}
            onKeyDown={startTypingTimer}
            onKeyUp={handleContentChange}
            onPaste={handleContentChange}
            class="min-h-[500px] focus:outline-none prose prose-lg max-w-none"
            style={{
              "min-height": "500px",
            }}
            data-placeholder="Begin your pilgrimage journey here... Share your thoughts, reflections, and sacred moments."
          />
        </div>
      </div>

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
          font-style: italic;
        }

        [contenteditable] {
          outline: none;
        }

        [contenteditable] h1 {
          font-size: 2.5em;
          font-weight: 800;
          margin: 0.67em 0;
          font-family: 'Playfair Display', Georgia, serif;
          color: #1F2937;
        }

        [contenteditable] h2 {
          font-size: 2em;
          font-weight: 700;
          margin: 0.75em 0;
          font-family: 'Playfair Display', Georgia, serif;
          color: #1F2937;
        }

        [contenteditable] p {
          margin: 1.25em 0;
          line-height: 1.75;
          color: #374151;
        }

        [contenteditable] blockquote {
          border-left: 4px solid #015D7C;
          padding-left: 1.5em;
          margin: 1.5em 0;
          color: #6b7280;
          font-style: italic;
          background: #F0F9FE;
          padding: 1em 1.5em;
          border-radius: 0 8px 8px 0;
        }

        [contenteditable] ul,
        [contenteditable] ol {
          margin: 1.5em 0;
          padding-left: 2.5em;
        }

        [contenteditable] ul {
          list-style-type: disc;
        }

        [contenteditable] ol {
          list-style-type: decimal;
        }

        [contenteditable] li {
          margin: 0.5em 0;
          line-height: 1.75;
        }

        [contenteditable] strong,
        [contenteditable] b {
          font-weight: 700;
          color: #1F2937;
        }

        [contenteditable] em,
        [contenteditable] i {
          font-style: italic;
        }

        [contenteditable] u {
          text-decoration: underline;
        }

        [contenteditable]:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
};

export default Editor;
