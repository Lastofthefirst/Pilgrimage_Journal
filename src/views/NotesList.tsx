import { createSignal, createResource, For, Show, onMount } from 'solid-js';
import { navigationStore } from '../stores/navigationStore';
import { textNotesDB, audioNotesDB, imageNotesDB } from '../lib/db';
import { sites } from '../data/sites';
import type { TextNote, AudioNote, ImageNote, Note, Site } from '../types';
import Sites from './Sites';
import SitePage from './SitePage';
import Editor from './Editor';
import Print from './Print';
import Card from '../components/Card';
import BottomNav, { type TabId } from '../components/BottomNav';
import Icon from '../components/ui/Icon';

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
  const [searchFocused, setSearchFocused] = createSignal(false);
  const [activeTab, setActiveTab] = createSignal<TabId>('notes');
  const [showMenuModal, setShowMenuModal] = createSignal(false);

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

  const handleExportToPDF = () => {
    // Navigate to Print view for PDF export
    navigationStore.push(<Print />);
  };

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);

    switch (tab) {
      case 'notes':
        setViewMode('notes');
        setShowMenuModal(false);
        break;
      case 'sites':
        setViewMode('sites');
        setShowMenuModal(false);
        break;
      case 'add':
        handleAddNote();
        break;
      case 'menu':
        setShowMenuModal(true);
        break;
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
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    }).format(date);
  };

  return (
    <div class="flex flex-col h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      {/* Beautiful Header with Gradient */}
      <div class="bg-gradient-to-br from-[#015D7C] via-[#0284A8] to-[#0891B2] shadow-lg">
        <div class="px-6 pt-6 pb-5">
          {/* Title */}
          <h1 class="text-3xl font-display font-bold text-white mb-6 tracking-tight">
            Pilgrim Notes
          </h1>

          {/* Animated Search Bar */}
          <div class={`transition-all duration-300 ${searchFocused() ? 'scale-[1.02]' : ''}`}>
            <div class="relative">
              <input
                type="text"
                placeholder={viewMode() === 'notes' ? 'Search your notes...' : 'Search sacred sites...'}
                value={searchQuery()}
                onInput={(e) => setSearchQuery(e.currentTarget.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                class="w-full px-5 py-4 pl-14 bg-white/95 backdrop-blur-md border-2 border-white/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-white/30 focus:border-white text-gray-900 placeholder-gray-500 shadow-xl transition-all font-medium"
              />
              <span class="absolute left-5 top-1/2 -translate-y-1/2 text-2xl">
                🔍
              </span>
              <Show when={searchQuery()}>
                <button
                  onClick={() => setSearchQuery('')}
                  class="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full transition-colors active-scale"
                >
                  <span class="text-gray-600 text-lg">×</span>
                </button>
              </Show>
            </div>
          </div>

          {/* Export to PDF Button */}
          <Show when={(allNotes()?.all.length || 0) > 0}>
            <button
              onClick={handleExportToPDF}
              class="w-full mt-4 py-3.5 px-5 glass-dark text-white rounded-2xl font-bold hover:bg-white/80 hover:text-[#015D7C] active:scale-98 transition-all shadow-xl flex items-center justify-center gap-3"
            >
              <span class="text-2xl">📖</span>
              <span>Export to PDF</span>
              <span class="ml-auto bg-white/30 px-3 py-1 rounded-full text-xs font-semibold">
                {allNotes()?.all.length}
              </span>
            </button>
          </Show>
        </div>
      </div>

      {/* Content Area - padding for BottomNav */}
      <div class="flex-1 overflow-y-auto pb-24">
        <Show
          when={!allNotes.loading}
          fallback={
            <div class="flex flex-col items-center justify-center h-full">
              <div class="animate-pulse text-6xl mb-4">📖</div>
              <div class="text-gray-600 font-medium">Loading your pilgrimage...</div>
            </div>
          }
        >
          <Show when={viewMode() === 'sites'}>
            {/* Sites Grid View */}
            <div class="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              <Show
                when={filteredSites().length > 0}
                fallback={
                  <div class="col-span-full text-center py-16">
                    <div class="text-6xl mb-4 animate-pulse">🔍</div>
                    <p class="text-xl text-gray-600 font-medium mb-2">No sites found</p>
                    <p class="text-sm text-gray-500">Try a different search term</p>
                  </div>
                }
              >
                <For each={filteredSites()}>
                  {(site) => (
                    <Card
                      image={site.image}
                      imageAlt={site.name}
                      onClick={() => handleSiteClick(site)}
                      hoverable
                      variant="elevated"
                      imageGradient
                    >
                      <div class="space-y-2">
                        <h3 class="font-display font-bold text-xl text-gray-900 line-clamp-2 leading-tight">
                          {site.name}
                        </h3>
                        <p class="text-sm text-gray-600 font-medium flex items-center gap-1">
                          <span>📍</span>
                          {site.city}
                        </p>
                        <p class="text-sm text-gray-600 line-clamp-2 italic leading-relaxed">
                          "{site.quote}"
                        </p>
                        <Show when={site.totalCount > 0}>
                          <div class="flex gap-3 pt-2 border-t border-gray-100">
                            <Show when={site.textCount > 0}>
                              <div class="flex items-center gap-1 text-xs font-semibold text-[#015D7C] bg-blue-50 px-2 py-1 rounded-lg">
                                <span>📝</span>
                                <span>{site.textCount}</span>
                              </div>
                            </Show>
                            <Show when={site.audioCount > 0}>
                              <div class="flex items-center gap-1 text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">
                                <span>🎤</span>
                                <span>{site.audioCount}</span>
                              </div>
                            </Show>
                            <Show when={site.imageCount > 0}>
                              <div class="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                                <span>📷</span>
                                <span>{site.imageCount}</span>
                              </div>
                            </Show>
                          </div>
                        </Show>
                      </div>
                    </Card>
                  )}
                </For>
              </Show>
            </div>
          </Show>

          <Show when={viewMode() === 'notes'}>
            {/* Notes List View */}
            <div class="p-5 space-y-4 max-w-4xl mx-auto">
              <Show
                when={filteredNotes().length > 0}
                fallback={
                  <div class="text-center py-20">
                    <div class="text-7xl mb-6 animate-float">✍️</div>
                    <p class="text-2xl font-bold text-gray-800 mb-3">
                      {searchQuery() ? 'No notes found' : 'Begin Your Journey'}
                    </p>
                    <p class="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                      {searchQuery()
                        ? 'Try a different search term'
                        : 'Capture your pilgrimage moments, reflections, and sacred experiences'}
                    </p>
                    <Show when={!searchQuery()}>
                      <button
                        onClick={handleAddNote}
                        class="bg-gradient-to-r from-[#015D7C] to-[#0284A8] text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
                      >
                        Create Your First Note
                      </button>
                    </Show>
                  </div>
                }
              >
                <For each={filteredNotes()}>
                  {(note) => (
                    <div
                      onClick={() => handleNoteClick(note)}
                      class="bg-white rounded-2xl shadow-md hover:shadow-2xl p-5 cursor-pointer transition-all duration-300 hover:-translate-y-1 active-scale border border-gray-100 animate-scale-in"
                    >
                      <div class="flex items-start gap-4">
                        <div class="text-4xl flex-shrink-0 mt-1">
                          {getNoteIcon(note)}
                        </div>
                        <div class="flex-1 min-w-0">
                          <h3 class="font-bold text-xl text-gray-900 mb-2 line-clamp-1">
                            {note.title || 'Untitled Note'}
                          </h3>
                          <div class="flex items-center gap-2 mb-3">
                            <span class="text-sm font-medium text-[#015D7C] bg-blue-50 px-3 py-1 rounded-full">
                              {note.site}
                            </span>
                            <span class="text-xs text-gray-500 font-medium">
                              {formatDate(note.created)}
                            </span>
                          </div>
                          <Show when={note.type === 'text'}>
                            <div
                              class="text-gray-700 line-clamp-2 leading-relaxed prose prose-sm max-w-none"
                              innerHTML={(note as TextNote).body}
                            />
                          </Show>
                        </div>
                        <div class="text-gray-400 text-xl flex-shrink-0">
                          →
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

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab()} onTabChange={handleTabChange} />

      {/* Menu Modal */}
      <Show when={showMenuModal()}>
        <div
          class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end justify-center p-4"
          onClick={() => setShowMenuModal(false)}
        >
          <div
            class="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div class="p-6">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-bold text-gray-900">Menu</h2>
                <button
                  onClick={() => setShowMenuModal(false)}
                  class="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Close menu"
                >
                  <Icon name="x-mark" size={24} class="text-gray-600" />
                </button>
              </div>

              <div class="flex flex-col gap-3">
                <button
                  onClick={() => {
                    handleExportToPDF();
                    setShowMenuModal(false);
                  }}
                  class="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-[#015D7C]/10 to-[#0284A8]/10 hover:from-[#015D7C]/20 hover:to-[#0284A8]/20 transition-all active:scale-95"
                >
                  <div class="w-12 h-12 rounded-full bg-gradient-to-br from-[#015D7C] to-[#0284A8] flex items-center justify-center">
                    <Icon name="printer" size={24} class="text-white" />
                  </div>
                  <div class="flex-1 text-left">
                    <h3 class="font-semibold text-gray-900">Export to PDF</h3>
                    <p class="text-sm text-gray-600">Print or save your notes</p>
                  </div>
                  <Icon name="chevron-right" size={20} class="text-gray-400" />
                </button>

                <button
                  onClick={() => {
                    // TODO: Add share functionality
                    setShowMenuModal(false);
                  }}
                  class="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all active:scale-95"
                >
                  <div class="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                    <Icon name="share" size={24} class="text-white" />
                  </div>
                  <div class="flex-1 text-left">
                    <h3 class="font-semibold text-gray-900">Share</h3>
                    <p class="text-sm text-gray-600">Share your journal</p>
                  </div>
                  <Icon name="chevron-right" size={20} class="text-gray-400" />
                </button>

                <button
                  onClick={() => {
                    // TODO: Add settings functionality
                    setShowMenuModal(false);
                  }}
                  class="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all active:scale-95"
                >
                  <div class="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                    <Icon name="cog-6-tooth" size={24} class="text-white" />
                  </div>
                  <div class="flex-1 text-left">
                    <h3 class="font-semibold text-gray-900">Settings</h3>
                    <p class="text-sm text-gray-600">App preferences</p>
                  </div>
                  <Icon name="chevron-right" size={20} class="text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
};

export default NotesList;
