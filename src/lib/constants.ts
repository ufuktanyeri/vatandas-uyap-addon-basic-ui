// UYAP endpoints
export const UYAP_BASE_URL = 'https://vatandas.uyap.gov.tr';
export const DOWNLOAD_ENDPOINT = 'download_document_brd.uyap';

// Magic bytes for file type detection
export const MAGIC_BYTES = {
  PDF: [0x25, 0x50, 0x44, 0x46],       // %PDF
  ZIP: [0x50, 0x4B, 0x03, 0x04],       // PK.. (UDF)
  TIFF_LE: [0x49, 0x49, 0x2A, 0x00],   // II*.
  TIFF_BE: [0x4D, 0x4D, 0x00, 0x2A],   // MM.*
} as const;

// MIME types
export const MIME_TYPES = {
  PDF: 'application/pdf',
  UDF: 'application/zip',
  TIFF: 'image/tiff',
  HTML: 'text/html',
  UNKNOWN: 'application/octet-stream'
} as const;

// File extensions
export const FILE_EXTENSIONS = {
  PDF: '.pdf',
  UDF: '.udf',
  TIFF: '.tiff',
  HTML: '.html'
} as const;

// UYAP DOM selectors
export const SELECTORS = {
  FILETREE: '#browser.filetree',
  MODAL: '#dosya_goruntule_modal',
  YARGI_TURU_SELECT: '#yargiTuru',
  USERNAME: '.username.username-hide-on-mobile',
  FILE_SPAN: 'span.file',
  FOLDER_SPAN: 'span.folder'
} as const;

// Folders to skip during scanning
export const SKIP_FOLDERS = ['Son 20 Evrak', 'Son20'];

// Default settings
export const DEFAULT_SETTINGS = {
  downloadDelay: 300,           // 300ms minimum delay (WAF protection)
  autoRetry: true,
  keepFolderStructure: true
} as const;

// Default yargiTuru value
export const DEFAULT_YARGI_TURU = '1'; // Hukuk

// IndexedDB configuration
export const IDB_CONFIG = {
  DB_NAME: 'uyap-extension-db',
  STORE_NAME: 'handles',
  VERSION: 1
} as const;

// Storage keys
export const STORAGE_KEYS = {
  SETTINGS: 'uyap-settings',
  DIRECTORY_HANDLE: 'directory-handle',
  LAST_EXPORT: 'last-export'
} as const;

// Export file name
export const EXPORT_FILE_NAME = 'uyap-export.json';
