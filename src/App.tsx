import { Component, createEffect, onMount } from 'solid-js';
import { navigationStore } from './stores/navigationStore';
import { uiStore } from './stores/uiStore';
import NotesList from './views/NotesList';
import toast, { Toaster } from 'solid-toast';

const App: Component = () => {
  onMount(() => {
    // Initialize the app with the NotesList view
    if (navigationStore.stack.length === 0) {
      navigationStore.push(<NotesList />);
    }

    // Handle browser back button
    const handlePopState = () => {
      if (navigationStore.canGoBack) {
        navigationStore.pop();
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Cleanup
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  });

  // Handle keyboard visibility for better UX
  createEffect(() => {
    const handleFocus = () => uiStore.setKeyboardVisible(true);
    const handleBlur = () => uiStore.setKeyboardVisible(false);

    document.addEventListener('focusin', handleFocus);
    document.addEventListener('focusout', handleBlur);

    return () => {
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('focusout', handleBlur);
    };
  });

  return (
    <div class="w-full h-full flex flex-col bg-[#024359] overflow-hidden">
      {/* Toast notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#015D7C',
            color: '#fff',
          },
        }}
      />

      {/* Main content area with navigation stack */}
      <div class="flex-1 overflow-hidden">
        {navigationStore.current}
      </div>
    </div>
  );
};

export default App;
