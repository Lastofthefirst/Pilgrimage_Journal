/* @refresh reload */
import { render } from 'solid-js/web';
import './index.css';
import App from './App';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

render(() => <App />, root);

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}
