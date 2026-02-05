/**
 * Sanitize a filename by removing or replacing invalid characters
 */
export function sanitizeName(name: string): string {
  return name
    .trim()
    // Remove control characters
    .replace(/[\x00-\x1F\x7F]/g, '')
    // Replace invalid Windows filename characters
    .replace(/[<>:"/\\|?*]/g, '_')
    // Replace multiple spaces with single space
    .replace(/\s+/g, ' ')
    // Trim dots and spaces from ends
    .replace(/^[\s.]+|[\s.]+$/g, '')
    // Limit length to 200 characters (leave room for extension)
    .substring(0, 200);
}

/**
 * Format a filename with extension based on file type
 */
export function formatFileName(
  baseName: string,
  extension: string
): string {
  const sanitized = sanitizeName(baseName);

  // Ensure extension starts with dot
  const ext = extension.startsWith('.') ? extension : `.${extension}`;

  return `${sanitized}${ext}`;
}

/**
 * Create a full path by joining folder and filename
 */
export function joinPath(...parts: string[]): string {
  return parts
    .filter(p => p && p.trim() !== '')
    .map(p => sanitizeName(p))
    .join('/');
}

/**
 * Extract file extension from filename
 */
export function getExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');

  if (lastDot === -1 || lastDot === 0) {
    return '';
  }

  return filename.substring(lastDot);
}

/**
 * Remove file extension from filename
 */
export function removeExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');

  if (lastDot === -1 || lastDot === 0) {
    return filename;
  }

  return filename.substring(0, lastDot);
}

/**
 * Generate a unique filename by appending a number if file exists
 */
export function makeUnique(
  baseName: string,
  existingNames: Set<string>,
  extension: string = ''
): string {
  const ext = extension.startsWith('.') ? extension : `.${extension}`;
  let candidate = `${baseName}${ext}`;
  let counter = 1;

  while (existingNames.has(candidate)) {
    candidate = `${baseName} (${counter})${ext}`;
    counter++;
  }

  return candidate;
}
