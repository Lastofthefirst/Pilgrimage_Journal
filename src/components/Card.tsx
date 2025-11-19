import { Component, JSX, splitProps, Show, createSignal } from 'solid-js';

export interface CardProps extends JSX.HTMLAttributes<HTMLDivElement> {
  image?: string;
  imageAlt?: string;
  title?: string | JSX.Element;
  children?: JSX.Element;
  onClick?: (e: MouseEvent) => void;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient';
  loading?: boolean;
  imageGradient?: boolean;
}

const Card: Component<CardProps> = (props) => {
  const [local, others] = splitProps(props, [
    'image',
    'imageAlt',
    'title',
    'children',
    'onClick',
    'hoverable',
    'padding',
    'variant',
    'loading',
    'imageGradient',
    'class',
  ]);

  const [imageLoaded, setImageLoaded] = createSignal(false);

  const padding = () => local.padding || 'md';
  const variant = () => local.variant || 'default';
  const isClickable = () => !!local.onClick;
  const hoverable = () => local.hoverable ?? isClickable();
  const showImageGradient = () => local.imageGradient !== false;

  // Padding styles
  const paddingClasses = () => {
    switch (padding()) {
      case 'none':
        return '';
      case 'sm':
        return 'p-3';
      case 'md':
        return 'p-4';
      case 'lg':
        return 'p-6';
      case 'xl':
        return 'p-8';
      default:
        return '';
    }
  };

  // Variant styles
  const variantClasses = () => {
    switch (variant()) {
      case 'elevated':
        return 'bg-white shadow-lg';
      case 'outlined':
        return 'bg-white border-2 border-gray-200 shadow-sm';
      case 'gradient':
        return 'bg-gradient-to-br from-white to-gray-50 shadow-md';
      default:
        return 'bg-white shadow-md';
    }
  };

  const baseClasses = () => [
    'rounded-2xl',
    'overflow-hidden',
    'transition-all duration-300 ease-out',
    'animate-fade-in',
    variantClasses(),
    hoverable() ? 'hover:shadow-2xl hover:-translate-y-1 cursor-pointer' : '',
    isClickable() ? 'active-scale focus:outline-none focus:ring-2 focus:ring-[#015D7C] focus:ring-offset-2' : '',
    local.class || '',
  ].filter(Boolean).join(' ');

  const handleClick = (e: MouseEvent) => {
    if (local.onClick) {
      local.onClick(e);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (isClickable() && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      local.onClick?.(e as any);
    }
  };

  return (
    <div
      class={baseClasses()}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={isClickable() ? 'button' : undefined}
      tabIndex={isClickable() ? 0 : undefined}
      {...others}
    >
      {/* Skeleton Loading State */}
      <Show when={local.loading}>
        <div class="animate-pulse">
          <div class="w-full aspect-video bg-gray-200" />
          <div class={paddingClasses()}>
            <div class="h-6 bg-gray-200 rounded-lg mb-3 w-3/4" />
            <div class="h-4 bg-gray-200 rounded-lg mb-2 w-full" />
            <div class="h-4 bg-gray-200 rounded-lg w-5/6" />
          </div>
        </div>
      </Show>

      {/* Actual Content */}
      <Show when={!local.loading}>
        {/* Image Section */}
        <Show when={local.image}>
          <div class="w-full aspect-video overflow-hidden relative bg-gray-100">
            {/* Skeleton while image loads */}
            <Show when={!imageLoaded()}>
              <div class="skeleton absolute inset-0" />
            </Show>

            {/* Actual Image */}
            <img
              src={local.image}
              alt={local.imageAlt || ''}
              class={`w-full h-full object-cover transition-all duration-500 ${
                imageLoaded() ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              }`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
            />

            {/* Gradient Overlay */}
            <Show when={showImageGradient()}>
              <div class="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
            </Show>
          </div>
        </Show>

        {/* Content Section */}
        <div class={paddingClasses()}>
          {/* Title */}
          <Show when={local.title}>
            <div class="mb-3">
              {typeof local.title === 'string' ? (
                <h3 class="text-lg font-bold text-gray-900 line-clamp-2 leading-tight">
                  {local.title}
                </h3>
              ) : (
                local.title
              )}
            </div>
          </Show>

          {/* Children Content */}
          <Show when={local.children}>
            <div class="text-gray-700">
              {local.children}
            </div>
          </Show>
        </div>
      </Show>
    </div>
  );
};

export default Card;
