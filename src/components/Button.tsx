import { Component, JSX, splitProps, Show, createSignal } from 'solid-js';

export interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  icon?: JSX.Element;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  ripple?: boolean;
}

const Button: Component<ButtonProps> = (props) => {
  const [local, others] = splitProps(props, [
    'variant',
    'size',
    'icon',
    'iconPosition',
    'fullWidth',
    'disabled',
    'loading',
    'ripple',
    'children',
    'class',
    'onClick',
  ]);

  const [ripples, setRipples] = createSignal<Array<{ x: number; y: number; id: number }>>([]);

  const variant = () => local.variant || 'primary';
  const size = () => local.size || 'md';
  const iconPosition = () => local.iconPosition || 'left';
  const enableRipple = () => local.ripple !== false; // Default to true

  // Variant styles
  const variantClasses = () => {
    switch (variant()) {
      case 'primary':
        return 'bg-gradient-to-br from-[#015D7C] to-[#014A63] text-white hover:from-[#014A63] hover:to-[#01374A] active:from-[#01374A] active:to-[#011E2B] shadow-lg hover:shadow-xl disabled:from-[#015D7C]/50 disabled:to-[#014A63]/50';
      case 'secondary':
        return 'bg-gradient-to-br from-[#DCF1FA] to-[#B3E3F5] text-[#015D7C] hover:from-[#C5E8F7] hover:to-[#9EDCF3] active:from-[#B3E3F5] active:to-[#7BCFEF] shadow-md hover:shadow-lg disabled:from-[#DCF1FA]/50 disabled:to-[#B3E3F5]/50';
      case 'outline':
        return 'bg-transparent border-2 border-[#015D7C] text-[#015D7C] hover:bg-[#015D7C]/10 active:bg-[#015D7C]/20 shadow-sm hover:shadow-md disabled:border-[#015D7C]/30 disabled:text-[#015D7C]/30';
      case 'ghost':
        return 'bg-transparent text-[#015D7C] hover:bg-[#E6F2F5] active:bg-[#DCF1FA] disabled:text-[#015D7C]/30';
      case 'glass':
        return 'glass text-[#015D7C] hover:bg-white/80 active:bg-white/90 shadow-lg hover:shadow-xl border border-white/30';
      default:
        return '';
    }
  };

  // Size styles
  const sizeClasses = () => {
    switch (size()) {
      case 'xs':
        return 'px-2.5 py-1 text-xs';
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'md':
        return 'px-4 py-2.5 text-base';
      case 'lg':
        return 'px-6 py-3 text-lg';
      case 'xl':
        return 'px-8 py-4 text-xl';
      default:
        return '';
    }
  };

  // Icon size based on button size
  const iconSize = () => {
    switch (size()) {
      case 'xs':
        return 'w-3 h-3';
      case 'sm':
        return 'w-4 h-4';
      case 'md':
        return 'w-5 h-5';
      case 'lg':
        return 'w-6 h-6';
      case 'xl':
        return 'w-7 h-7';
      default:
        return '';
    }
  };

  const baseClasses = () => [
    'inline-flex items-center justify-center gap-2',
    'font-semibold rounded-xl',
    'transition-all duration-200 ease-out',
    'focus:outline-none focus:ring-2 focus:ring-[#015D7C] focus:ring-offset-2',
    'disabled:cursor-not-allowed disabled:shadow-none disabled:opacity-60',
    'active-scale',
    'relative overflow-hidden',
    local.fullWidth ? 'w-full' : '',
    variantClasses(),
    sizeClasses(),
    local.class || '',
  ].filter(Boolean).join(' ');

  const handleClick = (e: MouseEvent & { currentTarget: HTMLButtonElement }) => {
    if (enableRipple() && !local.disabled && !local.loading) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = Date.now();

      setRipples([...ripples(), { x, y, id }]);

      setTimeout(() => {
        setRipples(ripples().filter(r => r.id !== id));
      }, 600);
    }

    if (local.onClick && !local.disabled && !local.loading) {
      local.onClick(e);
    }
  };

  return (
    <button
      class={baseClasses()}
      disabled={local.disabled || local.loading}
      aria-disabled={local.disabled || local.loading}
      onClick={handleClick}
      {...others}
    >
      {/* Ripple Effects */}
      <Show when={enableRipple()}>
        <For each={ripples()}>
          {(ripple) => (
            <span
              class="ripple"
              style={{
                left: `${ripple.x}px`,
                top: `${ripple.y}px`,
                width: '20px',
                height: '20px',
                'margin-left': '-10px',
                'margin-top': '-10px',
              }}
            />
          )}
        </For>
      </Show>

      {/* Loading Spinner */}
      <Show when={local.loading}>
        <svg
          class="animate-spin w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </Show>

      {/* Left Icon */}
      <Show when={local.icon && iconPosition() === 'left' && !local.loading}>
        <span class={iconSize()} aria-hidden="true">
          {local.icon}
        </span>
      </Show>

      {/* Children Content */}
      <Show when={local.children}>
        <span class={local.loading ? 'opacity-70' : ''}>
          {local.children}
        </span>
      </Show>

      {/* Right Icon */}
      <Show when={local.icon && iconPosition() === 'right' && !local.loading}>
        <span class={iconSize()} aria-hidden="true">
          {local.icon}
        </span>
      </Show>
    </button>
  );
};

// Add For import
import { For } from 'solid-js';

export default Button;
