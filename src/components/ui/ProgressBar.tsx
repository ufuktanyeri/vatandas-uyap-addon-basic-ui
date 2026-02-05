import { indirmeDurumu, indirmeYuzdesi } from '@store';

export function ProgressBar() {
  const durumu = indirmeDurumu.value;
  const yuzde = indirmeYuzdesi.value;

  if (durumu.status === 'idle') {
    return null;
  }

  const { completedCount = 0, totalCount = 0, failedCount = 0 } = durumu;

  return (
    <div class="uyap-p-4 uyap-border-t uyap-border-gray-200">
      <div class="uyap-flex uyap-justify-between uyap-text-sm uyap-mb-2">
        <span class="uyap-font-medium">İndirme İlerlemesi</span>
        <span class="uyap-text-gray-600">
          {completedCount}/{totalCount} ({yuzde}%)
        </span>
      </div>

      <div class="uyap-w-full uyap-bg-gray-200 uyap-rounded-full uyap-h-2.5 uyap-mb-2">
        <div
          class={`uyap-h-2.5 uyap-rounded-full uyap-transition-all ${
            durumu.status === 'downloading'
              ? 'uyap-bg-blue-600 uyap-progress-bar-animated'
              : durumu.status === 'completed'
              ? 'uyap-bg-green-600'
              : durumu.status === 'error'
              ? 'uyap-bg-red-600'
              : 'uyap-bg-gray-400'
          }`}
          style={{ width: `${yuzde}%` }}
        />
      </div>

      {failedCount > 0 && (
        <div class="uyap-text-xs uyap-text-red-600">
          {failedCount} evrak indirilemedi
        </div>
      )}

      {durumu.status === 'error' && durumu.error && (
        <div class="uyap-text-xs uyap-text-red-600 uyap-mt-1">
          Hata: {durumu.error}
        </div>
      )}
    </div>
  );
}
