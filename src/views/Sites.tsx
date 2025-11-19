import { createSignal, createResource, For, Show } from 'solid-js';
import { navigationStore } from '../stores/navigationStore';
import { textNotesDB, audioNotesDB, imageNotesDB } from '../lib/db';
import { sites } from '../data/sites';
import type { Site } from '../types';
import SitePage from './SitePage';

interface SiteWithCounts extends Site {
  textCount: number;
  audioCount: number;
  imageCount: number;
  totalCount: number;
}

const Sites = () => {
  // Load all notes to get counts per site
  const [noteCounts] = createResource(async () => {
    const [textNotes, audioNotes, imageNotes] = await Promise.all([
      textNotesDB.getAll(),
      audioNotesDB.getAll(),
      imageNotesDB.getAll(),
    ]);

    // Create a map of site name to counts
    const counts: Record<string, { text: number; audio: number; image: number }> = {};

    sites.forEach(site => {
      counts[site.name] = { text: 0, audio: 0, image: 0 };
    });

    textNotes.forEach(note => {
      if (counts[note.site]) counts[note.site].text++;
    });

    audioNotes.forEach(note => {
      if (counts[note.site]) counts[note.site].audio++;
    });

    imageNotes.forEach(note => {
      if (counts[note.site]) counts[note.site].image++;
    });

    return counts;
  });

  const sitesWithCounts = (): SiteWithCounts[] => {
    const counts = noteCounts();
    if (!counts) return sites.map(s => ({ ...s, textCount: 0, audioCount: 0, imageCount: 0, totalCount: 0 }));

    return sites.map(site => {
      const siteCount = counts[site.name] || { text: 0, audio: 0, image: 0 };
      return {
        ...site,
        textCount: siteCount.text,
        audioCount: siteCount.audio,
        imageCount: siteCount.image,
        totalCount: siteCount.text + siteCount.audio + siteCount.image,
      };
    });
  };

  const handleSiteClick = (site: Site) => {
    navigationStore.push(<SitePage site={site} />);
  };

  const handleQuickAction = (site: Site, action: 'note' | 'audio' | 'photo', e: Event) => {
    e.stopPropagation();
    // TODO: Implement quick actions
    console.log(`Quick action: ${action} for ${site.name}`);
  };

  return (
    <div class="min-h-screen bg-gray-50">
      {/* Header */}
      <div class="bg-white border-b border-gray-200 px-4 py-4 shadow-sm sticky top-0 z-10">
        <h1 class="text-2xl font-bold text-gray-900">Holy Sites</h1>
        <p class="text-sm text-gray-600 mt-1">
          {sites.length} sacred locations
        </p>
      </div>

      {/* Sites Grid */}
      <div class="p-4">
        <Show
          when={!noteCounts.loading}
          fallback={
            <div class="flex items-center justify-center py-12">
              <div class="text-gray-500">Loading sites...</div>
            </div>
          }
        >
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <For each={sitesWithCounts()}>
              {(site) => (
                <div class="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
                  {/* Site Image */}
                  <div
                    onClick={() => handleSiteClick(site)}
                    class="aspect-video w-full overflow-hidden bg-gray-200 cursor-pointer"
                  >
                    <img
                      src={site.image}
                      alt={site.name}
                      class="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  {/* Site Info */}
                  <div
                    onClick={() => handleSiteClick(site)}
                    class="p-3 cursor-pointer"
                  >
                    <h3 class="font-semibold text-sm text-gray-900 line-clamp-2 mb-1">
                      {site.name}
                    </h3>
                    <p class="text-xs text-gray-600 mb-2">{site.city}</p>
                    <p class="text-xs text-gray-500 line-clamp-2 mb-3">
                      {site.quote.slice(0, 100)}...
                    </p>

                    {/* Note Counts */}
                    <Show when={site.totalCount > 0}>
                      <div class="flex gap-2 text-xs text-gray-600 mb-3 pb-3 border-b border-gray-200">
                        <Show when={site.textCount > 0}>
                          <span class="flex items-center gap-1">
                            📝 <span class="font-medium">{site.textCount}</span>
                          </span>
                        </Show>
                        <Show when={site.audioCount > 0}>
                          <span class="flex items-center gap-1">
                            🎤 <span class="font-medium">{site.audioCount}</span>
                          </span>
                        </Show>
                        <Show when={site.imageCount > 0}>
                          <span class="flex items-center gap-1">
                            📷 <span class="font-medium">{site.imageCount}</span>
                          </span>
                        </Show>
                      </div>
                    </Show>

                    {/* Quick Action Buttons */}
                    <div class="flex gap-2">
                      <button
                        onClick={(e) => handleQuickAction(site, 'note', e)}
                        class="flex-1 py-1.5 px-2 bg-blue-50 text-blue-600 rounded text-xs font-medium hover:bg-blue-100 active:bg-blue-200 transition-colors"
                        title="Add note"
                      >
                        📝
                      </button>
                      <button
                        onClick={(e) => handleQuickAction(site, 'audio', e)}
                        class="flex-1 py-1.5 px-2 bg-purple-50 text-purple-600 rounded text-xs font-medium hover:bg-purple-100 active:bg-purple-200 transition-colors"
                        title="Record audio"
                      >
                        🎤
                      </button>
                      <button
                        onClick={(e) => handleQuickAction(site, 'photo', e)}
                        class="flex-1 py-1.5 px-2 bg-green-50 text-green-600 rounded text-xs font-medium hover:bg-green-100 active:bg-green-200 transition-colors"
                        title="Take photo"
                      >
                        📷
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </For>
          </div>
        </Show>
      </div>
    </div>
  );
};

export default Sites;
