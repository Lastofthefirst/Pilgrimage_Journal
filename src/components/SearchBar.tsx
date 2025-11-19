import { Component, JSX, splitProps, Show, createSignal } from 'solid-js';

export interface SearchBarProps extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onClear?: () => void;
  clearable?: boolean;
}

const SearchBar: Component<SearchBarProps> = (props) => {
  const [local, others] = splitProps(props, [
    'value',
    'onClear',
    'clearable',
    'class',
    'placeholder',
  ]);

  const [isFocused, setIsFocused] = createSignal(false);
  const placeholder = () => local.placeholder || 'Search...';
  const showClear = () => (local.clearable ?? true) && local.value;

  const handleClear = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (local.onClear) {
      local.onClear();
    }
  };

  const containerClasses = () => [
    'relative w-full',
    'bg-white rounded-full',
    'border-2 transition-all duration-200',
    isFocused()
      ? 'border-[#015D7C] shadow-lg'
      : 'border-gray-300 shadow-md',
    local.class || '',
  ].filter(Boolean).join(' ');

  return (
    <div class={containerClasses()}>
      {/* Search Icon */}
      <div class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Input Field */}
      <input
        type="text"
        value={local.value || ''}
        placeholder={placeholder()}
        class={[
          'w-full pl-12 pr-12 py-3',
          'bg-transparent',
          'text-gray-900 placeholder-gray-400',
          'focus:outline-none',
          'rounded-full',
        ].join(' ')}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        aria-label={placeholder()}
        {...others}
      />

      {/* Clear Button */}
      <Show when={showClear()}>
        <button
          type="button"
          onClick={handleClear}
          class={[
            'absolute right-4 top-1/2 -translate-y-1/2',
            'w-5 h-5 text-gray-400',
            'hover:text-gray-600 transition-colors',
            'focus:outline-none focus:text-gray-600',
            'rounded-full',
          ].join(' ')}
          aria-label="Clear search"
        >
          <svg
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
  );
};

export default SearchBar;
