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
import { ProgressBar, SessionAlert, Button, Icon } from '@components';
import { useToast } from '@hooks/useToast';

interface SidebarProps {
  onClose: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const { showToast, Toast } = useToast();

  const [downloader] = useState(() => new Downloader(
    (progress) => {
      console.log('Download progress:', progress);
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

    indirmeDurumu.value = {
      status: 'downloading',
      currentIndex: 0,
      totalCount: seciliEvraklar.length,
      completedCount: 0,
      failedCount: 0
    };

    await downloader.downloadAll(seciliEvraklar, dosya);

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
      <div class="uyap-ext-panel__header">
        <h2 class="uyap-ext-panel__title">Evrak Indirici</h2>
        <button onClick={onClose} class="uyap-ext-panel__close">
          <Icon name="close" />
        </button>
      </div>

      {/* Toast notification */}
      <Toast />

      {/* Session alert */}
      <SessionAlert onClose={() => { sessionExpired.value = false; }} />

      {/* Stats */}
      <div class="uyap-ext-panel__stats">
        <p><strong>{evraklar.value.length}</strong> evrak bulundu</p>
        <p><strong>{seciliEvrakSayisi.value}</strong> evrak secili</p>
      </div>

      {/* Actions */}
      <div class="uyap-ext-panel__actions">
        <div class="uyap-ext-panel__action-row">
          <Button
            variant="secondary"
            onClick={handleTumunuSec}
            disabled={isDownloading}
            class="uyap-ext-btn--flex1"
          >
            Tumunu Sec
          </Button>
          <Button
            variant="secondary"
            onClick={handleSecimiTemizle}
            disabled={isDownloading}
            class="uyap-ext-btn--flex1"
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
            <Icon name="download" class="uyap-ext-icon-spacing" />
            Indir ({seciliEvrakSayisi.value})
          </Button>
        ) : (
          <div class="uyap-ext-panel__action-row">
            <Button
              variant="warning"
              onClick={handleDuraklat}
              class="uyap-ext-btn--flex1"
            >
              <Icon
                name={downloader.isPausedState() ? 'play' : 'pause'}
                class="uyap-ext-icon-spacing"
              />
              {downloader.isPausedState() ? 'Devam Et' : 'Duraklat'}
            </Button>
            <Button
              variant="danger"
              onClick={handleIptal}
              class="uyap-ext-btn--flex1"
            >
              <Icon name="stop" class="uyap-ext-icon-spacing" />
              Iptal
            </Button>
          </div>
        )}
      </div>

      {/* Evrak list */}
      <div class="uyap-ext-panel__body">
        <EvrakList />
      </div>

      {/* Progress bar */}
      <ProgressBar />
    </div>
  );
}
