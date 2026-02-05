import { useState } from 'preact/hooks';
import {
  evraklar,
  seciliEvrakIds,
  seciliEvrakSayisi,
  indirmeDurumu,
  dosyaBilgileri,
  tumunuSec,
  secimiTemizle,
  sessionExpired
} from '@store';
import { Downloader } from '@content/downloader';
import { EvrakList } from '@components/evrak/EvrakList';
import { ProgressBar } from '@components/ui/ProgressBar';
import { SessionAlert } from '@components/ui/SessionAlert';
import { Button } from '@components/ui/Button';
import { useToast } from '@hooks';

interface SidebarProps {
  onClose: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const { showToast, Toast } = useToast();

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
      showToast('En az bir evrak secin', 'error');
      return;
    }

    const dosya = dosyaBilgileri.value;

    if (!dosya) {
      showToast('Dosya bilgileri bulunamadi', 'error');
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
    <div class="uyap-ext-panel">
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

      {/* Toast notification */}
      <Toast />

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
          <Button
            variant="secondary"
            onClick={handleTumunuSec}
            disabled={isDownloading}
            class="uyap-flex-1"
          >
            Tümünü Seç
          </Button>
          <Button
            variant="secondary"
            onClick={handleSecimiTemizle}
            disabled={isDownloading}
            class="uyap-flex-1"
          >
            Temizle
          </Button>
        </div>

        {!isDownloading ? (
          <Button
            variant="primary"
            onClick={handleIndir}
            disabled={seciliEvrakSayisi.value === 0}
            fullWidth
          >
            İndir ({seciliEvrakSayisi.value})
          </Button>
        ) : (
          <div class="uyap-flex uyap-gap-2">
            <Button
              variant="warning"
              onClick={handleDuraklat}
              class="uyap-flex-1"
            >
              {downloader.isPausedState() ? 'Devam Et' : 'Duraklat'}
            </Button>
            <Button
              variant="danger"
              onClick={handleIptal}
              class="uyap-flex-1"
            >
              İptal
            </Button>
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
