import { Component, JSX, splitProps, Show, createUniqueId } from 'solid-js';

export interface InputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  leftIcon?: JSX.Element;
  rightIcon?: JSX.Element;
}

const Input: Component<InputProps> = (props) => {
  const [local, others] = splitProps(props, [
    'label',
    'error',
    'helperText',
    'fullWidth',
    'leftIcon',
    'rightIcon',
    'class',
    'id',
  ]);

  const inputId = () => local.id || createUniqueId();
  const hasError = () => !!local.error;

  const inputClasses = () => [
    'w-full px-4 py-2',
    'bg-white border rounded-md',
    'text-gray-900 placeholder-gray-400',
    'transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-1',
    hasError()
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
      : 'border-gray-300 focus:border-[#015D7C] focus:ring-[#015D7C]',
    'disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500',
    local.leftIcon ? 'pl-10' : '',
    local.rightIcon ? 'pr-10' : '',
    local.class || '',
  ].filter(Boolean).join(' ');

  return (
    <div class={local.fullWidth ? 'w-full' : ''}>
      {/* Label */}
      <Show when={local.label}>
        <label
          for={inputId()}
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          {local.label}
        </label>
      </Show>

      {/* Input Container */}
      <div class="relative">
        {/* Left Icon */}
        <Show when={local.leftIcon}>
          <div class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none">
            {local.leftIcon}
          </div>
        </Show>

        {/* Input Field */}
        <input
          id={inputId()}
          class={inputClasses()}
          aria-invalid={hasError()}
          aria-describedby={
            hasError() ? `${inputId()}-error` :
            local.helperText ? `${inputId()}-helper` :
            undefined
          }
          {...others}
        />

        {/* Right Icon */}
        <Show when={local.rightIcon}>
          <div class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400">
            {local.rightIcon}
          </div>
        </Show>
      </div>

      {/* Error Message */}
      <Show when={hasError()}>
        <p
          id={`${inputId()}-error`}
          class="mt-1 text-sm text-red-600"
          role="alert"
        >
          {local.error}
        </p>
      </Show>

      {/* Helper Text */}
      <Show when={local.helperText && !hasError()}>
        <p
          id={`${inputId()}-helper`}
          class="mt-1 text-sm text-gray-500"
        >
          {local.helperText}
        </p>
      </Show>
    </div>
  );
};

export default Input;
