import { Component, createSignal, onMount, onCleanup, Show } from 'solid-js';
import toast from 'solid-toast';
import Camera from './icons/Camera';
import Back from './icons/Back';
import Reverse from './icons/Reverse';

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
          } else {
            toast.error('Failed to capture image');
          }
        },
        'image/jpeg',
        0.9
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

        {/* Loading state */}
        <Show when={loading()}>
          <div class="absolute inset-0 flex items-center justify-center bg-black/50">
            <div class="text-white text-center">
              <div class="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto mb-4"></div>
              <p class="text-lg">Initializing camera...</p>
            </div>
          </div>
        </Show>

        {/* Error state */}
        <Show when={error()}>
          <div class="absolute inset-0 flex items-center justify-center bg-black">
            <div class="text-white text-center px-6 max-w-md">
              <div class="mb-4">
                <svg class="w-16 h-16 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p class="text-lg mb-2 font-semibold">Camera Unavailable</p>
              <p class="text-sm text-gray-300">{error()}</p>
            </div>
          </div>
        </Show>

        {/* Close button (top left) */}
        <button
          onClick={handleClose}
          class="absolute top-4 left-4 z-10 p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Close camera"
        >
          <Back color="white" size={24} />
        </button>

        {/* Switch camera button (top right) - only show if multiple cameras available */}
        <Show when={canSwitchCamera() && !loading() && !error()}>
          <button
            onClick={handleSwitchCamera}
            class="absolute top-4 right-4 z-10 p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Switch camera"
          >
            <Reverse color="white" size={24} />
          </button>
        </Show>

        {/* Site label (top center) */}
        <Show when={props.site}>
          <div class="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 px-4 py-2 rounded-full bg-black/50 backdrop-blur-sm">
            <p class="text-white text-sm font-medium">{props.site}</p>
          </div>
        </Show>
      </div>

      {/* Controls (bottom) */}
      <Show when={!loading() && !error()}>
        <div class="p-6 bg-black/80 backdrop-blur-sm">
          <div class="flex items-center justify-center">
            {/* Capture button */}
            <button
              onClick={handleCapture}
              class="w-20 h-20 rounded-full bg-white border-4 border-gray-300 hover:border-gray-400 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-white/50 shadow-lg"
              aria-label="Capture photo"
            >
              <div class="w-full h-full rounded-full flex items-center justify-center">
                <Camera color="#000" size={32} />
              </div>
            </button>
          </div>

          <p class="text-white text-center text-sm mt-4 opacity-75">
            Tap to capture photo
          </p>
        </div>
      </Show>
    </div>
  );
};

export default CameraCapture;
