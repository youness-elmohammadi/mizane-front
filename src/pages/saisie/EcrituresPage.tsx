import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import type { Ecriture, Journal } from '../../types/ecriture';
import { LIBELLES_JOURNAUX } from '../../types/ecriture';
import { MOCK_ECRITURES } from '../../data/mock-ecritures';
import EcritureTable from '../../components/ecritures/EcritureTable';

const JOURNAUX: Journal[] = ['AC', 'VE', 'BQ', 'CA', 'OD', 'AN'];
const EXERCICES = ['2026', '2025'];

/**
 * Écran de saisie des écritures (S2-F01).
 * Données mockées (jusqu'à S2-F03) mais servies via React Query, pour avoir de
 * vrais états chargement / erreur / vide et un branchement API trivial ensuite.
 */
export default function EcrituresPage() {
  const navigate = useNavigate();
  const [journal, setJournal] = useState<Journal | 'ALL'>('ALL');
  const [exercice, setExercice] = useState('2026');

  const { data, isLoading, isError, refetch } = useQuery<Ecriture[]>({
    queryKey: ['ecritures-mock', exercice],
    queryFn: () =>
      new Promise((resolve) => setTimeout(() => resolve(MOCK_ECRITURES), 500)),
  });

  // Filtre journal + exercice, recalculé en temps réel.
  const ecrituresFiltrees = useMemo<Ecriture[]>(() => {
    return (data ?? [])
      .filter((e) => journal === 'ALL' || e.journal === journal)
      .filter((e) => e.dateEcriture.startsWith(exercice));
  }, [data, journal, exercice]);

  return (
    <div className="p-6">
      {/* En-tête + actions */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Saisie des écritures</h1>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              navigate('/saisie/nouvelle', {
                state: { journal: journal === 'ALL' ? 'AC' : journal, exercice },
              })
            }
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg
                       text-sm font-medium flex items-center gap-2"
          >
            <i className="fa-solid fa-plus" aria-hidden="true" /> Nouvelle écriture
          </button>
          <button
            type="button"
            className="border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2
                       rounded-lg text-sm font-medium"
          >
            Exporter FEC
          </button>
        </div>
      </div>

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
          value={exercice}
          onChange={(e) => setExercice(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white
                     focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {EXERCICES.map((ex) => (
            <option key={ex} value={ex}>
              {ex}
            </option>
          ))}
        </select>
      </div>

      {/* États : erreur → vide → tableau */}
      {isError ? (
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
            onClick={() => refetch()}
            className="text-indigo-600 font-medium text-sm"
          >
            Réessayer
          </button>
        </div>
      ) : !isLoading && ecrituresFiltrees.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <p className="text-gray-600 mb-3">Aucune écriture dans ce journal.</p>
          <button type="button" className="text-indigo-600 font-medium text-sm">
            + Créer la première écriture
          </button>
        </div>
      ) : (
        <EcritureTable
          ecritures={ecrituresFiltrees}
          loading={isLoading}
          onContrepasser={(id) => console.log('contrepasser', id)}
        />
      )}
    </div>
  );
}
