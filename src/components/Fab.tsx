import { Component, JSX, splitProps, Show } from 'solid-js';

export interface FabProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: JSX.Element;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  extended?: boolean;
  disabled?: boolean;
}

const Fab: Component<FabProps> = (props) => {
  const [local, others] = splitProps(props, [
    'icon',
    'position',
    'size',
    'label',
    'extended',
    'disabled',
    'class',
  ]);

  const position = () => local.position || 'bottom-right';
  const size = () => local.size || 'md';
  const isExtended = () => local.extended || !!local.label;

  // Position styles
  const positionClasses = () => {
    switch (position()) {
      case 'bottom-right':
        return 'bottom-6 right-6';
      case 'bottom-left':
        return 'bottom-6 left-6';
      case 'top-right':
        return 'top-6 right-6';
      case 'top-left':
        return 'top-6 left-6';
      default:
        return 'bottom-6 right-6';
    }
  };

  // Size styles
  const sizeClasses = () => {
    if (isExtended()) {
      switch (size()) {
        case 'sm':
          return 'h-10 px-4';
        case 'md':
          return 'h-14 px-6';
        case 'lg':
          return 'h-16 px-8';
        default:
          return 'h-14 px-6';
      }
    } else {
      switch (size()) {
        case 'sm':
          return 'w-10 h-10';
        case 'md':
          return 'w-14 h-14';
        case 'lg':
          return 'w-16 h-16';
        default:
          return 'w-14 h-14';
      }
    }
  };

  // Icon size based on button size
  const iconSize = () => {
    switch (size()) {
      case 'sm':
        return 'w-5 h-5';
      case 'md':
        return 'w-6 h-6';
      case 'lg':
        return 'w-8 h-8';
      default:
        return 'w-6 h-6';
    }
  };

  const baseClasses = () => [
    'fixed z-40',
    positionClasses(),
    sizeClasses(),
    'flex items-center justify-center gap-2',
    'bg-[#015D7C] text-white',
    'rounded-full',
    'shadow-lg hover:shadow-xl active:shadow-md',
    'transition-all duration-200',
    'hover:scale-105 active:scale-95',
    'focus:outline-none focus:ring-4 focus:ring-[#015D7C]/30',
    'disabled:bg-[#015D7C]/50 disabled:cursor-not-allowed disabled:shadow-md disabled:scale-100',
    local.class || '',
  ].filter(Boolean).join(' ');

  return (
    <button
      class={baseClasses()}
      disabled={local.disabled}
      aria-label={local.label || 'Floating action button'}
      {...others}
    >
      <Show when={local.icon}>
        <span class={iconSize()} aria-hidden="true">
          {local.icon}
        </span>
      </Show>

      <Show when={isExtended() && local.label}>
        <span class="font-medium whitespace-nowrap">
          {local.label}
        </span>
      </Show>
    </button>
  );
};

export default Fab;
