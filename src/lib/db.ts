import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { TextNote, AudioNote, ImageNote } from '../types';

interface PilgrimNotesDB extends DBSchema {
  textNotes: {
    key: string;
    value: TextNote;
    indexes: { 'by-site': string; 'by-created': string };
  };
  audioNotes: {
    key: string;
    value: AudioNote;
    indexes: { 'by-site': string; 'by-created': string };
  };
  imageNotes: {
    key: string;
    value: ImageNote;
    indexes: { 'by-site': string; 'by-created': string };
  };
  mediaBlobs: {
    key: string;
    value: Blob;
  };
}

let dbPromise: Promise<IDBPDatabase<PilgrimNotesDB>> | null = null;

const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<PilgrimNotesDB>('pilgrim-notes-db', 1, {
      upgrade(db) {
        // Text notes store
        const textStore = db.createObjectStore('textNotes', { keyPath: 'id' });
        textStore.createIndex('by-site', 'site');
        textStore.createIndex('by-created', 'created');

        // Audio notes store
        const audioStore = db.createObjectStore('audioNotes', { keyPath: 'id' });
        audioStore.createIndex('by-site', 'site');
        audioStore.createIndex('by-created', 'created');

        // Image notes store
        const imageStore = db.createObjectStore('imageNotes', { keyPath: 'id' });
        imageStore.createIndex('by-site', 'site');
        imageStore.createIndex('by-created', 'created');

        // Media blobs store (for storing actual audio/image files)
        db.createObjectStore('mediaBlobs');
      },
    });
  }
  return dbPromise;
};

// Text Notes operations
export const textNotesDB = {
  async getAll(): Promise<TextNote[]> {
    const db = await getDB();
    return db.getAll('textNotes');
  },

  async get(id: string): Promise<TextNote | undefined> {
    const db = await getDB();
    return db.get('textNotes', id);
  },

  async add(note: TextNote): Promise<void> {
    const db = await getDB();
    await db.put('textNotes', note);
  },

  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('textNotes', id);
  },

  async getBySite(site: string): Promise<TextNote[]> {
    const db = await getDB();
    return db.getAllFromIndex('textNotes', 'by-site', site);
  },
};

// Audio Notes operations
export const audioNotesDB = {
  async getAll(): Promise<AudioNote[]> {
    const db = await getDB();
    return db.getAll('audioNotes');
  },

  async get(id: string): Promise<AudioNote | undefined> {
    const db = await getDB();
    return db.get('audioNotes', id);
  },

  async add(note: AudioNote): Promise<void> {
    const db = await getDB();
    await db.put('audioNotes', note);
  },

  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('audioNotes', id);
  },

  async getBySite(site: string): Promise<AudioNote[]> {
    const db = await getDB();
    return db.getAllFromIndex('audioNotes', 'by-site', site);
  },
};

// Image Notes operations
export const imageNotesDB = {
  async getAll(): Promise<ImageNote[]> {
    const db = await getDB();
    return db.getAll('imageNotes');
  },

  async get(id: string): Promise<ImageNote | undefined> {
    const db = await getDB();
    return db.get('imageNotes', id);
  },

  async add(note: ImageNote): Promise<void> {
    const db = await getDB();
    await db.put('imageNotes', note);
  },

  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('imageNotes', id);
  },

  async getBySite(site: string): Promise<ImageNote[]> {
    const db = await getDB();
    return db.getAllFromIndex('imageNotes', 'by-site', site);
  },
};

// Media Blobs operations (for storing actual files)
export const mediaBlobsDB = {
  async get(id: string): Promise<Blob | undefined> {
    const db = await getDB();
    return db.get('mediaBlobs', id);
  },

  async add(id: string, blob: Blob): Promise<void> {
    const db = await getDB();
    await db.put('mediaBlobs', blob, id);
  },

  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('mediaBlobs', id);
  },
};

// Utility function to convert Blob to data URL for display
export const blobToDataURL = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
