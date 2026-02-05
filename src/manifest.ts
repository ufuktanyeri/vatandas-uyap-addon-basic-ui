import { defineManifest } from '@crxjs/vite-plugin';

export default defineManifest({
  manifest_version: 3,
  name: 'UYAP Dosya İndirici',
  version: '1.0.0',
  description: 'UYAP Vatandaş Portal\'ından dava dosyalarını seçerek indirme',

  permissions: [
    'downloads',
    'storage',
    'tabs'
  ],

  host_permissions: [
    'https://*.uyap.gov.tr/*'
  ],

  background: {
    service_worker: 'src/background/service-worker.ts',
    type: 'module'
  },

  action: {
    default_popup: 'src/popup/index.html',
    default_icon: {
      '16': 'icons/icon16.png',
      '32': 'icons/icon32.png',
      '48': 'icons/icon48.png',
      '128': 'icons/icon128.png'
    }
  },

  content_scripts: [
    {
      matches: ['https://*.uyap.gov.tr/*'],
      js: ['src/content/index.tsx'],
      run_at: 'document_end',
      all_frames: true
    }
  ],

  icons: {
    '16': 'icons/icon16.png',
    '32': 'icons/icon32.png',
    '48': 'icons/icon48.png',
    '128': 'icons/icon128.png'
  }
});
