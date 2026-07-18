/**
 * Chargement des dossiers + gestion de la sélection courante.
 *
 * React Query s'occupe du cache et des états de chargement ; le store Zustand
 * ne retient que la sélection. Les deux responsabilités restent séparées :
 * données serveur d'un côté, état d'interface de l'autre.
 */

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useDossierStore } from '../store/dossierStore';
import { listerDossiers } from '../services/dossierService';
import { EXERCICES } from '../data/mock-dossiers';

/** Clés de cache React Query, centralisées pour éviter les fautes de frappe. */
export const CLES_DOSSIERS = {
  liste: ['dossiers'] as const,
};

export function useDossiers() {
  return useQuery({
    queryKey: CLES_DOSSIERS.liste,
    queryFn: listerDossiers,
  });
}

/**
 * Dossier actuellement sélectionné.
 * Si aucun n'est choisi (première visite), on sélectionne automatiquement
 * le premier de la liste pour que les pages comptables aient toujours
 * un contexte valide.
 */
export function useDossier() {
  const { data: dossiers, isLoading, isError } = useDossiers();

  const dossierCourant = useDossierStore((state) => state.dossierCourant);
  const exerciceCourant = useDossierStore((state) => state.exerciceCourant);
  const setDossier = useDossierStore((state) => state.setDossier);
  const setExercice = useDossierStore((state) => state.setExercice);

  // Auto-sélection du premier dossier disponible.
  useEffect(() => {
    if (!dossiers || dossiers.length === 0) return;
    if (dossierCourant && dossiers.some((d) => d.id === dossierCourant.id)) {
      return;
    }
    setDossier(dossiers[0]);
  }, [dossiers, dossierCourant, setDossier]);

  return {
    dossiers: dossiers ?? [],
    dossier: dossierCourant,
    dossierId: dossierCourant?.id ?? null,
    /** Chaîne, telle que stockée ('2025'). */
    exerciceCourant,
    /** Nombre, pour les appels de service et les calculs. */
    exercice: Number(exerciceCourant),
    exercicesDisponibles: EXERCICES,
    setDossier,
    setExercice,
    isLoading,
    isError,
  };
}
