import { createSignal, createResource, For, Show } from 'solid-js';
import { navigationStore } from '../stores/navigationStore';
import { textNotesDB, audioNotesDB, imageNotesDB } from '../lib/db';
import type { Site, Note, TextNote } from '../types';
import Editor from './Editor';
import Card from '../components/Card';

interface SitePageProps {
  site: Site;
}

const SitePage = (props: SitePageProps) => {
  const [copiedAddress, setCopiedAddress] = createSignal(false);
  const [scrollY, setScrollY] = createSignal(0);

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
      navigationStore.push(<Editor initialSite={props.site.name} />);
    } else {
      // TODO: Implement audio and photo actions
      console.log(`Quick action: ${action} for ${props.site.name}`);
    }
  };

  const handleNoteClick = (note: Note) => {
    if (note.type === 'text') {
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

  // Track scroll for parallax effect
  const handleScroll = (e: Event) => {
    const target = e.currentTarget as HTMLDivElement;
    setScrollY(target.scrollTop);
  };

  return (
    <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-gray-50 overflow-hidden flex flex-col">
      {/* Floating Back Button - iOS Style */}
      <button
        onClick={handleBack}
        class="fixed top-6 left-6 z-50 w-10 h-10 glass text-[#015D7C] rounded-full shadow-xl flex items-center justify-center text-xl hover:scale-110 active:scale-95 transition-all duration-300"
        aria-label="Back"
      >
        <span class="ml-0.5">←</span>
      </button>

      {/* Scrollable Content */}
      <div class="flex-1 overflow-y-auto" onScroll={handleScroll}>
        {/* Parallax Hero Section */}
        <div class="relative h-96 overflow-hidden">
          {/* Hero Image with Parallax */}
          <div
            class="absolute inset-0 transform"
            style={{
              transform: `translateY(${scrollY() * 0.5}px)`,
              'will-change': 'transform',
            }}
          >
            <img
              src={props.site.image}
              alt={props.site.name}
              class="w-full h-full object-cover scale-110"
            />
          </div>

          {/* Gradient Overlay */}
          <div class="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/70" />

          {/* Hero Content */}
          <div class="absolute inset-0 flex flex-col justify-end p-8 pb-12">
            <h1 class="text-4xl md:text-5xl font-display font-bold text-white mb-3 leading-tight animate-slide-up drop-shadow-2xl">
              {props.site.name}
            </h1>
            <div class="flex items-center gap-2 text-white/90 text-lg animate-slide-up" style={{'animation-delay': '100ms'}}>
              <span class="text-2xl">📍</span>
              <span class="font-semibold">{props.site.city}</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div class="relative -mt-8 z-10">
          <div class="max-w-4xl mx-auto px-5 pb-8 space-y-6">
            {/* Quote Card */}
            <div class="bg-gradient-to-br from-white to-blue-50/30 rounded-3xl p-6 shadow-2xl border border-white animate-slide-up">
              <div class="flex items-start gap-4">
                <span class="text-4xl">💭</span>
                <div class="flex-1">
                  <p class="text-gray-800 italic leading-relaxed font-serif text-lg mb-3">
                    "{props.site.quote}"
                  </p>
                  <Show when={props.site.reference}>
                    <p class="text-sm font-semibold text-[#015D7C]">
                      — {props.site.reference}
                    </p>
                  </Show>
                </div>
              </div>
            </div>

            {/* Address Card */}
            <Show when={props.site.address}>
              <div class="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 animate-slide-up" style={{'animation-delay': '100ms'}}>
                <div class="flex items-start gap-4">
                  <div class="w-12 h-12 bg-gradient-to-br from-[#015D7C] to-[#0284A8] rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
                    📍
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="font-bold text-gray-900 mb-2 text-lg">Location</h3>
                    <p class="text-gray-700 leading-relaxed mb-4">{props.site.address}</p>
                    <button
                      onClick={handleCopyAddress}
                      class={`px-4 py-2 rounded-xl font-semibold transition-all active-scale ${
                        copiedAddress()
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {copiedAddress() ? '✓ Copied!' : '📋 Copy Address'}
                    </button>
                  </div>
                </div>
              </div>
            </Show>

            {/* Quick Action Buttons */}
            <div class="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 animate-slide-up" style={{'animation-delay': '200ms'}}>
              <h3 class="font-bold text-gray-900 mb-4 text-xl flex items-center gap-2">
                <span>✨</span>
                <span>Capture This Moment</span>
              </h3>
              <div class="grid grid-cols-3 gap-4">
                <button
                  onClick={() => handleQuickAction('note')}
                  class="flex flex-col items-center gap-3 py-6 bg-gradient-to-br from-blue-50 to-blue-100 text-[#015D7C] rounded-2xl hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all duration-300 border border-blue-200"
                >
                  <span class="text-4xl">📝</span>
                  <span class="text-sm font-bold">Write Note</span>
                </button>
                <button
                  onClick={() => handleQuickAction('audio')}
                  class="flex flex-col items-center gap-3 py-6 bg-gradient-to-br from-purple-50 to-purple-100 text-purple-600 rounded-2xl hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all duration-300 border border-purple-200"
                >
                  <span class="text-4xl">🎤</span>
                  <span class="text-sm font-bold">Record Audio</span>
                </button>
                <button
                  onClick={() => handleQuickAction('photo')}
                  class="flex flex-col items-center gap-3 py-6 bg-gradient-to-br from-green-50 to-green-100 text-green-600 rounded-2xl hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all duration-300 border border-green-200"
                >
                  <span class="text-4xl">📷</span>
                  <span class="text-sm font-bold">Add Photo</span>
                </button>
              </div>
            </div>

            {/* Notes List */}
            <div class="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 animate-slide-up" style={{'animation-delay': '300ms'}}>
              <div class="flex items-center justify-between mb-5">
                <h3 class="font-bold text-gray-900 text-xl flex items-center gap-2">
                  <span>📚</span>
                  <span>Your Notes</span>
                </h3>
                <Show when={siteNotes()}>
                  <span class="bg-blue-100 text-[#015D7C] px-4 py-1.5 rounded-full text-sm font-bold">
                    {siteNotes()!.length}
                  </span>
                </Show>
              </div>

              <Show
                when={!siteNotes.loading}
                fallback={
                  <div class="text-center py-12">
                    <div class="animate-pulse text-5xl mb-3">📖</div>
                    <div class="text-gray-500 font-medium">Loading notes...</div>
                  </div>
                }
              >
                <Show
                  when={siteNotes() && siteNotes()!.length > 0}
                  fallback={
                    <div class="text-center py-12">
                      <div class="text-6xl mb-4 animate-float">✍️</div>
                      <p class="text-gray-600 font-medium mb-2">No notes yet</p>
                      <p class="text-sm text-gray-500 mb-6">
                        Start capturing your experiences at this sacred site
                      </p>
                      <button
                        onClick={() => handleQuickAction('note')}
                        class="bg-gradient-to-r from-[#015D7C] to-[#0284A8] text-white px-6 py-3 rounded-2xl font-bold hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
                      >
                        Write Your First Note
                      </button>
                    </div>
                  }
                >
                  <div class="space-y-4">
                    <For each={siteNotes()}>
                      {(note) => (
                        <div
                          onClick={() => handleNoteClick(note)}
                          class="p-4 border-2 border-gray-100 rounded-2xl cursor-pointer hover:border-[#015D7C] hover:bg-blue-50/30 hover:shadow-lg active:scale-98 transition-all group"
                        >
                          <div class="flex items-start gap-4">
                            <div class="text-3xl flex-shrink-0">
                              {getNoteIcon(note)}
                            </div>
                            <div class="flex-1 min-w-0">
                              <h4 class="font-bold text-lg text-gray-900 mb-2 line-clamp-1 group-hover:text-[#015D7C] transition-colors">
                                {note.title || 'Untitled Note'}
                              </h4>
                              <Show when={note.type === 'text'}>
                                <div
                                  class="text-gray-700 line-clamp-2 leading-relaxed text-sm mb-2 prose prose-sm max-w-none"
                                  innerHTML={(note as TextNote).body}
                                />
                              </Show>
                              <p class="text-xs text-gray-500 font-medium">
                                {formatDate(note.created)}
                              </p>
                            </div>
                            <div class="text-gray-400 group-hover:text-[#015D7C] text-lg flex-shrink-0 transition-colors">
                              →
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
      </div>
    </div>
  );
};

export default SitePage;
