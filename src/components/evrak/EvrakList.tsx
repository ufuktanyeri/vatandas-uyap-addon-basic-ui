import { grupluEvraklar, deltaInfo } from '@store';
import { EvrakGroup } from './EvrakGroup';
import { EmptyState } from '@components/ui/EmptyState';

export function EvrakList() {
  const groups = grupluEvraklar.value;
  const delta = deltaInfo.value;

  if (groups.size === 0) {
    return <EmptyState message="Evrak bulunamadi" />;
  }

  return (
    <>
      {/* Delta info */}
      {delta.mevcut > 0 && (
        <div class="uyap-ext-delta">
          <p>
            <strong>{delta.yeni}</strong> yeni evrak bulundu
            {delta.mevcut > 0 && (
              <span> ({delta.mevcut} evrak zaten indirilmis)</span>
            )}
          </p>
        </div>
      )}

      {/* Groups */}
      <div>
        {Array.from(groups.entries()).map(([klasorAdi, evraklar]) => (
          <EvrakGroup
            key={klasorAdi}
            klasorAdi={klasorAdi}
            evraklar={evraklar}
          />
        ))}
      </div>
    </>
  );
}
