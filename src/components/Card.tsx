import { Component, JSX, splitProps, Show } from 'solid-js';

export interface CardProps extends JSX.HTMLAttributes<HTMLDivElement> {
  image?: string;
  imageAlt?: string;
  title?: string | JSX.Element;
  children?: JSX.Element;
  onClick?: (e: MouseEvent) => void;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
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
    'class',
  ]);

  const padding = () => local.padding || 'md';
  const isClickable = () => !!local.onClick;
  const hoverable = () => local.hoverable ?? isClickable();

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
      default:
        return '';
    }
  };

  const baseClasses = () => [
    'bg-white rounded-lg shadow-md',
    'overflow-hidden',
    'transition-all duration-200',
    hoverable() ? 'hover:shadow-lg hover:scale-[1.02]' : '',
    isClickable() ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#015D7C] focus:ring-offset-2' : '',
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
      {/* Image Section */}
      <Show when={local.image}>
        <div class="w-full aspect-video overflow-hidden">
          <img
            src={local.image}
            alt={local.imageAlt || ''}
            class="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      </Show>

      {/* Content Section */}
      <div class={paddingClasses()}>
        {/* Title */}
        <Show when={local.title}>
          <div class="mb-2">
            {typeof local.title === 'string' ? (
              <h3 class="text-lg font-semibold text-gray-900 line-clamp-2">
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
    </div>
  );
};

export default Card;
