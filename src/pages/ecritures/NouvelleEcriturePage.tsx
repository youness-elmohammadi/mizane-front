import { useLocation, useNavigate } from 'react-router-dom';

import type { Journal } from '../../types/ecriture';
import { LIBELLES_JOURNAUX } from '../../types/ecriture';

/**
 * Page « Nouvelle écriture » (S2-F02).
 *
 * SQUELETTE (étape 0) : la route est branchée et le contexte journal/exercice
 * est lu depuis l'état de navigation. Le formulaire (EcritureForm) et
 * l'autocomplétion seront ajoutés aux étapes 1 à 3.
 */
export default function NouvelleEcriturePage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Contexte transmis par le bouton « Nouvelle écriture » de la liste.
  const state = location.state as { journal?: Journal; exercice?: string } | null;
  const journal: Journal = state?.journal ?? 'AC';
  const exercice = state?.exercice ?? '2026';

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Nouvelle écriture — Journal {LIBELLES_JOURNAUX[journal]} — Ex. {exercice}
      </h1>

      <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-gray-500">
        <p className="mb-4">
          Formulaire de saisie à venir (étapes 1 à 3 du ticket S2-F02).
        </p>
        <button
          type="button"
          onClick={() => navigate('/saisie')}
          className="border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2
                     rounded-lg text-sm font-medium"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
