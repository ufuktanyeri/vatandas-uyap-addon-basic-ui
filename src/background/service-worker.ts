import { initMessageRouter } from './message-router';
import { initDownloadInterceptor } from './download-interceptor';

console.log('UYAP Extension: Background service worker started');

// Initialize message router
initMessageRouter();

// Initialize download interceptor
initDownloadInterceptor();

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('UYAP Extension installed');
  } else if (details.reason === 'update') {
    console.log('UYAP Extension updated');
  }
});

