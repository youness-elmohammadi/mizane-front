import { useAgent } from '../../hooks/useAgent';

/**
 * Bouton flottant (FAB) d'ouverture de l'assistant — ticket S1-F07.
 *
 * Rond, indigo-600, w-14 h-14, ancré en bas à droite. Il s'efface quand le
 * panneau est ouvert pour ne pas chevaucher le bouton de fermeture.
 */
export default function ChatFloatingButton() {
  const { ouvert, basculer } = useAgent();

  if (ouvert) return null;

  return (
    <button
      type="button"
      onClick={basculer}
      aria-label="Ouvrir l'assistant Mizan IA"
      className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-700
                 text-white rounded-full shadow-lg flex items-center justify-center
                 z-30 transition-colors focus:outline-none focus-visible:ring-2
                 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
    >
      <i className="fa-solid fa-robot text-xl" aria-hidden="true" />
    </button>
  );
}
