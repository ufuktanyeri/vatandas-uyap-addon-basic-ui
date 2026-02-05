import { sidebarVisible } from '@shared/signals';
import { Sidebar } from './Sidebar';

export function App() {
  if (!sidebarVisible.value) {
    return null;
  }

  return <Sidebar onClose={() => { sidebarVisible.value = false; }} />;
}
