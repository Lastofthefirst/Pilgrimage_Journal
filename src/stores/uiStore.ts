import { createSignal } from 'solid-js';

// UI state store (replaces MenuContext from React)
const [menuVisible, setMenuVisible] = createSignal(true);
const [keyboardVisible, setKeyboardVisible] = createSignal(false);

export const uiStore = {
  get menuVisible() {
    return menuVisible();
  },

  setMenuVisible(visible: boolean) {
    setMenuVisible(visible);
  },

  get keyboardVisible() {
    return keyboardVisible();
  },

  setKeyboardVisible(visible: boolean) {
    setKeyboardVisible(visible);
    if (visible) {
      setMenuVisible(false);
    } else {
      setMenuVisible(true);
    }
  }
};
