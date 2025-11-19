import { createSignal, JSX } from 'solid-js';

// Navigation store using SolidJS signals (replaces ViewContext from React)
const [viewStack, setViewStack] = createSignal<JSX.Element[]>([]);

export const navigationStore = {
  get stack() {
    return viewStack();
  },

  push(view: JSX.Element) {
    setViewStack([view, ...viewStack()]);
  },

  pop() {
    const stack = [...viewStack()];
    if (stack.length > 1) {
      stack.shift();
      setViewStack(stack);
    }
  },

  replace(view: JSX.Element) {
    setViewStack([view]);
  },

  clear() {
    setViewStack([]);
  },

  get current() {
    return viewStack()[0];
  },

  get canGoBack() {
    return viewStack().length > 1;
  }
};
