import { Outlet } from 'react-router-dom';

import Sidebar from './Sidebar';
import ChatPanel from '../agent/ChatPanel';
import ChatFloatingButton from '../agent/ChatFloatingButton';

/**
 * Ossature de l'application : barre latérale fixe, contenu défilant,
 * et panneau de l'agent IA en surimpression.
 *
 * `<Outlet />` est l'emplacement où React Router injecte la page
 * correspondant à l'URL courante.
 */
export default function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 text-gray-800">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      {/* Assistant IA : disponible sur toutes les pages authentifiées. */}
      <ChatPanel />
      <ChatFloatingButton />
    </div>
  );
}
