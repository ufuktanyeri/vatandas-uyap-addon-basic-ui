import { useState } from 'preact/hooks';
import { Fab } from '@components/ui/Fab';
import { Modal } from '@components/ui/Modal';
import { Sidebar } from '@components/layout/Sidebar';

export function App() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Fab onClick={() => setModalOpen(true)} />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Sidebar onClose={() => setModalOpen(false)} />
      </Modal>
    </>
  );
}
