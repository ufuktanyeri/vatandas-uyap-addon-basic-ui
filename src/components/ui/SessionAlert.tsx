import { sessionExpired } from '@store';
import { Button, Icon } from '@components';

interface SessionAlertProps {
  onClose: () => void;
}

export function SessionAlert({ onClose }: SessionAlertProps) {
  if (!sessionExpired.value) {
    return null;
  }

  return (
    <div class="uyap-ext-alert">
      <Icon name="error" class="uyap-ext-alert__icon" />
      <div class="uyap-ext-alert__content">
        <h3 class="uyap-ext-alert__title">Oturum Suresi Doldu</h3>
        <p class="uyap-ext-alert__message">
          UYAP oturumunuzun suresi dolmus. Lutfen sayfayi yenileyerek
          tekrar giris yapin ve indirme islemine devam edin.
        </p>
        <Button
          variant="danger"
          size="sm"
          onClick={() => window.location.reload()}
        >
          <Icon name="refresh" class="uyap-ext-icon-spacing" />
          Sayfayi Yenile
        </Button>
      </div>
      <button onClick={onClose} class="uyap-ext-alert__close">
        <Icon name="close" />
      </button>
    </div>
  );
}
