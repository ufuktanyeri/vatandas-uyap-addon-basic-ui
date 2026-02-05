import { initMessageRouter } from './message-router';

console.log('UYAP Extension: Background service worker started');

// Initialize message router (handles all content/popup communication)
initMessageRouter();

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('UYAP Extension installed');
  } else if (details.reason === 'update') {
    console.log('UYAP Extension updated');
  }
});
