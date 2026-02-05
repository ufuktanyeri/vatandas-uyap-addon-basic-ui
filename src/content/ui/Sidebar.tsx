import { useState, useEffect } from 'preact/hooks';
import {
  evraklar,
  seciliEvrakIds,
  seciliEvrakSayisi,
  indirmeDurumu,
  dosyaBilgileri,
  tumunuSec,
  secimiTemizle,
  sessionExpired
} from '@shared/signals';
import { Downloader } from '../downloader';
import { EvrakList } from './EvrakList';
import { ProgressBar } from './ProgressBar';
import { SessionAlert } from './SessionAlert';

interface SidebarProps {
  onClose: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const [notification, setNotification] = useState<{
    message: string;
    type: 'error' | 'success';
  } | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const [downloader] = useState(() => new Downloader(
    (progress) => {
      console.log('Download progress:', progress);
      // Progress updates handled by signals
    },
    () => {
      sessionExpired.value = true;
    }
  ));

  const handleTumunuSec = () => {
    tumunuSec();
  };

  const handleSecimiTemizle = () => {
    secimiTemizle();
  };

  const handleIndir = async () => {
    const seciliEvraklar = evraklar.value.filter(e =>
      seciliEvrakIds.value.has(e.evrakId)
    );

    if (seciliEvraklar.length === 0) {
      setNotification({ message: 'En az bir evrak secin', type: 'error' });
      return;
    }

    const dosya = dosyaBilgileri.value;

    if (!dosya) {
      setNotification({ message: 'Dosya bilgileri bulunamadi', type: 'error' });
      return;
    }

    // Update state
    indirmeDurumu.value = {
      status: 'downloading',
      currentIndex: 0,
      totalCount: seciliEvraklar.length,
      completedCount: 0,
      failedCount: 0
    };

    // Start download
    await downloader.downloadAll(seciliEvraklar, dosya);

    // Complete
    indirmeDurumu.value = {
      ...indirmeDurumu.value,
      status: 'completed'
    };
  };

  const handleDuraklat = () => {
    if (downloader.isPausedState()) {
      downloader.resume();
      indirmeDurumu.value = {
        ...indirmeDurumu.value,
        status: 'downloading'
      };
    } else {
      downloader.pause();
      indirmeDurumu.value = {
        ...indirmeDurumu.value,
        status: 'paused'
      };
    }
  };

  const handleIptal = () => {
    downloader.cancel();
    indirmeDurumu.value = {
      status: 'idle'
    };
  };

  const isDownloading = indirmeDurumu.value.status === 'downloading' ||
                       indirmeDurumu.value.status === 'paused';

  return (
    <div class="uyap-ext-sidebar">
      {/* Header */}
      <div class="uyap-flex uyap-items-center uyap-justify-between uyap-p-4 uyap-border-b uyap-border-gray-200 uyap-bg-white">
        <h2 class="uyap-text-lg uyap-font-semibold uyap-text-gray-900">
          Evrak İndirici
        </h2>
        <button
          onClick={onClose}
          class="uyap-text-gray-400 hover:uyap-text-gray-600"
        >
          <svg
            class="uyap-w-5 uyap-h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Inline notification */}
      {notification && (
        <div
          class={`uyap-px-4 uyap-py-2 uyap-text-sm ${
            notification.type === 'error'
              ? 'uyap-bg-red-50 uyap-text-red-800'
              : 'uyap-bg-green-50 uyap-text-green-800'
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Session alert */}
      <SessionAlert onClose={() => { sessionExpired.value = false; }} />

      {/* Stats */}
      <div class="uyap-p-4 uyap-bg-gray-50 uyap-border-b uyap-border-gray-200">
        <div class="uyap-text-sm uyap-text-gray-600">
          <p>
            <strong>{evraklar.value.length}</strong> evrak bulundu
          </p>
          <p>
            <strong>{seciliEvrakSayisi.value}</strong> evrak seçili
          </p>
        </div>
      </div>

      {/* Actions */}
      <div class="uyap-p-4 uyap-border-b uyap-border-gray-200 uyap-space-y-2">
        <div class="uyap-flex uyap-gap-2">
          <button
            onClick={handleTumunuSec}
            disabled={isDownloading}
            class="uyap-flex-1 uyap-px-3 uyap-py-2 uyap-text-sm uyap-font-medium uyap-text-gray-700 uyap-bg-white uyap-border uyap-border-gray-300 uyap-rounded-md hover:uyap-bg-gray-50 disabled:uyap-opacity-50 disabled:uyap-cursor-not-allowed"
          >
            Tümünü Seç
          </button>
          <button
            onClick={handleSecimiTemizle}
            disabled={isDownloading}
            class="uyap-flex-1 uyap-px-3 uyap-py-2 uyap-text-sm uyap-font-medium uyap-text-gray-700 uyap-bg-white uyap-border uyap-border-gray-300 uyap-rounded-md hover:uyap-bg-gray-50 disabled:uyap-opacity-50 disabled:uyap-cursor-not-allowed"
          >
            Temizle
          </button>
        </div>

        {!isDownloading ? (
          <button
            onClick={handleIndir}
            disabled={seciliEvrakSayisi.value === 0}
            class="uyap-w-full uyap-px-4 uyap-py-2 uyap-text-sm uyap-font-medium uyap-text-white uyap-bg-blue-600 uyap-border uyap-border-transparent uyap-rounded-md hover:uyap-bg-blue-700 disabled:uyap-opacity-50 disabled:uyap-cursor-not-allowed"
          >
            İndir ({seciliEvrakSayisi.value})
          </button>
        ) : (
          <div class="uyap-flex uyap-gap-2">
            <button
              onClick={handleDuraklat}
              class="uyap-flex-1 uyap-px-4 uyap-py-2 uyap-text-sm uyap-font-medium uyap-text-white uyap-bg-yellow-600 uyap-border uyap-border-transparent uyap-rounded-md hover:uyap-bg-yellow-700"
            >
              {downloader.isPausedState() ? 'Devam Et' : 'Duraklat'}
            </button>
            <button
              onClick={handleIptal}
              class="uyap-flex-1 uyap-px-4 uyap-py-2 uyap-text-sm uyap-font-medium uyap-text-white uyap-bg-red-600 uyap-border uyap-border-transparent uyap-rounded-md hover:uyap-bg-red-700"
            >
              İptal
            </button>
          </div>
        )}
      </div>

      {/* Evrak list */}
      <EvrakList />

      {/* Progress bar */}
      <ProgressBar />
    </div>
  );
}
