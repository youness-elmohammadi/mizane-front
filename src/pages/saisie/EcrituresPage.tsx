import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useDossier } from '../../hooks/useDossier';
import {
  listerEcritures,
  calculerEquilibreJournal,
} from '../../services/ecritureService';
import { JOURNAUX } from '../../types/ecriture.types';
import type { CodeJournal, Ecriture } from '../../types/ecriture.types';

import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import DossierSwitcher from '../../components/layout/DossierSwitcher';
import ModalEcriture, {
  BandeauEquilibre,
} from '../../components/saisie/ModalEcriture';
import { Chargement, Erreur, Vide } from '../../components/ui/EtatChargement';

import { formatDate } from '../../utils/dateUtils';
import { formatMontantOuTiret } from '../../utils/formatMontant';

/**
 * Journal des écritures du dossier sélectionné.
 *
 * Les totaux débit/crédit affichés en haut sont recalculés à partir des
 * écritures réellement chargées : ils reflètent donc les filtres appliqués
 * et ne peuvent pas mentir.
 */
export default function EcrituresPage() {
  const { dossier, dossierId, exercice, isLoading: dossierEnCours } = useDossier();

  const [journal, setJournal] = useState<CodeJournal | null>(null);
  const [mois, setMois] = useState<string>('');
  const [modaleOuverte, setModaleOuverte] = useState(false);

  const ecritures = useQuery({
    // dossierId / exercice / filtres font partie de la clé : changer l'un
    // déclenche automatiquement un rechargement.
    queryKey: ['ecritures', dossierId, exercice, journal, mois],
    queryFn: () =>
      listerEcritures({
        dossierId: dossierId!,
        exercice,
        journal,
        mois: mois || null,
      }),
    enabled: dossierId !== null,
  });

  if (dossierEnCours) return <Chargement />;
  if (!dossier || !dossierId)
    return (
      <div className="p-6">
        <Vide titre="Aucun dossier sélectionné" />
      </div>
    );

  const liste = ecritures.data ?? [];
  const equilibre = calculerEquilibreJournal(liste);

  return (
    <div className="p-6">
      <PageHeader
        titre="Saisie comptable"
        sousTitre="Journal des écritures"
        actions={<DossierSwitcher />}
      />

      {/* Filtres + équilibre + action */}
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <select
            value={journal ?? ''}
            onChange={(e) =>
              setJournal(e.target.value === '' ? null : (e.target.value as CodeJournal))
            }
            aria-label="Filtrer par journal"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white
                       focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Tous les journaux</option>
            {Object.entries(JOURNAUX).map(([code, nom]) => (
              <option key={code} value={code}>
                {code} — {nom}
              </option>
            ))}
          </select>

          <input
            type="month"
            value={mois}
            onChange={(e) => setMois(e.target.value)}
            aria-label="Filtrer par mois"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white
                       focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {mois && (
            <button
              type="button"
              onClick={() => setMois('')}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Effacer
            </button>
          )}
        </div>

        <Button icone="fa-plus" onClick={() => setModaleOuverte(true)}>
          Nouvelle écriture
        </Button>
      </div>

      <div className="mb-4">
        <BandeauEquilibre
          totalDebit={equilibre.totalDebit}
          totalCredit={equilibre.totalCredit}
          equilibre={equilibre.equilibre || liste.length === 0}
        />
      </div>

      <Card className="overflow-hidden">
        {ecritures.isLoading ? (
          <Chargement />
        ) : ecritures.isError ? (
          <Erreur onReessayer={() => ecritures.refetch()} />
        ) : liste.length === 0 ? (
          <Vide
            icone="fa-pencil"
            titre="Aucune écriture"
            description="Ajustez les filtres ou créez une nouvelle écriture."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-gray-500 text-xs uppercase">
                  <th className="px-4 py-3 text-left font-medium">N° Pièce</th>
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                  <th className="px-4 py-3 text-left font-medium">Libellé</th>
                  <th className="px-4 py-3 text-left font-medium">Compte</th>
                  <th className="px-4 py-3 text-right font-medium">Débit</th>
                  <th className="px-4 py-3 text-right font-medium">Crédit</th>
                  <th className="px-4 py-3 text-center font-medium">Lett.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs">
                {liste.map((ecriture) => (
                  <LignesEcriture key={ecriture.id} ecriture={ecriture} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Montée uniquement à l'ouverture : le formulaire repart toujours vierge. */}
      {modaleOuverte && (
        <ModalEcriture
          ouverte
          onFermer={() => setModaleOuverte(false)}
          dossierId={dossierId}
          exercice={exercice}
        />
      )}
    </div>
  );
}

/**
 * Les lignes d'une même écriture.
 * Seule la première ligne répète le n° de pièce et la date, comme sur un
 * journal papier : les suivantes restent visuellement rattachées.
 */
function LignesEcriture({ ecriture }: { ecriture: Ecriture }) {
  return (
    <>
      {ecriture.lignes.map((ligne, index) => {
        const premiere = index === 0;

        return (
          <tr
            key={ligne.id}
            className={`hover:bg-slate-50 ${premiere ? 'border-t-2 border-gray-100' : ''}`}
          >
            <td className="px-4 py-2.5 font-mono text-gray-500">
              {premiere ? ecriture.numeroPiece : ''}
            </td>
            <td className="px-4 py-2.5 text-gray-500">
              {premiere ? formatDate(ecriture.date) : ''}
            </td>
            <td
              className={`px-4 py-2.5 ${premiere ? 'font-medium text-gray-900' : 'text-gray-500'}`}
            >
              {premiere ? ecriture.libelle : ligne.libelle}
            </td>
            <td className="px-4 py-2.5 text-indigo-600 font-mono">
              {ligne.compte}
            </td>
            <td className="px-4 py-2.5 text-right font-medium tabular">
              {formatMontantOuTiret(ligne.debit)}
            </td>
            <td className="px-4 py-2.5 text-right font-medium tabular">
              {formatMontantOuTiret(ligne.credit)}
            </td>
            <td className="px-4 py-2.5 text-center">
              {ligne.lettrage ? (
                <Badge ton="vert" className="font-mono px-1.5 py-0.5">
                  {ligne.lettrage}
                </Badge>
              ) : (
                <span className="text-gray-300">—</span>
              )}
            </td>
          </tr>
        );
      })}
    </>
  );
}
