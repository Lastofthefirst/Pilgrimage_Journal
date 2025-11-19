/**
 * USAGE EXAMPLES FOR MEDIA CAPTURE COMPONENTS
 *
 * This file demonstrates how to use the media capture components
 * in the Pilgrim Notes PWA application.
 */

import { Component, createSignal, Show } from 'solid-js';
import {
  CameraCapture,
  PhotoPicker,
  AudioRecorder,
  saveImageNote,
  saveAudioNote,
} from './index';
import { navigationStore } from '../stores/navigationStore';
import NotesList from '../views/NotesList';
import Button from './Button';

/**
 * EXAMPLE 1: Using CameraCapture Component
 *
 * Full-screen camera interface for capturing photos
 */
const CameraExample: Component = () => {
  const [showCamera, setShowCamera] = createSignal(false);
  const selectedSite = 'House of 'Abbúd'; // Example site name

  const handleCapture = async (blob: Blob) => {
    // Save the captured image to IndexedDB
    try {
      await saveImageNote(blob, selectedSite);

      // Close camera and navigate back
      setShowCamera(false);
      navigationStore.pop();
    } catch (error) {
      console.error('Failed to save image:', error);
    }
  };

  const handleClose = () => {
    setShowCamera(false);
  };

  return (
    <div>
      <Button onClick={() => setShowCamera(true)}>
        Open Camera
      </Button>

      <Show when={showCamera()}>
        <CameraCapture
          onCapture={handleCapture}
          onClose={handleClose}
          site={selectedSite}
        />
      </Show>
    </div>
  );
};

/**
 * EXAMPLE 2: Using PhotoPicker Component
 *
 * File input wrapper for selecting photos from gallery
 */
const PhotoPickerExample: Component = () => {
  const selectedSite = 'House of 'Abbúd';

  const handlePhotoSelect = async (blob: Blob) => {
    // Save the selected photo to IndexedDB
    try {
      await saveImageNote(blob, selectedSite);
      navigationStore.pop();
    } catch (error) {
      console.error('Failed to save photo:', error);
    }
  };

  return (
    <div class="p-4">
      <h2 class="text-xl font-bold mb-4">Choose a Photo</h2>

      {/* Simple usage */}
      <PhotoPicker
        onSelect={handlePhotoSelect}
        buttonText="Select Photo from Gallery"
        variant="primary"
        fullWidth
      />

      {/* With custom styling */}
      <div class="mt-4">
        <PhotoPicker
          onSelect={handlePhotoSelect}
          buttonText="Choose Another Photo"
          variant="secondary"
          size="lg"
        />
      </div>
    </div>
  );
};

/**
 * EXAMPLE 3: Using AudioRecorder Component
 *
 * Full-screen audio recording interface with MediaRecorder API
 */
const AudioRecorderExample: Component = () => {
  const [showRecorder, setShowRecorder] = createSignal(false);
  const selectedSite = 'Shrine of the Báb';

  const handleComplete = async (blob: Blob) => {
    // Save the audio recording to IndexedDB
    try {
      await saveAudioNote(blob, selectedSite);

      // Close recorder and navigate back
      setShowRecorder(false);
      navigationStore.pop();
    } catch (error) {
      console.error('Failed to save audio:', error);
    }
  };

  const handleClose = () => {
    setShowRecorder(false);
  };

  return (
    <div>
      <Button onClick={() => setShowRecorder(true)}>
        Record Audio
      </Button>

      <Show when={showRecorder()}>
        <AudioRecorder
          onComplete={handleComplete}
          onClose={handleClose}
          site={selectedSite}
        />
      </Show>
    </div>
  );
};

/**
 * EXAMPLE 4: Complete Note Creation Flow
 *
 * A comprehensive example showing a note creation interface
 * with options for camera, photo picker, and audio recorder
 */
