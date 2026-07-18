import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import type { Dossier } from '../types/dossier.types';
import { EXERCICE_DEFAUT } from '../data/mock-dossiers';

/**
 * Dossier et exercice couramment sélectionnés (ticket S1-F05).
 *
 * C'est un état GLOBAL et non un paramètre d'URL parce qu'il est partagé par
 * toutes les pages comptables : on passe de la Saisie au Bilan au CPC sans
 * jamais reperdre le contexte.
 *
 * Persisté en sessionStorage : « le dossier sélectionné persiste pendant toute
 * la session » — il survit donc à un rechargement de page, mais pas à la
 * fermeture de l'onglet ni à une déconnexion (voir useAuth.deconnexion).
 */
interface DossierState {
  dossierCourant: Dossier | null;
  /** '2025' | '2024' — chaîne, conformément au ticket. */
  exerciceCourant: string;
  setDossier: (dossier: Dossier) => void;
  setExercice: (annee: string) => void;
  reinitialiser: () => void;
}

export const useDossierStore = create<DossierState>()(
  persist(
    (set) => ({
      dossierCourant: null,
      exerciceCourant: EXERCICE_DEFAUT,
      setDossier: (dossier) => set({ dossierCourant: dossier }),
      setExercice: (annee) => set({ exerciceCourant: annee }),
      reinitialiser: () =>
        set({ dossierCourant: null, exerciceCourant: EXERCICE_DEFAUT }),
    }),
    {
      name: 'mizan-dossier',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
