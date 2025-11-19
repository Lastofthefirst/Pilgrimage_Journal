import { Component, JSX, splitProps, Show, onMount, onCleanup, createEffect } from 'solid-js';
import { Portal } from 'solid-js/web';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string | JSX.Element;
  children: JSX.Element;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  footer?: JSX.Element;
}

const Modal: Component<ModalProps> = (props) => {
  const [local] = splitProps(props, [
    'isOpen',
    'onClose',
    'title',
    'children',
    'size',
    'closeOnBackdrop',
    'closeOnEscape',
    'showCloseButton',
    'footer',
  ]);

  const size = () => local.size || 'md';
  const closeOnBackdrop = () => local.closeOnBackdrop ?? true;
  const closeOnEscape = () => local.closeOnEscape ?? true;
  const showCloseButton = () => local.showCloseButton ?? true;

  // Size styles
  const sizeClasses = () => {
    switch (size()) {
      case 'sm':
        return 'max-w-sm';
      case 'md':
        return 'max-w-md';
      case 'lg':
        return 'max-w-lg';
      case 'xl':
        return 'max-w-xl';
      case 'full':
        return 'max-w-full mx-4';
      default:
        return 'max-w-md';
    }
  };

  // Handle escape key
  createEffect(() => {
    if (!local.isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (closeOnEscape() && e.key === 'Escape') {
        local.onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    onCleanup(() => document.removeEventListener('keydown', handleEscape));
  });

  // Prevent body scroll when modal is open
  createEffect(() => {
    if (local.isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    onCleanup(() => {
      document.body.style.overflow = '';
    });
  });

  const handleBackdropClick = (e: MouseEvent) => {
    if (closeOnBackdrop() && e.target === e.currentTarget) {
      local.onClose();
    }
  };

  return (
    <Show when={local.isOpen}>
      <Portal>
        {/* Backdrop */}
        <div
          class={[
            'fixed inset-0 z-50',
            'bg-black/50 backdrop-blur-sm',
            'flex items-center justify-center p-4',
            'animate-fade-in',
          ].join(' ')}
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby={local.title ? 'modal-title' : undefined}
        >
          {/* Modal Container */}
          <div
            class={[
              'relative w-full',
              sizeClasses(),
              'bg-white rounded-lg shadow-2xl',
              'max-h-[90vh] flex flex-col',
              'animate-slide-up',
            ].join(' ')}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <Show when={local.title || showCloseButton()}>
              <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <Show when={local.title}>
                  {typeof local.title === 'string' ? (
                    <h2
                      id="modal-title"
                      class="text-xl font-semibold text-gray-900"
                    >
                      {local.title}
                    </h2>
                  ) : (
                    <div id="modal-title">
                      {local.title}
                    </div>
                  )}
                </Show>

                <Show when={showCloseButton()}>
                  <button
                    type="button"
                    onClick={local.onClose}
                    class={[
                      'p-1 rounded-md',
                      'text-gray-400 hover:text-gray-600',
                      'hover:bg-gray-100',
                      'transition-colors duration-200',
                      'focus:outline-none focus:ring-2 focus:ring-[#015D7C]',
                    ].join(' ')}
                    aria-label="Close modal"
                  >
                    <svg
                      class="w-6 h-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </Show>
              </div>
            </Show>

            {/* Content */}
            <div class="flex-1 overflow-y-auto px-6 py-4">
              {local.children}
            </div>

            {/* Footer */}
            <Show when={local.footer}>
              <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                {local.footer}
              </div>
            </Show>
          </div>
        </div>
      </Portal>
    </Show>
  );
};

export default Modal;
