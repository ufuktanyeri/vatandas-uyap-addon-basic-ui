import { indirmeDurumu, indirmeYuzdesi } from '@store';
import { Icon } from '@components';

export function ProgressBar() {
  const durumu = indirmeDurumu.value;
  const yuzde = indirmeYuzdesi.value;

  if (durumu.status === 'idle') {
    return null;
  }

  const { completedCount = 0, totalCount = 0, failedCount = 0 } = durumu;

  const barClass = durumu.status === 'downloading'
    ? 'uyap-ext-progress__bar--downloading uyap-ext-progress__bar--animated'
    : durumu.status === 'completed'
    ? 'uyap-ext-progress__bar--completed'
    : durumu.status === 'error'
    ? 'uyap-ext-progress__bar--error'
    : 'uyap-ext-progress__bar--paused';

  return (
    <div class="uyap-ext-progress">
      <div class="uyap-ext-progress__header">
        <span class="uyap-ext-progress__label">Indirme Ilerlemesi</span>
        <span class="uyap-ext-progress__value">
          {completedCount}/{totalCount} ({yuzde}%)
        </span>
      </div>

      <div class="uyap-ext-progress__track">
        <div
          class={`uyap-ext-progress__bar ${barClass}`}
          style={{ width: `${yuzde}%` }}
        />
      </div>

      {failedCount > 0 && (
        <div class="uyap-ext-progress__error">
          <Icon name="warning" class="uyap-ext-icon-spacing-sm" />
          {failedCount} evrak indirilemedi
        </div>
      )}

      {durumu.status === 'error' && durumu.error && (
        <div class="uyap-ext-progress__error">
          Hata: {durumu.error}
        </div>
      )}
    </div>
  );
}
