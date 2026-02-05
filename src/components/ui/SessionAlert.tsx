import { sessionExpired } from '@store';
import { Button } from './Button';

interface SessionAlertProps {
  onClose: () => void;
}

export function SessionAlert({ onClose }: SessionAlertProps) {
  if (!sessionExpired.value) {
    return null;
  }

  return (
    <div class="uyap-p-4 uyap-bg-red-50 uyap-border-l-4 uyap-border-red-500">
      <div class="uyap-flex uyap-items-start">
        <div class="uyap-flex-shrink-0">
          <svg
            class="uyap-h-5 uyap-w-5 uyap-text-red-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div class="uyap-ml-3 uyap-flex-1">
          <h3 class="uyap-text-sm uyap-font-medium uyap-text-red-800">
            Oturum Süresi Doldu
          </h3>
          <div class="uyap-mt-2 uyap-text-sm uyap-text-red-700">
            <p>
              UYAP oturumunuzun süresi dolmuş. Lütfen sayfayı yenileyerek
              tekrar giriş yapın ve indirme işlemine devam edin.
            </p>
          </div>
          <div class="uyap-mt-3">
            <Button
              variant="danger"
              size="sm"
              onClick={() => window.location.reload()}
            >
              Sayfayı Yenile
            </Button>
          </div>
        </div>
        <div class="uyap-ml-auto uyap-pl-3">
          <button
            onClick={onClose}
            class="uyap-inline-flex uyap-rounded-md uyap-p-1.5 uyap-text-red-500 hover:uyap-bg-red-100 focus:uyap-outline-none"
          >
            <span class="uyap-sr-only">Kapat</span>
            <svg
              class="uyap-h-5 uyap-w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
