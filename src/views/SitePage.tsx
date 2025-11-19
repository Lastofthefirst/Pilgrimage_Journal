import { createSignal, createResource, For, Show } from 'solid-js';
import { navigationStore } from '../stores/navigationStore';
import { textNotesDB, audioNotesDB, imageNotesDB } from '../lib/db';
import type { Site, Note, TextNote } from '../types';
import Editor from './Editor';

interface SitePageProps {
  site: Site;
}

const SitePage = (props: SitePageProps) => {
  const [copiedAddress, setCopiedAddress] = createSignal(false);

  // Load all notes for this site
  const [siteNotes] = createResource(async () => {
    const [textNotes, audioNotes, imageNotes] = await Promise.all([
      textNotesDB.getBySite(props.site.name),
      audioNotesDB.getBySite(props.site.name),
      imageNotesDB.getBySite(props.site.name),
    ]);

    // Combine and sort by date (newest first)
    const combined: Note[] = [
      ...textNotes,
      ...audioNotes,
      ...imageNotes,
    ].sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());

    return combined;
  });

  const handleBack = () => {
    navigationStore.pop();
  };

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(props.site.address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  const handleQuickAction = (action: 'note' | 'audio' | 'photo') => {
    if (action === 'note') {
      // Navigate to Editor with pre-selected site
      navigationStore.push(<Editor initialSite={props.site.name} />);
    } else {
      // TODO: Implement audio and photo actions
      console.log(`Quick action: ${action} for ${props.site.name}`);
    }
  };

  const handleNoteClick = (note: Note) => {
    if (note.type === 'text') {
      // Navigate to Editor for editing text note
      navigationStore.push(<Editor noteId={note.id} />);
    } else {
      // TODO: Implement audio and image note viewers
      console.log('View note:', note);
    }
  };

  const getNoteIcon = (note: Note) => {
    switch (note.type) {
      case 'text':
        return '📝';
      case 'audio':
        return '🎤';
      case 'image':
        return '📷';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div class="min-h-screen bg-gray-50">
      {/* Header with Back Button */}
      <div class="bg-white border-b border-gray-200 px-4 py-3 shadow-sm sticky top-0 z-10">
        <button
          onClick={handleBack}
          class="flex items-center gap-2 text-blue-600 hover:text-blue-700 active:text-blue-800 font-medium mb-2"
        >
          <span class="text-xl">←</span>
          <span>Back</span>
        </button>
      </div>

      {/* Site Image */}
      <div class="w-full aspect-[16/9] bg-gray-200 overflow-hidden">
        <img
          src={props.site.image}
          alt={props.site.name}
          class="w-full h-full object-cover"
        />
      </div>

      {/* Site Content */}
      <div class="p-4 space-y-6">
        {/* Site Name and City */}
        <div>
          <h1 class="text-2xl font-bold text-gray-900 mb-2">{props.site.name}</h1>
          <p class="text-lg text-gray-600">{props.site.city}</p>
        </div>

        {/* Quote */}
        <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
          <p class="text-gray-800 italic leading-relaxed mb-2">
            {props.site.quote}
          </p>
          <Show when={props.site.reference}>
            <p class="text-sm text-gray-600">— {props.site.reference}</p>
          </Show>
        </div>

        {/* Address */}
        <Show when={props.site.address}>
          <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1">
                <h3 class="font-semibold text-gray-900 mb-2">Address</h3>
                <p class="text-gray-700 text-sm">{props.site.address}</p>
              </div>
              <button
                onClick={handleCopyAddress}
                class="flex-shrink-0 px-3 py-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-lg transition-colors text-sm font-medium"
              >
                {copiedAddress() ? '✓ Copied' : '📋 Copy'}
              </button>
            </div>
          </div>
        </Show>

        {/* Quick Action Buttons */}
        <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <h3 class="font-semibold text-gray-900 mb-3">Add to this site</h3>
          <div class="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleQuickAction('note')}
              class="flex flex-col items-center gap-2 py-4 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 active:bg-blue-200 transition-colors"
            >
              <span class="text-3xl">📝</span>
              <span class="text-sm font-medium">Text Note</span>
            </button>
            <button
              onClick={() => handleQuickAction('audio')}
              class="flex flex-col items-center gap-2 py-4 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 active:bg-purple-200 transition-colors"
            >
              <span class="text-3xl">🎤</span>
              <span class="text-sm font-medium">Audio</span>
            </button>
            <button
              onClick={() => handleQuickAction('photo')}
              class="flex flex-col items-center gap-2 py-4 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 active:bg-green-200 transition-colors"
            >
              <span class="text-3xl">📷</span>
              <span class="text-sm font-medium">Photo</span>
            </button>
          </div>
        </div>

        {/* Notes List */}
        <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <h3 class="font-semibold text-gray-900 mb-3">
            Your Notes
            <Show when={siteNotes()}>
              <span class="ml-2 text-sm font-normal text-gray-600">
                ({siteNotes()!.length})
              </span>
            </Show>
          </h3>

          <Show
            when={!siteNotes.loading}
            fallback={
              <div class="text-center py-8 text-gray-500">Loading notes...</div>
            }
          >
            <Show
              when={siteNotes() && siteNotes()!.length > 0}
              fallback={
                <div class="text-center py-8 text-gray-500">
                  <p class="mb-2">No notes yet for this site</p>
                  <p class="text-sm">Use the buttons above to add your first note</p>
                </div>
              }
            >
              <div class="space-y-3">
                <For each={siteNotes()}>
                  {(note) => (
                    <div
                      onClick={() => handleNoteClick(note)}
                      class="p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                    >
                      <div class="flex items-start gap-3">
                        <div class="text-2xl flex-shrink-0">
                          {getNoteIcon(note)}
                        </div>
                        <div class="flex-1 min-w-0">
                          <h4 class="font-medium text-gray-900 truncate mb-1">
                            {note.title}
                          </h4>
                          <Show when={note.type === 'text'}>
                            <div
                              class="text-sm text-gray-700 line-clamp-2 mb-2"
                              innerHTML={(note as TextNote).body}
                            />
                          </Show>
                          <p class="text-xs text-gray-500">
                            {formatDate(note.created)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </Show>
          </Show>
        </div>
      </div>
    </div>
  );
};

export default SitePage;
