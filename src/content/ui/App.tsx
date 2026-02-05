import { useState } from 'preact/hooks';
import { Fab } from '@components/ui/Fab';
import { Modal } from '@components/ui/Modal';
import { Sidebar } from '@components/layout/Sidebar';
import { evraklar } from '@store';

export function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const hasEvraklar = evraklar.value.length > 0;

  return (
    <>
      {hasEvraklar && !modalOpen && (
        <Fab onClick={() => setModalOpen(true)} />
      )}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Sidebar onClose={() => setModalOpen(false)} />
      </Modal>
    </>
  );
}
