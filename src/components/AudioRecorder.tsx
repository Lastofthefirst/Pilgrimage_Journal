import { Component, createSignal, onMount, onCleanup, Show, createEffect } from 'solid-js';
import toast from 'solid-toast';
import Mic from './icons/Mic';
import Stop from './icons/Stop';
import Play from './icons/Play';
import Back from './icons/Back';
import Button from './Button';

export interface AudioRecorderProps {
  onComplete: (blob: Blob) => void;
  onClose: () => void;
  site?: string;
}

type RecorderState = 'idle' | 'recording' | 'stopped' | 'playing';

const AudioRecorder: Component<AudioRecorderProps> = (props) => {
  const [state, setState] = createSignal<RecorderState>('idle');
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [duration, setDuration] = createSignal(0);
  const [audioBlob, setAudioBlob] = createSignal<Blob | null>(null);
  const [audioUrl, setAudioUrl] = createSignal<string | null>(null);

  let mediaRecorder: MediaRecorder | null = null;
  let stream: MediaStream | null = null;
  let audioChunks: Blob[] = [];
  let timerInterval: number | null = null;
  let audioElement: HTMLAudioElement | null = null;

  const MAX_DURATION = 30 * 60; // 30 minutes in seconds

  onMount(async () => {
    await initializeMicrophone();
  });

  onCleanup(() => {
    cleanup();
  });

  const cleanup = () => {
    // Stop timer
    if (timerInterval !== null) {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    // Stop media recorder
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }

    // Stop audio stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
    }

    // Stop audio playback
    if (audioElement) {
      audioElement.pause();
      audioElement = null;
    }

    // Revoke object URL
    const url = audioUrl();
    if (url) {
      URL.revokeObjectURL(url);
    }
  };

  const initializeMicrophone = async () => {
    try {
      setLoading(true);
      setError(null);

      // Request microphone access
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      setLoading(false);
    } catch (err: any) {
      setLoading(false);

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        const errorMsg = 'Microphone permission denied. Please allow microphone access.';
        setError(errorMsg);
        toast.error(errorMsg);
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        const errorMsg = 'No microphone found on this device.';
        setError(errorMsg);
        toast.error(errorMsg);
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        const errorMsg = 'Microphone is already in use by another application.';
        setError(errorMsg);
        toast.error(errorMsg);
      } else {
        const errorMsg = `Microphone error: ${err.message || 'Unknown error'}`;
        setError(errorMsg);
        toast.error(errorMsg);
      }
    }
  };

  const startRecording = () => {
    if (!stream) {
      toast.error('Microphone not initialized');
      return;
    }

    try {
      // Determine supported MIME type
      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        }
      }

      audioChunks = [];
      mediaRecorder = new MediaRecorder(stream, { mimeType });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunks, { type: mimeType });
        setAudioBlob(blob);

        // Create object URL for playback
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        setState('stopped');

        // Stop timer
        if (timerInterval !== null) {
          clearInterval(timerInterval);
          timerInterval = null;
        }
      };

      mediaRecorder.onerror = (event: any) => {
        toast.error(`Recording error: ${event.error?.message || 'Unknown error'}`);
        stopRecording();
      };

      mediaRecorder.start();
      setState('recording');
      setDuration(0);

      // Start timer
      timerInterval = setInterval(() => {
        setDuration(d => {
          const newDuration = d + 1;
          // Auto-stop at max duration
          if (newDuration >= MAX_DURATION) {
            stopRecording();
            toast('Maximum recording duration reached', { icon: 'ℹ️' });
          }
          return newDuration;
        });
      }, 1000) as unknown as number;

      toast.success('Recording started');
    } catch (err: any) {
      toast.error(`Failed to start recording: ${err.message}`);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
  };

  const togglePlayback = () => {
    const url = audioUrl();
    if (!url) return;

    if (state() === 'playing') {
      // Pause
      if (audioElement) {
        audioElement.pause();
      }
      setState('stopped');
    } else {
      // Play
      if (!audioElement) {
        audioElement = new Audio(url);
        audioElement.onended = () => {
          setState('stopped');
        };
      }

      audioElement.play().catch(err => {
        toast.error(`Playback error: ${err.message}`);
      });
      setState('playing');
    }
  };

  const handleSave = () => {
    const blob = audioBlob();
    if (blob) {
      cleanup();
      props.onComplete(blob);
    }
  };

  const handleClose = () => {
    cleanup();
    props.onClose();
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div class="fixed inset-0 z-50 bg-gradient-to-b from-[#024359] to-[#015D7C] flex flex-col">
      {/* Header */}
      <div class="p-4 flex items-center justify-between">
        <button
          onClick={handleClose}
          class="p-2 rounded-full hover:bg-white/10 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Close recorder"
        >
          <Back color="white" size={24} />
        </button>

        <Show when={props.site}>
          <div class="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm">
            <p class="text-white text-sm font-medium">{props.site}</p>
          </div>
        </Show>

        <div class="w-10"></div> {/* Spacer for alignment */}
      </div>

      {/* Main content */}
      <div class="flex-1 flex flex-col items-center justify-center p-6">
        {/* Loading state */}
        <Show when={loading()}>
          <div class="text-white text-center">
            <div class="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-6"></div>
            <p class="text-lg">Initializing microphone...</p>
          </div>
        </Show>

        {/* Error state */}
        <Show when={error()}>
          <div class="text-white text-center max-w-md">
            <div class="mb-6">
              <svg class="w-20 h-20 mx-auto text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p class="text-xl mb-3 font-semibold">Microphone Unavailable</p>
            <p class="text-sm text-gray-200">{error()}</p>
          </div>
        </Show>

        {/* Recording interface */}
        <Show when={!loading() && !error()}>
          <div class="text-center w-full max-w-md">
            {/* Visual feedback */}
            <div class="mb-8">
              <Show when={state() === 'recording'}>
                {/* Pulsing red circle for recording */}
                <div class="relative w-32 h-32 mx-auto">
                  <div class="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
                  <div class="relative w-full h-full bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                    <Mic color="white" size={48} />
                  </div>
                </div>
              </Show>

              <Show when={state() === 'idle'}>
                {/* Microphone icon for idle state */}
                <div class="w-32 h-32 mx-auto bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Mic color="white" size={48} />
                </div>
              </Show>

              <Show when={state() === 'stopped' || state() === 'playing'}>
                {/* Playback icon */}
                <div class="w-32 h-32 mx-auto bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                  <Play color="white" size={48} />
                </div>
              </Show>
            </div>

            {/* Duration timer */}
            <div class="mb-8">
              <p class="text-6xl font-mono font-bold text-white mb-2">
                {formatDuration(duration())}
              </p>
              <Show when={state() === 'recording'}>
                <p class="text-sm text-white/75">Recording...</p>
              </Show>
              <Show when={state() === 'idle'}>
                <p class="text-sm text-white/75">Ready to record</p>
              </Show>
              <Show when={state() === 'stopped'}>
                <p class="text-sm text-white/75">Recording complete</p>
              </Show>
              <Show when={state() === 'playing'}>
                <p class="text-sm text-white/75">Playing...</p>
              </Show>
            </div>

            {/* Control buttons */}
            <div class="flex flex-col gap-4">
              {/* Recording controls */}
              <Show when={state() === 'idle' || state() === 'recording'}>
                <div class="flex gap-4 justify-center">
                  <Show when={state() === 'idle'}>
                    <Button
                      onClick={startRecording}
                      variant="primary"
                      size="lg"
                      icon={<Mic />}
                      class="bg-red-500 hover:bg-red-600 active:bg-red-700 px-8"
                    >
                      Start Recording
                    </Button>
                  </Show>

                  <Show when={state() === 'recording'}>
                    <Button
                      onClick={stopRecording}
                      variant="primary"
                      size="lg"
                      icon={<Stop />}
                      class="bg-red-600 hover:bg-red-700 active:bg-red-800 px-8"
                    >
                      Stop Recording
                    </Button>
                  </Show>
                </div>
              </Show>

              {/* Playback and save controls */}
              <Show when={state() === 'stopped' || state() === 'playing'}>
                <div class="flex flex-col gap-3">
                  <Button
                    onClick={togglePlayback}
                    variant="secondary"
                    size="lg"
                    icon={state() === 'playing' ? <Stop /> : <Play />}
                    fullWidth
                  >
                    {state() === 'playing' ? 'Pause' : 'Play Preview'}
                  </Button>

                  <div class="flex gap-3">
                    <Button
                      onClick={startRecording}
                      variant="outline"
                      size="lg"
                      class="flex-1 border-white text-white hover:bg-white/10"
                    >
                      Record Again
                    </Button>
                    <Button
                      onClick={handleSave}
                      variant="primary"
                      size="lg"
                      class="flex-1 bg-green-500 hover:bg-green-600 active:bg-green-700"
                    >
                      Save Recording
                    </Button>
                  </div>
                </div>
              </Show>
            </div>

            {/* Max duration hint */}
            <Show when={state() === 'idle' || state() === 'recording'}>
              <p class="text-xs text-white/50 mt-6">
                Maximum recording duration: 30 minutes
              </p>
            </Show>
          </div>
        </Show>
      </div>
    </div>
  );
};

export default AudioRecorder;
