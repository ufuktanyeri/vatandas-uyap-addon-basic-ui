import { useState, useEffect } from 'preact/hooks';
import { sendToBackground, DEFAULT_SETTINGS } from '@lib';
import type { Settings } from '@/types';
import { Button } from '@components/ui/Button';
import { useToast } from '@hooks';

export function Popup() {
  const [directorySelected, setDirectorySelected] = useState(false);
  const [directoryName, setDirectoryName] = useState('');
  const [settings, setSettings] = useState<Settings>({ ...DEFAULT_SETTINGS });
  const [loading, setLoading] = useState(true);
  const { showToast, Toast } = useToast();

  useEffect(() => {
    // Load directory handle status and settings
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Check if directory handle exists
      const { handle, hasPermission } = await sendToBackground(
        'GET_DIRECTORY_HANDLE'
      );

      if (handle && hasPermission) {
        setDirectorySelected(true);
        setDirectoryName(handle.name);
      }

      // Load settings
      const loadedSettings = await sendToBackground('GET_SETTINGS');
      if (loadedSettings) {
        setSettings(loadedSettings);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDirectory = async () => {
    try {
      // Show directory picker
      const directoryHandle = await (window as any).showDirectoryPicker({
        mode: 'readwrite',
        startIn: 'downloads'
      });

      // Save to IndexedDB via background script
      await sendToBackground('SET_DIRECTORY_HANDLE', directoryHandle);

      setDirectorySelected(true);
      setDirectoryName(directoryHandle.name);
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error selecting directory:', error);
        showToast('Klasor secimi basarisiz oldu', 'error');
      }
    }
  };

  const handleSaveSettings = async () => {
    try {
      await sendToBackground('SET_SETTINGS', settings);
      showToast('Ayarlar kaydedildi', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast('Ayarlar kaydedilemedi', 'error');
    }
  };

  if (loading) {
    return (
      <div class="uyap-flex uyap-items-center uyap-justify-center uyap-h-screen">
        <div class="uyap-text-gray-600">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div class="uyap-min-h-screen uyap-bg-gray-50">
      <div class="uyap-bg-white uyap-border-b uyap-border-gray-200 uyap-p-4">
        <h1 class="uyap-text-xl uyap-font-bold uyap-text-gray-900">
          UYAP Dosya İndirici
        </h1>
        <p class="uyap-text-sm uyap-text-gray-600 uyap-mt-1">
          Dava dosyalarınızı kolayca indirin
        </p>
      </div>

      {/* Toast notification */}
      <Toast />

      <div class="uyap-p-4 uyap-space-y-4">
        {/* Directory selection */}
        <div class="uyap-bg-white uyap-rounded-lg uyap-shadow uyap-p-4">
          <h2 class="uyap-text-lg uyap-font-semibold uyap-text-gray-900 uyap-mb-3">
            İndirme Klasörü
          </h2>

          {directorySelected ? (
            <div class="uyap-space-y-3">
              <div class="uyap-flex uyap-items-center uyap-p-3 uyap-bg-green-50 uyap-border uyap-border-green-200 uyap-rounded-md">
                <svg
                  class="uyap-w-5 uyap-h-5 uyap-text-green-600 uyap-mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
                <div class="uyap-flex-1">
                  <p class="uyap-text-sm uyap-font-medium uyap-text-green-900">
                    Klasör seçildi
                  </p>
                  <p class="uyap-text-xs uyap-text-green-700 uyap-mt-1">
                    {directoryName}
                  </p>
                </div>
              </div>

              <Button
                variant="secondary"
                onClick={handleSelectDirectory}
                fullWidth
              >
                Klasörü Değiştir
              </Button>
            </div>
          ) : (
            <div class="uyap-space-y-3">
              <div class="uyap-p-3 uyap-bg-yellow-50 uyap-border uyap-border-yellow-200 uyap-rounded-md">
                <p class="uyap-text-sm uyap-text-yellow-800">
                  Evrakların indirileceği klasörü seçin
                </p>
              </div>

              <Button
                variant="primary"
                onClick={handleSelectDirectory}
                fullWidth
              >
                Klasör Seç
              </Button>
            </div>
          )}
        </div>

        {/* Settings */}
        <div class="uyap-bg-white uyap-rounded-lg uyap-shadow uyap-p-4">
          <h2 class="uyap-text-lg uyap-font-semibold uyap-text-gray-900 uyap-mb-3">
            Ayarlar
          </h2>

          <div class="uyap-space-y-4">
            {/* Download delay */}
            <div>
              <label class="uyap-block uyap-text-sm uyap-font-medium uyap-text-gray-700 uyap-mb-2">
                İndirmeler Arası Gecikme
              </label>
              <div class="uyap-flex uyap-items-center uyap-space-x-3">
                <input
                  type="range"
                  min="300"
                  max="2000"
                  step="100"
                  value={settings.downloadDelay}
                  onInput={(e) =>
                    setSettings({
                      ...settings,
                      downloadDelay: parseInt(
                        (e.target as HTMLInputElement).value
                      )
                    })
                  }
                  class="uyap-flex-1"
                />
                <span class="uyap-text-sm uyap-text-gray-600 uyap-min-w-[60px]">
                  {settings.downloadDelay} ms
                </span>
              </div>
              <p class="uyap-text-xs uyap-text-gray-500 uyap-mt-1">
                WAF koruması için minimum 300ms önerilir
              </p>
            </div>

            {/* Auto retry */}
            <div class="uyap-flex uyap-items-center uyap-justify-between">
              <div>
                <label class="uyap-text-sm uyap-font-medium uyap-text-gray-700">
                  Otomatik Yeniden Deneme
                </label>
                <p class="uyap-text-xs uyap-text-gray-500 uyap-mt-1">
                  Hata durumunda otomatik tekrar dene
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoRetry}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    autoRetry: (e.target as HTMLInputElement).checked
                  })
                }
                class="uyap-h-4 uyap-w-4 uyap-text-blue-600 uyap-rounded"
              />
            </div>

            {/* Keep folder structure */}
            <div class="uyap-flex uyap-items-center uyap-justify-between">
              <div>
                <label class="uyap-text-sm uyap-font-medium uyap-text-gray-700">
                  Klasör Yapısını Koru
                </label>
                <p class="uyap-text-xs uyap-text-gray-500 uyap-mt-1">
                  Evrakları klasör yapısına göre kaydet
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.keepFolderStructure}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    keepFolderStructure: (e.target as HTMLInputElement).checked
                  })
                }
                class="uyap-h-4 uyap-w-4 uyap-text-blue-600 uyap-rounded"
              />
            </div>

            {/* Save button */}
            <Button
              variant="primary"
              onClick={handleSaveSettings}
              fullWidth
            >
              Ayarları Kaydet
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <div class="uyap-bg-blue-50 uyap-rounded-lg uyap-p-4">
          <h3 class="uyap-text-sm uyap-font-semibold uyap-text-blue-900 uyap-mb-2">
            Nasıl Kullanılır?
          </h3>
          <ol class="uyap-text-sm uyap-text-blue-800 uyap-space-y-1 uyap-list-decimal uyap-list-inside">
            <li>Evrakların indirileceği klasörü seçin</li>
            <li>UYAP Vatandaş Portal'a giriş yapın</li>
            <li>Dava dosyanızı açın</li>
            <li>Sağ tarafta açılan panelden evrakları seçin</li>
            <li>İndir butonuna tıklayın</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
