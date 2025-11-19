import { Component, createSignal, onMount, onCleanup, Show, For } from 'solid-js';
import toast from 'solid-toast';
import Icon from './ui/Icon';
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
  const [waveformBars, setWaveformBars] = createSignal<number[]>(Array(20).fill(0.2));

  let mediaRecorder: MediaRecorder | null = null;
  let stream: MediaStream | null = null;
  let audioChunks: Blob[] = [];
  let timerInterval: number | null = null;
  let audioElement: HTMLAudioElement | null = null;
  let waveformInterval: number | null = null;

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

    // Stop waveform animation
    if (waveformInterval !== null) {
      clearInterval(waveformInterval);
      waveformInterval = null;
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

      // Start waveform animation
      waveformInterval = setInterval(() => {
        setWaveformBars(prev => {
          return prev.map(() => Math.random() * 0.7 + 0.3);
        });
      }, 100) as unknown as number;

      toast.success('Recording started');
    } catch (err: any) {
      toast.error(`Failed to start recording: ${err.message}`);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }

    // Stop waveform animation
    if (waveformInterval !== null) {
      clearInterval(waveformInterval);
      waveformInterval = null;
    }

    // Reset waveform
    setWaveformBars(Array(20).fill(0.2));
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
    <div class="fixed inset-0 z-50 bg-gradient-to-br from-[#024359] via-[#015D7C] to-[#024359] flex flex-col">
      {/* Header */}
      <div class="p-4 flex items-center justify-between bg-gradient-to-b from-black/20 to-transparent">
        <button
          onClick={handleClose}
          class="p-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 active:scale-95"
          aria-label="Close recorder"
        >
          <Icon name="x-mark" size={24} class="text-white" />
        </button>

        <Show when={props.site}>
          <div class="px-4 py-2 rounded-full bg-white/15 backdrop-blur-md border border-white/20">
            <p class="text-white text-sm font-semibold">{props.site}</p>
          </div>
        </Show>

        <div class="w-10"></div> {/* Spacer for alignment */}
      </div>

      {/* Main content */}
      <div class="flex-1 flex flex-col items-center justify-center p-6">
        {/* Loading state */}
        <Show when={loading()}>
          <div class="text-white text-center">
            <div class="animate-spin rounded-full h-20 w-20 border-4 border-white border-t-transparent mx-auto mb-6"></div>
            <p class="text-xl font-medium">Initializing microphone...</p>
            <p class="text-sm text-white/75 mt-2">Please allow microphone access</p>
          </div>
        </Show>

        {/* Error state */}
        <Show when={error()}>
          <div class="text-white text-center max-w-md">
            <div class="mb-6">
              <Icon name="speaker-x-mark" size={80} class="mx-auto text-red-400" />
            </div>
            <p class="text-2xl mb-3 font-bold">Microphone Unavailable</p>
            <p class="text-base text-gray-200 leading-relaxed">{error()}</p>
          </div>
        </Show>

        {/* Recording interface */}
        <Show when={!loading() && !error()}>
          <div class="text-center w-full max-w-md">
            {/* Visual feedback */}
            <div class="mb-10">
              <Show when={state() === 'recording'}>
                {/* Pulsing red circle for recording */}
                <div class="relative w-36 h-36 mx-auto mb-8">
                  <div class="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
                  <div class="absolute inset-0 bg-red-500/30 rounded-full animate-pulse"></div>
                  <div class="relative w-full h-full bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-2xl">
                    <Icon name="microphone" size={56} class="text-white" />
                  </div>
                </div>
              </Show>

              <Show when={state() === 'idle'}>
                {/* Microphone icon for idle state */}
                <div class="w-36 h-36 mx-auto mb-8 bg-gradient-to-br from-white/20 to-white/10 rounded-full flex items-center justify-center backdrop-blur-md border-2 border-white/30 shadow-xl">
                  <Icon name="microphone" size={56} class="text-white" />
                </div>
              </Show>

              <Show when={state() === 'stopped' || state() === 'playing'}>
                {/* Playback icon */}
                <div class="w-36 h-36 mx-auto mb-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-2xl">
                  <Icon name={state() === 'playing' ? 'pause' : 'play'} size={56} class="text-white" />
                </div>
              </Show>

              {/* Waveform visualization */}
              <Show when={state() === 'recording'}>
                <div class="flex items-center justify-center gap-1.5 h-20 mb-4">
                  <For each={waveformBars()}>
                    {(bar) => (
                      <div
                        class="w-1.5 bg-gradient-to-t from-white to-white/60 rounded-full transition-all duration-100"
                        style={{ height: `${bar * 100}%` }}
                      />
                    )}
                  </For>
                </div>
              </Show>
            </div>

            {/* Duration timer */}
            <div class="mb-10">
              <p class="text-7xl font-mono font-bold text-white mb-3 tracking-tight">
                {formatDuration(duration())}
              </p>
              <Show when={state() === 'recording'}>
                <p class="text-base text-red-300 font-medium flex items-center justify-center gap-2">
                  <span class="inline-block w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
                  Recording...
                </p>
              </Show>
              <Show when={state() === 'idle'}>
                <p class="text-base text-white/80 font-medium">Ready to record</p>
              </Show>
              <Show when={state() === 'stopped'}>
                <p class="text-base text-green-300 font-medium">Recording complete</p>
              </Show>
              <Show when={state() === 'playing'}>
                <p class="text-base text-green-300 font-medium">Playing...</p>
              </Show>
            </div>

            {/* Control buttons */}
            <div class="flex flex-col gap-4">
              {/* Recording controls */}
              <Show when={state() === 'idle' || state() === 'recording'}>
                <div class="flex gap-4 justify-center">
                  <Show when={state() === 'idle'}>
                    <button
                      onClick={startRecording}
                      class="flex items-center gap-3 px-10 py-4 rounded-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold text-lg shadow-2xl active:scale-95 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-red-400/50"
                    >
                      <Icon name="microphone" size={24} />
                      Start Recording
                    </button>
                  </Show>

                  <Show when={state() === 'recording'}>
                    <button
                      onClick={stopRecording}
                      class="flex items-center gap-3 px-10 py-4 rounded-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold text-lg shadow-2xl active:scale-95 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-red-500/50"
                    >
                      <Icon name="stop" size={24} />
                      Stop Recording
                    </button>
                  </Show>
                </div>
              </Show>

              {/* Playback and save controls */}
              <Show when={state() === 'stopped' || state() === 'playing'}>
                <div class="flex flex-col gap-4">
                  <button
                    onClick={togglePlayback}
                    class="flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/30 text-white font-semibold text-lg shadow-xl active:scale-95 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-white/30"
                  >
                    <Icon name={state() === 'playing' ? 'pause' : 'play'} size={24} />
                    {state() === 'playing' ? 'Pause Preview' : 'Play Preview'}
                  </button>

                  <div class="flex gap-3">
                    <button
                      onClick={startRecording}
                      class="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white font-medium text-base shadow-lg active:scale-95 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-white/30"
                    >
                      <Icon name="arrow-path" size={20} />
                      Record Again
                    </button>
                    <button
                      onClick={handleSave}
                      class="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold text-base shadow-xl active:scale-95 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-green-400/50"
                    >
                      <Icon name="check" size={20} />
                      Save Recording
                    </button>
                  </div>
                </div>
              </Show>
            </div>

            {/* Max duration hint */}
            <Show when={state() === 'idle' || state() === 'recording'}>
              <p class="text-sm text-white/60 mt-8 font-medium">
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
