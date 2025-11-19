import { createSignal, createResource, For, Show, onMount } from 'solid-js';
import { navigationStore } from '../stores/navigationStore';
import { textNotesDB, audioNotesDB, imageNotesDB } from '../lib/db';
import { sites } from '../data/sites';
import type { TextNote, AudioNote, ImageNote, Note, Site } from '../types';
import Sites from './Sites';
import SitePage from './SitePage';
import Editor from './Editor';

type ViewMode = 'notes' | 'sites';

interface SiteWithCounts extends Site {
  textCount: number;
  audioCount: number;
  imageCount: number;
  totalCount: number;
}

const NotesList = () => {
  const [viewMode, setViewMode] = createSignal<ViewMode>('notes');
  const [searchQuery, setSearchQuery] = createSignal('');

  // Load all notes from IndexedDB
  const [allNotes] = createResource(async () => {
    const [textNotes, audioNotes, imageNotes] = await Promise.all([
      textNotesDB.getAll(),
      audioNotesDB.getAll(),
      imageNotesDB.getAll(),
    ]);

    // Combine and sort by date (newest first)
    const combined: Note[] = [
      ...textNotes,
      ...audioNotes,
      ...imageNotes,
    ].sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());

    return {
      all: combined,
      text: textNotes,
      audio: audioNotes,
      image: imageNotes,
    };
  });

  // Calculate site counts
  const sitesWithCounts = () => {
    const notes = allNotes();
    if (!notes) return [];

    return sites.map(site => {
      const textCount = notes.text.filter(n => n.site === site.name).length;
      const audioCount = notes.audio.filter(n => n.site === site.name).length;
      const imageCount = notes.image.filter(n => n.site === site.name).length;

      return {
        ...site,
        textCount,
        audioCount,
        imageCount,
        totalCount: textCount + audioCount + imageCount,
      } as SiteWithCounts;
    });
  };

  // Filter notes based on search query
  const filteredNotes = () => {
    const notes = allNotes();
    if (!notes) return [];

    const query = searchQuery().toLowerCase();
    if (!query) return notes.all;

    return notes.all.filter(note => {
      const titleMatch = note.title.toLowerCase().includes(query);
      const siteMatch = note.site.toLowerCase().includes(query);
      const bodyMatch = note.type === 'text' && (note as TextNote).body.toLowerCase().includes(query);
      return titleMatch || siteMatch || bodyMatch;
    });
  };

  // Filter sites based on search query
  const filteredSites = () => {
    const query = searchQuery().toLowerCase();
    if (!query) return sitesWithCounts();

    return sitesWithCounts().filter(site => {
      const nameMatch = site.name.toLowerCase().includes(query);
      const cityMatch = site.city.toLowerCase().includes(query);
      const quoteMatch = site.quote.toLowerCase().includes(query);
      return nameMatch || cityMatch || quoteMatch;
    });
  };

  const handleNoteClick = (note: Note) => {
    if (note.type === 'text') {
      // Navigate to Editor for editing text note
      navigationStore.push(<Editor noteId={note.id} />);
    } else {
      // For audio/image notes, navigate to the site page
      const site = sites.find(s => s.name === note.site);
      if (site) {
        navigationStore.push(<SitePage site={site} />);
      }
    }
  };

  const handleSiteClick = (site: Site) => {
    navigationStore.push(<SitePage site={site} />);
  };

  const handleAddNote = () => {
    // Navigate to Editor for creating new text note
    navigationStore.push(<Editor />);
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
    <div class="flex flex-col h-screen bg-gray-50">
      {/* Top Bar */}
      <div class="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <h1 class="text-2xl font-bold text-gray-900 mb-3">Pilgrim Notes</h1>

        {/* View Mode Toggle */}
        <div class="flex gap-2 mb-3">
          <button
            onClick={() => setViewMode('notes')}
            class={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              viewMode() === 'notes'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Notes View
          </button>
          <button
            onClick={() => setViewMode('sites')}
            class={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              viewMode() === 'sites'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Sites View
          </button>
        </div>

        {/* Search Bar */}
        <div class="relative">
          <input
            type="text"
            placeholder={viewMode() === 'notes' ? 'Search notes...' : 'Search sites...'}
            value={searchQuery()}
            onInput={(e) => setSearchQuery(e.currentTarget.value)}
            class="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        </div>
      </div>

      {/* Content Area */}
      <div class="flex-1 overflow-y-auto">
        <Show
          when={!allNotes.loading}
          fallback={
            <div class="flex items-center justify-center h-full">
              <div class="text-gray-500">Loading...</div>
            </div>
          }
        >
          <Show when={viewMode() === 'sites'}>
            {/* Sites Grid View */}
            <div class="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <For each={filteredSites()}>
                {(site) => (
                  <div
                    onClick={() => handleSiteClick(site)}
                    class="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-transform hover:scale-105 active:scale-95"
                  >
                    <div class="aspect-video w-full overflow-hidden bg-gray-200">
                      <img
                        src={site.image}
                        alt={site.name}
                        class="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div class="p-3">
                      <h3 class="font-semibold text-sm text-gray-900 line-clamp-2 mb-1">
                        {site.name}
                      </h3>
                      <p class="text-xs text-gray-600 mb-2">{site.city}</p>
                      <p class="text-xs text-gray-500 line-clamp-2 mb-2">
                        {site.quote}
                      </p>
                      <Show when={site.totalCount > 0}>
                        <div class="flex gap-2 text-xs text-gray-600">
                          <Show when={site.textCount > 0}>
                            <span>📝 {site.textCount}</span>
                          </Show>
                          <Show when={site.audioCount > 0}>
                            <span>🎤 {site.audioCount}</span>
                          </Show>
                          <Show when={site.imageCount > 0}>
                            <span>📷 {site.imageCount}</span>
                          </Show>
                        </div>
                      </Show>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </Show>

          <Show when={viewMode() === 'notes'}>
            {/* Notes List View */}
            <div class="p-4 space-y-3">
              <Show
                when={filteredNotes().length > 0}
                fallback={
                  <div class="text-center py-12 text-gray-500">
                    <p class="text-lg mb-2">No notes yet</p>
                    <p class="text-sm">Tap the + button to create your first note</p>
                  </div>
                }
              >
                <For each={filteredNotes()}>
                  {(note) => (
                    <div
                      onClick={() => handleNoteClick(note)}
                      class="bg-white rounded-lg shadow-sm p-4 cursor-pointer transition-shadow hover:shadow-md active:shadow-sm"
                    >
                      <div class="flex items-start gap-3">
                        <div class="text-2xl flex-shrink-0">
                          {getNoteIcon(note)}
                        </div>
                        <div class="flex-1 min-w-0">
                          <h3 class="font-semibold text-gray-900 truncate mb-1">
                            {note.title}
                          </h3>
                          <p class="text-sm text-gray-600 mb-2">{note.site}</p>
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
              </Show>
            </div>
          </Show>
        </Show>
      </div>

      {/* FAB Button for adding new text note */}
      <Show when={viewMode() === 'notes'}>
        <button
          onClick={handleAddNote}
          class="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-blue-700 active:bg-blue-800 transition-colors"
          aria-label="Add new note"
        >
          +
        </button>
      </Show>
    </div>
  );
};

export default NotesList;
