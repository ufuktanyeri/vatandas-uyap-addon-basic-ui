import { useState, useEffect, useCallback } from 'preact/hooks';

export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: T) => Promise<void>, boolean] {
  const [value, setValue] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chrome.storage.local.get(key, (result) => {
      if (result[key] !== undefined) {
        setValue(result[key] as T);
      }
      setLoading(false);
    });
  }, [key]);

  const setStoredValue = useCallback(
    async (newValue: T) => {
      setValue(newValue);
      await chrome.storage.local.set({ [key]: newValue });
    },
    [key]
  );

  return [value, setStoredValue, loading];
}
