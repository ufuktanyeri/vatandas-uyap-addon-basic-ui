import type { WriteFilePayload, WriteFileResponse } from '@/types';
import { loadDirectoryHandle, verifyDirectoryPermission } from './idb-storage';
import { sanitizeName } from '@lib';

/**
 * Convert base64 string to Uint8Array
 */
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes;
}

/**
 * Write a file to the user-selected target directory
 * Called by message-router when content script sends WRITE_FILE
 *
 * Flow:
 * 1. Load FileSystemDirectoryHandle from IndexedDB
 * 2. Verify read-write permission
 * 3. Create subdirectory structure (relativePath)
 * 4. Decode base64 data and write file
 */
export async function writeFileToDirectory(
  payload: WriteFilePayload
): Promise<WriteFileResponse> {
  try {
    // 1. Load directory handle
    const directoryHandle = await loadDirectoryHandle();

    if (!directoryHandle) {
      return {
        success: false,
        error: 'Hedef klasor secilmemis. Popup\'tan bir klasor secin.'
      };
    }

    // 2. Verify permission
    const hasPermission = await verifyDirectoryPermission(directoryHandle);

    if (!hasPermission) {
      return {
        success: false,
        error: 'Klasor erisim izni yok. Popup\'tan izin verin.'
      };
    }

    // 3. Create subdirectory structure
    let currentDir = directoryHandle;

    if (payload.relativePath) {
      const pathParts = payload.relativePath.split('/').filter(p => p.trim() !== '');

      for (const part of pathParts) {
        const safeName = sanitizeName(part);
        if (!safeName) continue;
        currentDir = await currentDir.getDirectoryHandle(safeName, { create: true });
      }
    }

    // 4. Decode base64 and write file
    const fileData = base64ToUint8Array(payload.base64Data);
    const blob = new Blob([fileData.buffer as ArrayBuffer], { type: payload.mimeType });

    const fileHandle = await currentDir.getFileHandle(payload.fileName, { create: true });
    const writable = await (fileHandle as any).createWritable();

    await writable.write(blob);
    await writable.close();

    console.log(`File written: ${payload.relativePath}/${payload.fileName} (${payload.fileSize} bytes)`);

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Bilinmeyen hata';
    console.error('File write error:', message);
    return { success: false, error: message };
  }
}
