import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Journal } from '../../types/ecriture';
import { LIBELLES_JOURNAUX } from '../../types/ecriture';
import EcritureForm from '../../components/ecritures/EcritureForm';
import { useDossier } from '../../hooks/useDossier';
import {
  creerEcriture,
  listerExercices,
  type NouvelleEcriturePayload,
} from '../../services/ecrituresApi';

/** "1 200,50" → 1200.5 ; "" → 0. Mêmes règles que la saisie du formulaire. */
function parseMontant(saisie: string): number {
  const n = Number(saisie.replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

/**
 * Page « Nouvelle écriture » (S2-F02/F03).
 *
 * Le formulaire ne connaît que des chaînes de saisie ; c'est ici qu'on les
 * traduit en payload API. Les montants restent en DIRHAMS — le backend attend
 * des décimaux (colonne DECIMAL(15,2)), il n'y a aucune conversion à faire.
 */
export default function NouvelleEcriturePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { dossierId } = useDossier();

  const state = location.state as { journal?: Journal; exercice?: string } | null;
  const journal: Journal = state?.journal ?? 'AC';
  const exercice = state?.exercice ?? String(new Date().getFullYear());

  const [erreur, setErreur] = useState<string | null>(null);

  // La création exige un exerciceId (UUID) : une année ne suffit pas, car deux
  // dossiers peuvent avoir un exercice 2026 distinct.
  const exercices = useQuery({
    queryKey: ['exercices', dossierId],
    queryFn: () => listerExercices(dossierId!),
    enabled: dossierId !== null,
  });

  const creation = useMutation({
    mutationFn: (payload: NouvelleEcriturePayload) =>
      creerEcriture(dossierId!, payload),
    onSuccess: () => {
      // Le journal doit refléter la nouvelle écriture au retour sur la liste.
      queryClient.invalidateQueries({ queryKey: ['ecritures'] });
      navigate('/saisie');
    },
    onError: (e: unknown) => {
      // Le backend renvoie ses refus métier (RM-01 déséquilibre, RM-04 compte
      // inconnu…) dans `error`. Les afficher tels quels est plus utile qu'un
      // message générique : ils sont déjà rédigés pour un comptable.
      const message =
        (e as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        "L'écriture n'a pas pu être enregistrée.";
      setErreur(message);
    },
  });

  const exerciceCourant =
    exercices.data?.find((e) => String(e.annee) === exercice) ??
    exercices.data?.find((e) => e.statut === 'OUVERT');

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Nouvelle écriture — Journal {LIBELLES_JOURNAUX[journal]} — Ex. {exercice}
      </h1>

      {erreur && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erreur}
        </div>
      )}

      {exercices.isLoading ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-gray-500">
          Chargement des exercices…
        </div>
      ) : !exerciceCourant ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-gray-600">
          Aucun exercice ouvert sur ce dossier : la saisie est impossible.
        </div>
      ) : (
        <EcritureForm
          journal={journal}
          exercice={exercice}
          onAnnuler={() => navigate('/saisie')}
          onValider={({ date, libelle, lignes }) => {
            setErreur(null);
            creation.mutate({
              exerciceId: exerciceCourant.id,
              journal,
              dateEcriture: date,
              libelle,
              lignes: lignes
                // Une ligne sans compte est une ligne que l'utilisateur a
                // ajoutée puis laissée vide : on ne l'envoie pas.
                .filter((l) => l.compteNum.trim() !== '')
                .map((l) => ({
                  compteNum: l.compteNum.trim(),
                  libelle: l.libelle || l.compteLib,
                  debit: parseMontant(l.debit),
                  credit: parseMontant(l.credit),
                })),
            });
          }}
        />
      )}

      {creation.isPending && (
        <p className="mt-3 text-sm text-gray-500">Enregistrement en cours…</p>
      )}
    </div>
  );
}
