/**
 * File System Access API extensions
 * queryPermission and requestPermission are not yet in TypeScript's DOM types
 */
interface FileSystemDirectoryHandle {
  queryPermission(
    descriptor?: { mode?: 'read' | 'readwrite' }
  ): Promise<PermissionState>;
  requestPermission(
    descriptor?: { mode?: 'read' | 'readwrite' }
  ): Promise<PermissionState>;
}
