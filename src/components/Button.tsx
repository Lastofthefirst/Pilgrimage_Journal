import { Component, JSX, splitProps, Show } from 'solid-js';

export interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: JSX.Element;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  disabled?: boolean;
}

const Button: Component<ButtonProps> = (props) => {
  const [local, others] = splitProps(props, [
    'variant',
    'size',
    'icon',
    'iconPosition',
    'fullWidth',
    'disabled',
    'children',
    'class',
  ]);

  const variant = () => local.variant || 'primary';
  const size = () => local.size || 'md';
  const iconPosition = () => local.iconPosition || 'left';

  // Variant styles
  const variantClasses = () => {
    switch (variant()) {
      case 'primary':
        return 'bg-[#015D7C] text-white hover:bg-[#014560] active:bg-[#013347] disabled:bg-[#015D7C]/50';
      case 'secondary':
        return 'bg-[#DCF1FA] text-black hover:bg-[#C5E8F7] active:bg-[#AEDFF4] disabled:bg-[#DCF1FA]/50';
      case 'outline':
        return 'bg-transparent border-2 border-[#015D7C] text-[#015D7C] hover:bg-[#015D7C]/10 active:bg-[#015D7C]/20 disabled:border-[#015D7C]/50 disabled:text-[#015D7C]/50';
      default:
        return '';
    }
  };

  // Size styles
  const sizeClasses = () => {
    switch (size()) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'md':
        return 'px-4 py-2 text-base';
      case 'lg':
        return 'px-6 py-3 text-lg';
      default:
        return '';
    }
  };

  // Icon size based on button size
  const iconSize = () => {
    switch (size()) {
      case 'sm':
        return 'w-4 h-4';
      case 'md':
        return 'w-5 h-5';
      case 'lg':
        return 'w-6 h-6';
      default:
        return '';
    }
  };

  const baseClasses = () => [
    'inline-flex items-center justify-center gap-2',
    'font-medium rounded-md',
    'transition-colors duration-200',
    'shadow-md hover:shadow-lg active:shadow',
    'focus:outline-none focus:ring-2 focus:ring-[#015D7C] focus:ring-offset-2',
    'disabled:cursor-not-allowed disabled:shadow-none',
    local.fullWidth ? 'w-full' : '',
    variantClasses(),
    sizeClasses(),
    local.class || '',
  ].filter(Boolean).join(' ');

  return (
    <button
      class={baseClasses()}
      disabled={local.disabled}
      aria-disabled={local.disabled}
      {...others}
    >
      <Show when={local.icon && iconPosition() === 'left'}>
        <span class={iconSize()} aria-hidden="true">
          {local.icon}
        </span>
      </Show>

      <Show when={local.children}>
        <span>{local.children}</span>
      </Show>

      <Show when={local.icon && iconPosition() === 'right'}>
        <span class={iconSize()} aria-hidden="true">
          {local.icon}
        </span>
      </Show>
    </button>
  );
};

export default Button;