const NoteCreationExample: Component = () => {
  const [activeView, setActiveView] = createSignal<'menu' | 'camera' | 'audio' | null>('menu');
  const selectedSite = 'Mazra'ih';

  const handleImageCapture = async (blob: Blob) => {
    try {
      await saveImageNote(blob, selectedSite, `Photo at ${selectedSite}`);
      setActiveView('menu');
      // Optionally navigate to notes list
      // navigationStore.replace(<NotesList />);
    } catch (error) {
      console.error('Failed to save image:', error);
    }
  };

  const handlePhotoSelect = async (blob: Blob) => {
    try {
      await saveImageNote(blob, selectedSite, `Gallery photo - ${selectedSite}`);
      // Stay on menu or navigate
    } catch (error) {
      console.error('Failed to save photo:', error);
    }
  };

  const handleAudioComplete = async (blob: Blob) => {
    try {
      await saveAudioNote(blob, selectedSite, `Audio reflection - ${selectedSite}`);
      setActiveView('menu');
    } catch (error) {
      console.error('Failed to save audio:', error);
    }
  };

  return (
    <div class="h-screen bg-gradient-to-b from-[#024359] to-[#015D7C]">
      {/* Menu View */}
      <Show when={activeView() === 'menu'}>
        <div class="p-6">
          <h1 class="text-2xl font-bold text-white mb-2">{selectedSite}</h1>
          <p class="text-white/75 mb-8">Create a new note</p>

          <div class="space-y-4">
            {/* Camera Button */}
            <Button
              onClick={() => setActiveView('camera')}
              variant="primary"
              size="lg"
              fullWidth
            >
              Take Photo
            </Button>

            {/* Photo Picker */}
            <PhotoPicker
              onSelect={handlePhotoSelect}
              buttonText="Choose from Gallery"
              variant="secondary"
              size="lg"
              fullWidth
            />

            {/* Audio Recorder Button */}
            <Button
              onClick={() => setActiveView('audio')}
              variant="primary"
              size="lg"
              fullWidth
            >
              Record Audio
            </Button>
          </div>
        </div>
      </Show>

      {/* Camera View */}
      <Show when={activeView() === 'camera'}>
        <CameraCapture
          onCapture={handleImageCapture}
          onClose={() => setActiveView('menu')}
          site={selectedSite}
        />
      </Show>

      {/* Audio Recorder View */}
      <Show when={activeView() === 'audio'}>
        <AudioRecorder
          onComplete={handleAudioComplete}
          onClose={() => setActiveView('menu')}
          site={selectedSite}
        />
      </Show>
    </div>
  );
};

/**
 * EXAMPLE 5: Using Media Save Handler Functions Directly
 *
 * You can also use the save functions independently
 */
const DirectSaveExample = async () => {
  // Example: Saving an image note
  const imageBlob = new Blob([/* image data */], { type: 'image/jpeg' });
  const imageNote = await saveImageNote(
    imageBlob,
    'House of 'Abbúd',
    'Beautiful morning light'
  );
  console.log('Saved image note:', imageNote);

  // Example: Saving an audio note
  const audioBlob = new Blob([/* audio data */], { type: 'audio/webm' });
  const audioNote = await saveAudioNote(
    audioBlob,
    'Shrine of the Báb',
    'Reflection on pilgrimage'
  );
  console.log('Saved audio note:', audioNote);
};

/**
 * EXAMPLE 6: Retrieving and Displaying Media
 */
import { getImageBlob, getAudioBlob } from './MediaSaveHandler';
import { createEffect, onCleanup } from 'solid-js';

const DisplayMediaExample: Component<{ imageId: string }> = (props) => {
  const [imageUrl, setImageUrl] = createSignal<string | null>(null);

  createEffect(async () => {
    // Load the image blob
    const blob = await getImageBlob(props.imageId);
    if (blob) {
      const url = URL.createObjectURL(blob);
      setImageUrl(url);

      // Clean up the object URL when component unmounts
      onCleanup(() => {
        if (url) URL.revokeObjectURL(url);
      });
    }
  });

  return (
    <div>
      <Show when={imageUrl()}>
        <img src={imageUrl()!} alt="Note image" class="w-full h-auto" />
      </Show>
    </div>
  );
};

export {
  CameraExample,
  PhotoPickerExample,
  AudioRecorderExample,
  NoteCreationExample,
  DisplayMediaExample,
};
