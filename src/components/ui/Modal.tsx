import { useEffect } from 'react';
import type { ReactNode } from 'react';

/**
 * Fenêtre modale.
 *
 * Le prototype se contentait d'ajouter une classe CSS. Ici on ajoute ce
 * qu'une vraie modale doit faire : fermeture à la touche Échap, clic sur le
 * fond, et blocage du défilement de la page en arrière-plan.
 */

interface ModalProps {
  ouverte: boolean;
  titre: string;
  onFermer: () => void;
  children: ReactNode;
  /** Barre d'actions collée en bas. */
  pied?: ReactNode;
  /** Largeur maximale, ex. « max-w-3xl ». */
  largeur?: string;
}

export default function Modal({
  ouverte,
  titre,
  onFermer,
  children,
  pied,
  largeur = 'max-w-3xl',
}: ModalProps) {
  // Échap ferme la modale, et on bloque le scroll du body pendant l'ouverture.
  useEffect(() => {
    if (!ouverte) return;

    const surTouche = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFermer();
    };

    document.addEventListener('keydown', surTouche);
    const overflowInitial = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', surTouche);
      document.body.style.overflow = overflowInitial;
    };
  }, [ouverte, onFermer]);

  if (!ouverte) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onFermer}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titre}
        // Empêche la fermeture quand on clique DANS la modale.
        onClick={(e) => e.stopPropagation()}
        className={`bg-white rounded-2xl w-full ${largeur} max-h-[90vh] flex flex-col shadow-2xl`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="font-bold text-gray-900">{titre}</h2>
          <button
            type="button"
            onClick={onFermer}
            aria-label="Fermer"
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i className="fa-solid fa-xmark text-lg" aria-hidden="true" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1">{children}</div>

        {pied && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
            {pied}
          </div>
        )}
      </div>
    </div>
  );
}
