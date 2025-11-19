import { Component, createSignal, onMount, onCleanup, Show } from 'solid-js';
import toast from 'solid-toast';
import Icon from './ui/Icon';

export interface CameraCaptureProps {
  onCapture: (blob: Blob) => void;
  onClose: () => void;
  site?: string;
}

const CameraCapture: Component<CameraCaptureProps> = (props) => {
  const [stream, setStream] = createSignal<MediaStream | null>(null);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);
  const [facingMode, setFacingMode] = createSignal<'user' | 'environment'>('environment');
  const [canSwitchCamera, setCanSwitchCamera] = createSignal(false);
  const [flash, setFlash] = createSignal(false);

  let videoRef: HTMLVideoElement | undefined;

  const initializeCamera = async (mode: 'user' | 'environment' = 'environment') => {
    try {
      setLoading(true);
      setError(null);

      // Stop existing stream if any
      const currentStream = stream();
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }

      // Request camera access
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      setStream(mediaStream);

      // Attach stream to video element
      if (videoRef) {
        videoRef.srcObject = mediaStream;
      }

      // Check if device has multiple cameras
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setCanSwitchCamera(videoDevices.length > 1);

      setLoading(false);
    } catch (err: any) {
      setLoading(false);

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        const errorMsg = 'Camera permission denied. Please allow camera access.';
        setError(errorMsg);
        toast.error(errorMsg);
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        const errorMsg = 'No camera found on this device.';
        setError(errorMsg);
        toast.error(errorMsg);
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        const errorMsg = 'Camera is already in use by another application.';
        setError(errorMsg);
        toast.error(errorMsg);
      } else {
        const errorMsg = `Camera error: ${err.message || 'Unknown error'}`;
        setError(errorMsg);
        toast.error(errorMsg);
      }
    }
  };

  onMount(() => {
    initializeCamera(facingMode());
  });

  onCleanup(() => {
    // Stop all tracks when component unmounts
    const currentStream = stream();
    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop());
    }
  });

  const handleCapture = () => {
    if (!videoRef || !stream()) return;

    try {
      // Trigger flash animation
      setFlash(true);
      setTimeout(() => setFlash(false), 200);

      // Create canvas to capture frame
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.videoWidth;
      canvas.height = videoRef.videoHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        toast.error('Failed to create canvas context');
        return;
      }

      // Draw current video frame to canvas
      ctx.drawImage(videoRef, 0, 0);

      // Convert canvas to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Stop the video stream
            const currentStream = stream();
            if (currentStream) {
              currentStream.getTracks().forEach(track => track.stop());
            }

            // Call the onCapture callback
            props.onCapture(blob);
            toast.success('Photo captured!');
          } else {
            toast.error('Failed to capture image');
          }
        },
        'image/jpeg',
        0.95
      );
    } catch (err: any) {
      toast.error(`Capture failed: ${err.message}`);
    }
  };

  const handleSwitchCamera = async () => {
    const newMode = facingMode() === 'user' ? 'environment' : 'user';
    setFacingMode(newMode);
    await initializeCamera(newMode);
  };

  const handleClose = () => {
    // Stop the video stream
    const currentStream = stream();
    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop());
    }
    props.onClose();
  };

  return (
    <div class="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Video feed */}
      <div class="flex-1 relative overflow-hidden">
        <Show when={!error()}>
          <video
            ref={videoRef}
            autoplay
            playsinline
            muted
            class="w-full h-full object-cover"
            onLoadedMetadata={() => {
              if (videoRef) {
                videoRef.play();
              }
            }}
          />
        </Show>

        {/* Flash animation */}
        <Show when={flash()}>
          <div class="absolute inset-0 bg-white animate-pulse pointer-events-none" />
        </Show>

        {/* Loading state */}
        <Show when={loading()}>
          <div class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#024359] to-[#015D7C] backdrop-blur-sm">
            <div class="text-white text-center">
              <div class="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
              <p class="text-xl font-medium">Initializing camera...</p>
              <p class="text-sm text-white/75 mt-2">Please allow camera access</p>
            </div>
          </div>
        </Show>

        {/* Error state */}
        <Show when={error()}>
          <div class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-900/50 to-[#024359] backdrop-blur-sm">
            <div class="text-white text-center px-6 max-w-md">
              <div class="mb-6">
                <Icon name="video-camera-slash" size={64} class="mx-auto text-red-400" />
              </div>
              <p class="text-2xl mb-3 font-bold">Camera Unavailable</p>
              <p class="text-base text-gray-200 leading-relaxed">{error()}</p>
            </div>
          </div>
        </Show>

        {/* Top bar */}
        <div class="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/60 to-transparent p-4">
          <div class="flex items-center justify-between">
            {/* Close button */}
            <button
              onClick={handleClose}
              class="p-2.5 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 active:scale-95"
              aria-label="Close camera"
            >
              <Icon name="x-mark" size={24} class="text-white" />
            </button>

            {/* Site label (center) */}
            <Show when={props.site}>
              <div class="px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/20">
                <p class="text-white text-sm font-semibold">{props.site}</p>
              </div>
            </Show>

            {/* Switch camera button */}
            <Show when={canSwitchCamera() && !loading() && !error()}>
              <button
                onClick={handleSwitchCamera}
                class="p-2.5 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 active:scale-95"
                aria-label="Switch camera"
              >
                <Icon name="arrow-path" size={24} class="text-white" />
              </button>
            </Show>

            {/* Spacer when no site or camera switch */}
            <Show when={!props.site && (!canSwitchCamera() || loading() || error())}>
              <div class="w-10" />
            </Show>
          </div>
        </div>
      </div>

      {/* Bottom control bar */}
      <Show when={!loading() && !error()}>
        <div class="p-8 bg-gradient-to-t from-black via-black/95 to-black/80 backdrop-blur-md">
          <div class="flex items-center justify-center gap-8">
            {/* Capture button */}
            <button
              onClick={handleCapture}
              class="relative w-20 h-20 rounded-full bg-white hover:bg-gray-100 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-white/30 shadow-2xl group"
              aria-label="Capture photo"
            >
              <div class="absolute inset-2 rounded-full border-4 border-gray-800 group-active:border-gray-600 transition-colors" />
              <Icon name="camera" size={32} class="absolute inset-0 m-auto text-gray-800" />
            </button>
          </div>

          <p class="text-white text-center text-sm mt-5 opacity-80 font-medium">
            Tap to capture photo
          </p>
        </div>
      </Show>
    </div>
  );
};

export default CameraCapture;
