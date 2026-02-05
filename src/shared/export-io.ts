import type { ExportData, EvrakItem, DosyaBilgileri } from './types';
import { EXPORT_FILE_NAME } from './constants';

/**
 * Load existing export data from the directory
 */
export async function loadExistingExport(
  directoryHandle: FileSystemDirectoryHandle
): Promise<ExportData | null> {
  try {
    const fileHandle = await directoryHandle.getFileHandle(EXPORT_FILE_NAME);
    const file = await fileHandle.getFile();
    const text = await file.text();
    const data = JSON.parse(text) as ExportData;

    // Validate schema version
    if (data.schemaVersion !== '1.0') {
      console.warn('Unknown export schema version:', data.schemaVersion);
      return null;
    }

    return data;
  } catch (error) {
    // File doesn't exist or can't be read
    if (error instanceof Error && error.name === 'NotFoundError') {
      return null;
    }

    console.error('Error loading export data:', error);
    return null;
  }
}

/**
 * Compare scanned evraklar with existing export to find new items
 */
export function compareWithExisting(
  scannedEvraklar: EvrakItem[],
  existingExport: ExportData | null
): { yeni: EvrakItem[]; mevcut: EvrakItem[] } {
  if (!existingExport) {
    return {
      yeni: scannedEvraklar,
      mevcut: []
    };
  }

  const mevcutIds = new Set(
    existingExport.evraklar.map(e => e.evrakId)
  );

  const yeni: EvrakItem[] = [];
  const mevcut: EvrakItem[] = [];

  for (const evrak of scannedEvraklar) {
    if (mevcutIds.has(evrak.evrakId)) {
      mevcut.push(evrak);
    } else {
      yeni.push(evrak);
    }
  }

  return { yeni, mevcut };
}

/**
 * Write export data to the directory
 */
export async function writeExportData(
  directoryHandle: FileSystemDirectoryHandle,
  exportData: ExportData
): Promise<void> {
  try {
    const fileHandle = await directoryHandle.getFileHandle(
      EXPORT_FILE_NAME,
      { create: true }
    );

    const writable = await fileHandle.createWritable();
    const json = JSON.stringify(exportData, null, 2);

    await writable.write(json);
    await writable.close();
  } catch (error) {
    console.error('Error writing export data:', error);
    throw error;
  }
}

/**
 * Create initial export data structure
 */
export function createExportData(
  dosya: DosyaBilgileri,
  exportedBy: string
): ExportData {
  return {
    schemaVersion: '1.0',
    exportedAt: new Date().toISOString(),
    exportedBy,
    dosya,
    stats: {
      totalEvrak: 0,
      downloadedEvrak: 0,
      failedEvrak: 0
    },
    evraklar: []
  };
}

/**
 * Update export data with a completed download
 */
export function addDownloadedEvrak(
  exportData: ExportData,
  evrak: EvrakItem,
  fileName: string,
  mimeType: string,
  fileSize: number,
  status: 'completed' | 'failed',
  error: string | null = null
): ExportData {
  const updatedEvraklar = [
    ...exportData.evraklar,
    {
      evrakId: evrak.evrakId,
      fileName,
      relativePath: evrak.relativePath,
      mimeType,
      evrakTuru: evrak.evrakTuru || '',
      evrakTarihi: evrak.evrakTarihi || '',
      downloadedAt: new Date().toISOString(),
      fileSize,
      status,
      error
    }
  ];

  const downloadedCount = updatedEvraklar.filter(
    e => e.status === 'completed'
  ).length;

  const failedCount = updatedEvraklar.filter(
    e => e.status === 'failed'
  ).length;

  return {
    ...exportData,
    stats: {
      totalEvrak: updatedEvraklar.length,
      downloadedEvrak: downloadedCount,
      failedEvrak: failedCount
    },
    evraklar: updatedEvraklar
  };
}
