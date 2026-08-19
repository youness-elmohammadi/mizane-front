import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Ecriture, Journal } from '../../types/ecriture';
import { LIBELLES_JOURNAUX } from '../../types/ecriture';
import EcritureTable from '../../components/ecritures/EcritureTable';
import { useDossier } from '../../hooks/useDossier';
import {
  contrepasser,
  listerEcritures,
  listerExercices,
} from '../../services/ecrituresApi';

const JOURNAUX: Journal[] = ['AC', 'VE', 'BQ', 'CA', 'OD', 'AN'];

/**
 * Écran de saisie des écritures (S2-F01).
 *
 * Les écritures viennent du backend, filtrées côté serveur par dossier et
 * exercice (le scope cabinet est déduit du token). Le filtre journal est
 * appliqué côté serveur lui aussi : c'est lui qui porte l'index SQL.
 */
export default function EcrituresPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { dossierId } = useDossier();

  const [journal, setJournal] = useState<Journal | 'ALL'>('ALL');
  const [exerciceId, setExerciceId] = useState<string | undefined>(undefined);
  const [erreur, setErreur] = useState<string | null>(null);

  const exercices = useQuery({
    queryKey: ['exercices', dossierId],
    queryFn: () => listerExercices(dossierId!),
    enabled: dossierId !== null,
  });

  // Sans sélection explicite, le backend prend l'exercice ouvert le plus récent.
  const exerciceActif =
    exercices.data?.find((e) => e.id === exerciceId) ??
    exercices.data?.find((e) => e.statut === 'OUVERT') ??
    exercices.data?.[0];

  const ecritures = useQuery<Ecriture[]>({
    queryKey: ['ecritures', dossierId, journal, exerciceActif?.id],
    queryFn: () =>
      listerEcritures(
        dossierId!,
        journal === 'ALL' ? undefined : journal,
        exerciceActif?.id
      ),
    enabled: dossierId !== null,
  });

  const contrepassation = useMutation({
    mutationFn: (ecritureId: string) => contrepasser(dossierId!, ecritureId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ecritures'] });
    },
    onError: (e: unknown) => {
      const message =
        (e as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'La contre-passation a échoué.';
      setErreur(message);
    },
  });

  const liste = useMemo(() => ecritures.data ?? [], [ecritures.data]);

  const exerciceAffiche = exerciceActif
    ? String(exerciceActif.annee)
    : String(new Date().getFullYear());

  return (
    <div className="p-6">
      {/* En-tête + actions */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Saisie des écritures</h1>
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={exerciceActif?.statut === 'CLOTURE'}
            onClick={() =>
              navigate('/saisie/nouvelle', {
                state: {
                  journal: journal === 'ALL' ? 'AC' : journal,
                  exercice: exerciceAffiche,
                },
              })
            }
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg
                       text-sm font-medium flex items-center gap-2
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="fa-solid fa-plus" aria-hidden="true" /> Nouvelle écriture
          </button>
        </div>
      </div>

      {erreur && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erreur}
        </div>
      )}

      {/* Filtres */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <label htmlFor="filtre-journal" className="text-sm text-gray-600">
          Journal :
        </label>
        <select
          id="filtre-journal"
          value={journal}
          onChange={(e) => setJournal(e.target.value as Journal | 'ALL')}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white
                     focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="ALL">Tous les journaux</option>
          {JOURNAUX.map((j) => (
            <option key={j} value={j}>
              {j} — {LIBELLES_JOURNAUX[j]}
            </option>
          ))}
        </select>

        <label htmlFor="filtre-exercice" className="text-sm text-gray-600 ml-2">
          Exercice :
        </label>
        <select
          id="filtre-exercice"
          value={exerciceActif?.id ?? ''}
          onChange={(e) => setExerciceId(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white
                     focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {(exercices.data ?? []).map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.annee}
              {ex.statut === 'CLOTURE' ? ' (clôturé)' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* États : erreur → vide → tableau */}
      {ecritures.isError ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <p className="text-gray-600 mb-3">
            <i
              className="fa-solid fa-triangle-exclamation text-red-400 mr-2"
              aria-hidden="true"
            />
            Impossible de charger les écritures.
          </p>
          <button
            type="button"
            onClick={() => ecritures.refetch()}
            className="text-indigo-600 font-medium text-sm"
          >
            Réessayer
          </button>
        </div>
      ) : !ecritures.isLoading && liste.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <p className="text-gray-600 mb-3">Aucune écriture dans ce journal.</p>
          <button
            type="button"
            onClick={() =>
              navigate('/saisie/nouvelle', {
                state: {
                  journal: journal === 'ALL' ? 'AC' : journal,
                  exercice: exerciceAffiche,
                },
              })
            }
            className="text-indigo-600 font-medium text-sm"
          >
            + Créer la première écriture
          </button>
        </div>
      ) : (
        <EcritureTable
          ecritures={liste}
          loading={ecritures.isLoading}
          onContrepasser={(id) => {
            setErreur(null);
            contrepassation.mutate(id);
          }}
        />
      )}
    </div>
  );
}
