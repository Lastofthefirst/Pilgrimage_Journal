import { Component, createSignal, Show } from 'solid-js';
import toast from 'solid-toast';
import Photo from './icons/Photo';
import Button from './Button';

export interface PhotoPickerProps {
  onSelect: (blob: Blob) => void;
  multiple?: boolean;
  buttonText?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const PhotoPicker: Component<PhotoPickerProps> = (props) => {
  const [previewing, setPreviewing] = createSignal(false);
  const [previewUrl, setPreviewUrl] = createSignal<string | null>(null);
  const [selectedBlob, setSelectedBlob] = createSignal<Blob | null>(null);

  let fileInputRef: HTMLInputElement | undefined;

  const handleFileSelect = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (warn if > 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      toast.error(`Image is large (${sizeMB}MB). This may affect performance.`, {
        duration: 4000,
      });
    }

    // Convert File to Blob
    const blob = new Blob([file], { type: file.type });

    // If multiple is not enabled, show preview
    if (!props.multiple) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
        setSelectedBlob(blob);
        setPreviewing(true);
      };
      reader.readAsDataURL(file);
    } else {
      // Directly call onSelect for multiple mode
      props.onSelect(blob);
      toast.success('Photo selected');
    }

    // Reset input
    if (fileInputRef) {
      fileInputRef.value = '';
    }
  };

  const handleConfirm = () => {
    const blob = selectedBlob();
    if (blob) {
      props.onSelect(blob);
      handleCancel();
    }
  };

  const handleCancel = () => {
    setPreviewing(false);
    setPreviewUrl(null);
    setSelectedBlob(null);
  };

  const triggerFilePicker = () => {
    fileInputRef?.click();
  };

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={props.multiple}
        onChange={handleFileSelect}
        class="hidden"
        aria-label="Select photo"
      />

      {/* Trigger button */}
      <Button
        onClick={triggerFilePicker}
        variant={props.variant || 'secondary'}
        size={props.size || 'md'}
        icon={<Photo />}
        fullWidth={props.fullWidth}
      >
        {props.buttonText || 'Choose Photo'}
      </Button>

      {/* Preview Modal */}
      <Show when={previewing()}>
        <div class="fixed inset-0 z-50 bg-black/90 flex flex-col">
          {/* Preview image */}
          <div class="flex-1 flex items-center justify-center p-4 overflow-auto">
            <Show when={previewUrl()}>
              <img
                src={previewUrl()!}
                alt="Preview"
                class="max-w-full max-h-full object-contain"
              />
            </Show>
          </div>

          {/* Action buttons */}
          <div class="p-6 bg-black/80 backdrop-blur-sm">
            <div class="flex gap-4 max-w-md mx-auto">
              <Button
                onClick={handleCancel}
                variant="outline"
                fullWidth
                class="text-white border-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                variant="primary"
                fullWidth
              >
                Use This Photo
              </Button>
            </div>
          </div>
        </div>
      </Show>
    </>
  );
};

export default PhotoPicker;
