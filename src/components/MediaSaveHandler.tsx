import { v4 as uuidv4 } from 'uuid';
import toast from 'solid-toast';
import { imageNotesDB, audioNotesDB, mediaBlobsDB } from '../lib/db';
import { getCurrentDate, getEasyCreatedTime } from '../utils/date';
import type { ImageNote, AudioNote } from '../types';

/**
 * Saves an image note with its associated blob to IndexedDB
 * @param blob - The image blob to save
 * @param site - The site name associated with the image
 * @param title - Optional custom title (defaults to timestamp-based title)
 * @returns Promise<ImageNote> - The created image note object
 */
export async function saveImageNote(
  blob: Blob,
  site: string,
  title?: string
): Promise<ImageNote> {
  try {
    // Generate unique ID
    const id = uuidv4();

    // Create note object
    const imageNote: ImageNote = {
      id,
      title: title || `Photo - ${site}`,
      uri: id, // Use ID as reference to blob
      site,
      type: 'image',
      created: getCurrentDate(),
      easyCreatedTime: getEasyCreatedTime(),
    };

    // Save blob to mediaBlobs store
    await mediaBlobsDB.add(id, blob);

    // Save note metadata to imageNotes store
    await imageNotesDB.add(imageNote);

    toast.success('Photo saved successfully!');

    return imageNote;
  } catch (error: any) {
    const errorMsg = `Failed to save photo: ${error.message || 'Unknown error'}`;
    toast.error(errorMsg);
    throw new Error(errorMsg);
  }
}

/**
 * Saves an audio note with its associated blob to IndexedDB
 * @param blob - The audio blob to save
 * @param site - The site name associated with the audio
 * @param title - Optional custom title (defaults to timestamp-based title)
 * @returns Promise<AudioNote> - The created audio note object
 */
export async function saveAudioNote(
  blob: Blob,
  site: string,
  title?: string
): Promise<AudioNote> {
  try {
    // Generate unique ID
    const id = uuidv4();

    // Create note object
    const audioNote: AudioNote = {
      id,
      title: title || `Audio - ${site}`,
      uri: id, // Use ID as reference to blob
      site,
      type: 'audio',
      created: getCurrentDate(),
      easyCreatedTime: getEasyCreatedTime(),
    };

    // Save blob to mediaBlobs store
    await mediaBlobsDB.add(id, blob);

    // Save note metadata to audioNotes store
    await audioNotesDB.add(audioNote);

    toast.success('Audio recording saved successfully!');

    return audioNote;
  } catch (error: any) {
    const errorMsg = `Failed to save audio: ${error.message || 'Unknown error'}`;
    toast.error(errorMsg);
    throw new Error(errorMsg);
  }
}

/**
 * Deletes an image note and its associated blob from IndexedDB
 * @param id - The ID of the image note to delete
 */
export async function deleteImageNote(id: string): Promise<void> {
  try {
    // Delete the blob
    await mediaBlobsDB.delete(id);

    // Delete the note metadata
    await imageNotesDB.delete(id);

    toast.success('Photo deleted successfully');
  } catch (error: any) {
    const errorMsg = `Failed to delete photo: ${error.message || 'Unknown error'}`;
    toast.error(errorMsg);
    throw new Error(errorMsg);
  }
}

/**
 * Deletes an audio note and its associated blob from IndexedDB
 * @param id - The ID of the audio note to delete
 */
export async function deleteAudioNote(id: string): Promise<void> {
  try {
    // Delete the blob
    await mediaBlobsDB.delete(id);

    // Delete the note metadata
    await audioNotesDB.delete(id);

    toast.success('Audio recording deleted successfully');
  } catch (error: any) {
    const errorMsg = `Failed to delete audio: ${error.message || 'Unknown error'}`;
    toast.error(errorMsg);
    throw new Error(errorMsg);
  }
}

/**
 * Updates the title of an image note
 * @param id - The ID of the image note
 * @param newTitle - The new title
 */
export async function updateImageNoteTitle(id: string, newTitle: string): Promise<void> {
  try {
    const note = await imageNotesDB.get(id);
    if (!note) {
      throw new Error('Image note not found');
    }

    const updatedNote: ImageNote = {
      ...note,
      title: newTitle,
    };

    await imageNotesDB.add(updatedNote);
    toast.success('Title updated');
  } catch (error: any) {
    const errorMsg = `Failed to update title: ${error.message || 'Unknown error'}`;
    toast.error(errorMsg);
    throw new Error(errorMsg);
  }
}

/**
 * Updates the title of an audio note
 * @param id - The ID of the audio note
 * @param newTitle - The new title
 */
export async function updateAudioNoteTitle(id: string, newTitle: string): Promise<void> {
  try {
    const note = await audioNotesDB.get(id);
    if (!note) {
      throw new Error('Audio note not found');
    }

    const updatedNote: AudioNote = {
      ...note,
      title: newTitle,
    };

    await audioNotesDB.add(updatedNote);
    toast.success('Title updated');
  } catch (error: any) {
    const errorMsg = `Failed to update title: ${error.message || 'Unknown error'}`;
    toast.error(errorMsg);
    throw new Error(errorMsg);
  }
}

/**
 * Retrieves an image blob by ID
 * @param id - The ID of the image blob
 * @returns Promise<Blob | undefined> - The image blob or undefined if not found
 */
export async function getImageBlob(id: string): Promise<Blob | undefined> {
  try {
    return await mediaBlobsDB.get(id);
  } catch (error: any) {
    toast.error(`Failed to retrieve image: ${error.message || 'Unknown error'}`);
    return undefined;
  }
}

/**
 * Retrieves an audio blob by ID
 * @param id - The ID of the audio blob
 * @returns Promise<Blob | undefined> - The audio blob or undefined if not found
 */
export async function getAudioBlob(id: string): Promise<Blob | undefined> {
  try {
    return await mediaBlobsDB.get(id);
  } catch (error: any) {
    toast.error(`Failed to retrieve audio: ${error.message || 'Unknown error'}`);
    return undefined;
  }
}

/**
 * Gets all image notes for a specific site
 * @param site - The site name
 * @returns Promise<ImageNote[]> - Array of image notes
 */
export async function getImageNotesBySite(site: string): Promise<ImageNote[]> {
  try {
    return await imageNotesDB.getBySite(site);
  } catch (error: any) {
    toast.error(`Failed to load photos: ${error.message || 'Unknown error'}`);
    return [];
  }
}

/**
 * Gets all audio notes for a specific site
 * @param site - The site name
 * @returns Promise<AudioNote[]> - Array of audio notes
 */
export async function getAudioNotesBySite(site: string): Promise<AudioNote[]> {
  try {
    return await audioNotesDB.getBySite(site);
  } catch (error: any) {
    toast.error(`Failed to load audio recordings: ${error.message || 'Unknown error'}`);
    return [];
  }
}
