// Evrak bilgisi (scanner çıktısı)
export interface EvrakItem {
  evrakId: string;
  name: string;
  relativePath: string;        // "Dilekçeler/Dava Dilekçesi"
  evrakTuru?: string;
  evrakTarihi?: string;
}

// Dosya bilgisi (UYAP global object)
export interface DosyaBilgileri {
  dosyaId: string;
  dosyaNo: string;              // "2024/1234"
  birimId: string;
  birimAdi: string;
  dosyaTurKod: string;
  yargiTuru: string;            // Boş olabilir!
  dosyaDurumu: string;
}

// Pagination bilgisi (UYAP filetree sayfalama)
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  hasMultiplePages: boolean;
}

// İndirme durumu
export type DownloadStatus =
  | 'pending'
  | 'downloading'
  | 'completed'
  | 'failed'
  | 'session_expired';

// İndirme progress bilgisi
export interface DownloadProgress {
  evrakId: string;
  status: DownloadStatus;
  error?: string;
}

// Download start payload (content -> background)
export interface DownloadStartPayload {
  evrakId: string;
  evrakName: string;
  relativePath: string;
}

// Download progress payload (background -> content)
export interface DownloadProgressPayload {
  evrakId: string;
  status: DownloadStatus;
  fileName?: string;
  mimeType?: string;
  fileSize?: number;
  error?: string;
}

// İndirme state
export interface DownloadState {
  status: 'idle' | 'downloading' | 'paused' | 'completed' | 'error';
  currentIndex?: number;
  totalCount?: number;
  completedCount?: number;
  failedCount?: number;
  error?: string;
}

// Ayarlar
export interface Settings {
  downloadDelay: number;        // ms cinsinden delay (default: 300)
  autoRetry: boolean;           // Hata durumunda otomatik retry
  keepFolderStructure: boolean; // Klasör yapısını koru
  selectedDirectory?: string;   // Seçili klasör yolu (display için)
}

// Export manifest (delta sync için)
export interface ExportData {
  schemaVersion: '1.0';
  exportedAt: string;
  exportedBy: string;
  dosya: DosyaBilgileri;
  stats: {
    totalEvrak: number;
    downloadedEvrak: number;
    failedEvrak: number;
  };
  evraklar: Array<{
    evrakId: string;
    fileName: string;
    relativePath: string;
    mimeType: string;
    evrakTuru: string;
    evrakTarihi: string;
    downloadedAt: string;
    fileSize: number;
    status: 'completed' | 'failed';
    error: string | null;
  }>;
}

// Write file payload (content -> background)
export interface WriteFilePayload {
  base64Data: string;
  fileName: string;
  relativePath: string;
  mimeType: string;
  fileSize: number;
}

// Write file response (background -> content)
export interface WriteFileResponse {
  success: boolean;
  error?: string;
}

// Message types for communication between content, popup, and background
export type MessageType =
  | 'SCAN_COMPLETE'
  | 'DOWNLOAD_START'
  | 'DOWNLOAD_PROGRESS'
  | 'DOWNLOAD_COMPLETE'
  | 'DOWNLOAD_PAUSE'
  | 'DOWNLOAD_RESUME'
  | 'DOWNLOAD_CANCEL'
  | 'SESSION_EXPIRED'
  | 'GET_DIRECTORY_HANDLE'
  | 'SET_DIRECTORY_HANDLE'
  | 'GET_SETTINGS'
  | 'SET_SETTINGS'
  | 'WRITE_FILE';

export interface Message<T = any> {
  type: MessageType;
  payload?: T;
}
