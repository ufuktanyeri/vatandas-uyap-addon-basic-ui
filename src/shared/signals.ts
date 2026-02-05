import { signal, computed } from '@preact/signals';
import type {
  EvrakItem,
  DosyaBilgileri,
  DownloadState,
  Settings,
  ExportData
} from './types';
import { DEFAULT_SETTINGS } from './constants';

// Core state
export const evraklar = signal<EvrakItem[]>([]);
export const seciliEvrakIds = signal<Set<string>>(new Set());
export const indirmeDurumu = signal<DownloadState>({ status: 'idle' });
export const dosyaBilgileri = signal<DosyaBilgileri | null>(null);

// Settings state
export const ayarlar = signal<Settings>({ ...DEFAULT_SETTINGS });

// Export data (delta sync için)
export const mevcutExport = signal<ExportData | null>(null);

// Sidebar visibility
export const sidebarVisible = signal<boolean>(false);

// Session state
export const sessionExpired = signal<boolean>(false);

// User identity (for export manifest)
export const kisiAdi = signal<string>('');

// Computed: Evrakları klasörlere göre grupla
export const grupluEvraklar = computed(() => {
  const groups = new Map<string, EvrakItem[]>();

  for (const evrak of evraklar.value) {
    const folder = evrak.relativePath.split('/')[0] || 'Diğer';

    if (!groups.has(folder)) {
      groups.set(folder, []);
    }

    groups.get(folder)!.push(evrak);
  }

  return groups;
});

// Computed: Delta bilgisi (yeni vs mevcut evraklar)
export const deltaInfo = computed(() => {
  const totalCount = evraklar.value.length;

  if (!mevcutExport.value) {
    return {
      toplam: totalCount,
      yeni: totalCount,
      mevcut: 0
    };
  }

  const mevcutIds = new Set(
    mevcutExport.value.evraklar.map(e => e.evrakId)
  );

  const yeniCount = evraklar.value.filter(
    e => !mevcutIds.has(e.evrakId)
  ).length;

  return {
    toplam: totalCount,
    yeni: yeniCount,
    mevcut: totalCount - yeniCount
  };
});

// Computed: Seçili evrak sayısı
export const seciliEvrakSayisi = computed(() => {
  return seciliEvrakIds.value.size;
});

// Computed: İndirme progress yüzdesi
export const indirmeYuzdesi = computed(() => {
  const state = indirmeDurumu.value;

  if (state.status === 'idle' || !state.totalCount) {
    return 0;
  }

  const completed = state.completedCount || 0;
  const total = state.totalCount;

  return Math.round((completed / total) * 100);
});

// Helper functions to update signals

export function toggleEvrakSecimi(evrakId: string) {
  const current = new Set(seciliEvrakIds.value);

  if (current.has(evrakId)) {
    current.delete(evrakId);
  } else {
    current.add(evrakId);
  }

  seciliEvrakIds.value = current;
}

export function tumunuSec() {
  seciliEvrakIds.value = new Set(evraklar.value.map(e => e.evrakId));
}

export function secimiTemizle() {
  seciliEvrakIds.value = new Set();
}

export function klasorEvraklariniSec(klasorAdi: string) {
  const current = new Set(seciliEvrakIds.value);
  const klasorEvraklari = grupluEvraklar.value.get(klasorAdi) || [];

  for (const evrak of klasorEvraklari) {
    current.add(evrak.evrakId);
  }

  seciliEvrakIds.value = current;
}

export function klasorEvraklariniKaldir(klasorAdi: string) {
  const current = new Set(seciliEvrakIds.value);
  const klasorEvraklari = grupluEvraklar.value.get(klasorAdi) || [];

  for (const evrak of klasorEvraklari) {
    current.delete(evrak.evrakId);
  }

  seciliEvrakIds.value = current;
}

export function updateDownloadProgress(
  completedCount: number,
  failedCount: number
) {
  indirmeDurumu.value = {
    ...indirmeDurumu.value,
    completedCount,
    failedCount
  };
}

export function resetDownloadState() {
  indirmeDurumu.value = { status: 'idle' };
  secimiTemizle();
}
