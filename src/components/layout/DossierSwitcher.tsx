import { useEffect, useMemo, useRef, useState } from 'react';

import { useDossier } from '../../hooks/useDossier';
import type { Dossier } from '../../types/dossier.types';

/**
 * Sélecteurs « dossier » et « exercice » (ticket S1-F05).
 *
 * Le sélecteur de dossier est un dropdown SUR MESURE et non un <select> natif :
 * le ticket impose un champ de recherche interne et une coche sur l'élément
 * sélectionné, deux choses qu'un <select> ne permet pas.
 *
 * Le filtrage est purement local (aucun appel API) : la liste des dossiers est
 * déjà en cache React Query.
 *
 * Le sélecteur d'exercice reste un <select> natif — le ticket demande
 * explicitement un « dropdown simple ».
 */

interface DossierSwitcherProps {
  /** Masque le sélecteur de dossier (page déjà rattachée à un dossier). */
  sansDossier?: boolean;
  /** Masque le sélecteur d'exercice. */
  sansExercice?: boolean;
}

export default function DossierSwitcher({
  sansDossier = false,
  sansExercice = false,
}: DossierSwitcherProps) {
  const {
    dossiers,
    dossier,
    exerciceCourant,
    exercicesDisponibles,
    setDossier,
    setExercice,
  } = useDossier();

  return (
    <>
      {!sansDossier && (
        <SelecteurDossier
          dossiers={dossiers}
          selectionne={dossier}
          onSelectionner={setDossier}
        />
      )}

      {!sansExercice && (
        <select
          value={exerciceCourant}
          onChange={(e) => setExercice(e.target.value)}
          aria-label="Exercice"
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700
                     bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {exercicesDisponibles.map((annee) => (
            <option key={annee} value={annee}>
              {annee}
            </option>
          ))}
        </select>
      )}
    </>
  );
}

interface SelecteurDossierProps {
  dossiers: Dossier[];
  selectionne: Dossier | null;
  onSelectionner: (dossier: Dossier) => void;
}

/** Seuil au-delà duquel il faudra virtualiser la liste (optionnel en V1). */
const SEUIL_VIRTUALISATION = 30;

function SelecteurDossier({
  dossiers,
  selectionne,
  onSelectionner,
}: SelecteurDossierProps) {
  const [ouvert, setOuvert] = useState(false);
  const [recherche, setRecherche] = useState('');

  const conteneurRef = useRef<HTMLDivElement>(null);
  const champRechercheRef = useRef<HTMLInputElement>(null);

  /** Filtrage en temps réel, sans appel réseau. */
  const resultats = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    if (q === '') return dossiers;

    return dossiers.filter(
      (d) =>
        d.raisonSociale.toLowerCase().includes(q) ||
        d.responsableNom.toLowerCase().includes(q) ||
        (d.ice?.includes(q) ?? false)
    );
  }, [dossiers, recherche]);

  // Fermeture au clic extérieur et à la touche Échap.
  useEffect(() => {
    if (!ouvert) return;

    const surClicExterieur = (e: MouseEvent) => {
      if (!conteneurRef.current?.contains(e.target as Node)) {
        setOuvert(false);
      }
    };
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOuvert(false);
    };

    document.addEventListener('mousedown', surClicExterieur);
    document.addEventListener('keydown', surTouche);

    return () => {
      document.removeEventListener('mousedown', surClicExterieur);
      document.removeEventListener('keydown', surTouche);
    };
  }, [ouvert]);

  // Focus automatique sur le champ de recherche à l'ouverture.
  useEffect(() => {
    if (ouvert) champRechercheRef.current?.focus();
  }, [ouvert]);

  /*
   * Le filtre est remis à zéro à l'OUVERTURE et non à la fermeture : cela
   * évite un setState dans un effet (rendu en cascade) tout en garantissant
   * que le dropdown s'ouvre toujours sur la liste complète.
   */
  const basculer = () => {
    if (!ouvert) setRecherche('');
    setOuvert(!ouvert);
  };

  const choisir = (d: Dossier) => {
    onSelectionner(d);
    setOuvert(false);
  };

  return (
    <div ref={conteneurRef} className="relative">
      {/* Déclencheur */}
      <button
        type="button"
        onClick={basculer}
        aria-haspopup="listbox"
        aria-expanded={ouvert}
        className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2
                   text-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors
                   focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[220px]"
      >
        <span className="flex-1 text-left truncate">
          {selectionne?.raisonSociale ?? 'Sélectionner un dossier'}
        </span>
        <i
          className={`fa-solid fa-chevron-down text-xs text-gray-400 transition-transform
                      ${ouvert ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {/* Panneau */}
      {ouvert && (
        <div
          className="absolute right-0 z-30 mt-1 w-80 bg-white border border-gray-200
                     rounded-lg shadow-lg overflow-hidden"
        >
          {/* Recherche */}
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <i
                className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2
                           text-gray-400 text-xs"
                aria-hidden="true"
              />
              <input
                ref={champRechercheRef}
                type="text"
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                placeholder="Rechercher..."
                aria-label="Rechercher un dossier"
                className="w-full border border-gray-200 rounded-md pl-8 pr-3 py-1.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Résultats */}
          <ul role="listbox" className="max-h-64 overflow-y-auto py-1">
            {resultats.length === 0 ? (
              <li className="px-3 py-4 text-center text-sm text-gray-400">
                Aucun dossier trouvé
              </li>
            ) : (
              resultats.map((d) => {
                const estSelectionne = d.id === selectionne?.id;

                return (
                  <li key={d.id} role="option" aria-selected={estSelectionne}>
                    <button
                      type="button"
                      onClick={() => choisir(d)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left
                                  transition-colors
                                  ${
                                    estSelectionne
                                      ? 'bg-indigo-50 text-indigo-700 font-medium'
                                      : 'text-gray-700 hover:bg-gray-50'
                                  }`}
                    >
                      <span className="w-4 flex-shrink-0 text-indigo-600">
                        {estSelectionne && (
                          <i className="fa-solid fa-check text-xs" aria-hidden="true" />
                        )}
                      </span>
                      <span className="truncate">{d.raisonSociale}</span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>

          {/*
            V1 : la liste tient en mémoire (≤ 30 dossiers). Au-delà, il faudra
            virtualiser (react-window) pour ne pas monter des centaines de <li>.
          */}
          {resultats.length > SEUIL_VIRTUALISATION && (
            <p className="px-3 py-2 text-xs text-gray-400 border-t border-gray-100">
              {resultats.length} résultats — virtualisation à prévoir
            </p>
          )}
        </div>
      )}
    </div>
  );
}
