import { createSignal, onMount, For, Show } from 'solid-js';
import { navigationStore } from '../stores/navigationStore';
import { textNotesDB, audioNotesDB, imageNotesDB } from '../lib/db';
import { sites } from '../data/sites';
import { colors } from '../styles/colors';
import type { TextNote, AudioNote, ImageNote } from '../types';
import TextNoteCard from '../components/TextNoteCard';
import AudioNoteCard from '../components/AudioNoteCard';
import ImageNoteCard from '../components/ImageNoteCard';
import SiteCard from '../components/SiteCard';
import Editor from './Editor';
import Print from './Print';
import { v4 as uuidv4 } from 'uuid';
import toast from 'solid-toast';

const NotesList = () => {
  const [textNotes, setTextNotes] = createSignal<TextNote[]>([]);
  const [audioNotes, setAudioNotes] = createSignal<AudioNote[]>([]);
  const [imageNotes, setImageNotes] = createSignal<ImageNote[]>([]);
  const [search, setSearch] = createSignal('');
  const [showSites, setShowSites] = createSignal(true);
  const [loading, setLoading] = createSignal(true);

  onMount(async () => {
    await loadData();
    setLoading(false);
  });

  const loadData = async () => {
    try {
      const [texts, audios, images] = await Promise.all([
        textNotesDB.getAll(),
        audioNotesDB.getAll(),
        imageNotesDB.getAll(),
      ]);
      setTextNotes(texts);
      setAudioNotes(audios);
      setImageNotes(images);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load notes');
    }
  };

  const allNotes = () => {
    const all: Array<TextNote | AudioNote | ImageNote> = [
      ...textNotes(),
      ...audioNotes(),
      ...imageNotes(),
    ];
    return all.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
  };

  const filteredNotes = () => {
    const searchTerm = search().toLowerCase();
    if (!searchTerm) return allNotes();
    return allNotes().filter((note) =>
      `${note.site} ${note.title} ${note.type}`.toLowerCase().includes(searchTerm)
    );
  };

  const filteredSites = () => {
    const searchTerm = search().toLowerCase();
    const sorted = [...sites].sort((a, b) => a.index - b.index);
    if (!searchTerm) return sorted;
    return sorted.filter((site) =>
      `${site.name} ${site.city}`.toLowerCase().includes(searchTerm)
    );
  };

  const handleMenuPress = () => {
    navigationStore.push(Print);
  };

  const handleToggleView = () => {
    setShowSites(!showSites());
  };

  const startNewNote = () => {
    navigationStore.push(() => (
      <Editor
        note={{
          id: uuidv4(),
          title: '',
          site: 'Shrine of the Báb',
          body: '',
          type: 'text',
          created: new Date().toISOString(),
        }}
      />
    ));
  };

  return (
    <div class="h-screen w-full flex flex-col" style={{ background: colors.white }}>
      {/* Top Bar - Exact match to React Native */}
      <div
        class="w-full px-1 flex items-center"
        style={{
          background: colors.primaryBg,
          height: '50px',
        }}
      >
        {/* Menu Button */}
        <button
          onClick={handleMenuPress}
          class="p-2"
          style={{ background: colors.primaryBg }}
        >
          <svg
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            stroke={colors.primaryText}
            stroke-width="2"
          >
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>

        {/* Search Input */}
        <input
          type="text"
          placeholder="Search..."
          value={search()}
          onInput={(e) => setSearch(e.currentTarget.value)}
          class="flex-1 mx-2 px-3 py-2 rounded-md text-lg"
          style={{
            background: colors.white,
            color: colors.primaryText,
            border: `1px solid ${colors.white}`,
            'font-size': '18px',
          }}
        />

        {/* Toggle Button */}
        <button
          onClick={handleToggleView}
          class="p-2"
          style={{ background: colors.primaryBg }}
        >
          <Show
            when={showSites()}
            fallback={
              <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke={colors.primaryText}
                stroke-width="2"
              >
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          >
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              stroke={colors.primaryText}
              stroke-width="2"
            >
              <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </Show>
        </button>
      </div>

      {/* Content Area */}
      <div class="flex-1 overflow-y-auto">
        <Show when={!loading()} fallback={<div class="p-6 text-center">Loading...</div>}>
          {/* Notes View */}
          <Show when={!showSites()}>
            <Show
              when={filteredNotes().length > 0}
              fallback={
                <div
                  class="m-6 mt-12 p-4 rounded-lg"
                  style={{ background: colors.primaryBg }}
                >
                  <div
                    class="text-2xl mb-2"
                    style={{ color: colors.primaryText }}
                  >
                    Alláh-u-Abhá! Welcome!
                  </div>
                  <div
                    class="text-lg mb-4"
                    style={{ color: colors.primaryText }}
                  >
                    Once you write a note, take a picture or record an audio note you can find them all here!
                  </div>
                  <button
                    onClick={startNewNote}
                    class="p-2 mx-4 my-4 rounded-md"
                    style={{
                      background: colors.primaryText,
                    }}
                  >
                    <div class="text-lg text-center" style={{ color: colors.primaryBg }}>
                      Start a new note!
                    </div>
                  </button>
                </div>
              }
            >
              <For each={filteredNotes()}>
                {(note) => (
                  <Show
                    when={note.type === 'text'}
                    fallback={
                      <Show
                        when={note.type === 'audio'}
                        fallback={<ImageNoteCard note={note as ImageNote} onUpdate={loadData} />}
                      >
                        <AudioNoteCard note={note as AudioNote} onUpdate={loadData} />
                      </Show>
                    }
                  >
                    <TextNoteCard note={note as TextNote} onUpdate={loadData} />
                  </Show>
                )}
              </For>
            </Show>
          </Show>

          {/* Sites View */}
          <Show when={showSites()}>
            <For each={filteredSites()}>
              {(site) => {
                const numNotes = textNotes().filter((n) => n.site === site.name).length;
                const numAudio = audioNotes().filter((n) => n.site === site.name).length;
                const numImages = imageNotes().filter((n) => n.site === site.name).length;
                return (
                  <SiteCard
                    site={site}
                    numNotes={numNotes}
                    numAudio={numAudio}
                    numImages={numImages}
                    onUpdate={loadData}
                  />
                );
              }}
            </For>
          </Show>

          {/* Bottom Spacer */}
          <div style={{ height: '200px' }} />
        </Show>
      </div>
    </div>
  );
};

export default NotesList;
