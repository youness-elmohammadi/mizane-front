import { useQuery } from '@tanstack/react-query';

import { useDossier } from '../../hooks/useDossier';
import { obtenirBilan, bilanEstEquilibre } from '../../services/etatsService';
import type { Bilan, MasseEtat } from '../../types/etats.types';

import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import DossierSwitcher from '../../components/layout/DossierSwitcher';
import { Chargement, Erreur, Vide } from '../../components/ui/EtatChargement';

import { formatMontant, formatMontantAvecDevise } from '../../utils/formatMontant';
import { formatDate } from '../../utils/dateUtils';

/**
 * Bilan : Actif et Passif côte à côte, avec comparatif N-1.
 *
 * Le bandeau du haut vérifie l'égalité Total Actif = Total Passif. C'est le
 * contrôle de cohérence fondamental d'un bilan : s'il échoue, l'information
 * est affichée en rouge plutôt que masquée.
 */
export default function BilanPage() {
  const { dossier, dossierId, exercice, isLoading: dossierEnCours } = useDossier();

  const bilan = useQuery({
    queryKey: ['bilan', dossierId, exercice],
    queryFn: () => obtenirBilan(dossierId!, exercice),
    enabled: dossierId !== null,
  });

  if (dossierEnCours || bilan.isLoading) return <Chargement />;
  if (!dossier)
    return (
      <div className="p-6">
        <Vide titre="Aucun dossier sélectionné" />
      </div>
    );
  if (bilan.isError || !bilan.data)
    return <Erreur onReessayer={() => bilan.refetch()} />;

  const donnees = bilan.data;
  const equilibre = bilanEstEquilibre(donnees);

  return (
    <div className="p-6">
      <PageHeader
        titre="Bilan"
        sousTitre={`${dossier.raisonSociale} — au ${formatDate(donnees.dateCloture)}`}
        actions={
          <>
            <DossierSwitcher sansDossier />
            <Button variante="secondaire" icone="fa-file-excel">
              Excel
            </Button>
            <Button variante="danger" icone="fa-file-pdf">
              PDF
            </Button>
          </>
        }
      />

      {/* Contrôle d'équilibre */}
      <div className="mb-4">
        {equilibre ? (
          <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium">
            <i className="fa-solid fa-circle-check" aria-hidden="true" />
            Bilan équilibré — Total Actif = Total Passif ={' '}
            {formatMontantAvecDevise(donnees.totalActifN)}
          </span>
        ) : (
          <span className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1.5 rounded-full text-sm font-medium">
            <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
            Bilan déséquilibré — écart de{' '}
            {formatMontantAvecDevise(
              Math.abs(donnees.totalActifN - donnees.totalPassifN)
            )}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ColonneBilan
          titre="ACTIF"
          couleurEntete="bg-blue-50 text-blue-900"
          masses={donnees.actif}
          totalN={donnees.totalActifN}
          totalN1={donnees.totalActifN1}
          libelleTotal="TOTAL ACTIF"
          exercice={donnees.exercice}
        />
        <ColonneBilan
          titre="PASSIF"
          couleurEntete="bg-purple-50 text-purple-900"
          masses={donnees.passif}
          totalN={donnees.totalPassifN}
          totalN1={donnees.totalPassifN1}
          libelleTotal="TOTAL PASSIF"
          exercice={donnees.exercice}
        />
      </div>
    </div>
  );
}

interface ColonneBilanProps {
  titre: string;
  couleurEntete: string;
  masses: MasseEtat[];
  totalN: number;
  totalN1: number;
  libelleTotal: string;
  exercice: Bilan['exercice'];
}

function ColonneBilan({
  titre,
  couleurEntete,
  masses,
  totalN,
  totalN1,
  libelleTotal,
  exercice,
}: ColonneBilanProps) {
  return (
    <Card className="overflow-hidden">
      <div className={`px-5 py-4 border-b border-gray-100 ${couleurEntete}`}>
        <h2 className="font-bold">{titre}</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-gray-500 text-xs uppercase">
              <th className="px-5 py-2 text-left font-medium">Rubrique</th>
              <th className="px-4 py-2 text-right font-medium">{exercice}</th>
              <th className="px-4 py-2 text-right font-medium">{exercice - 1}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {masses.map((masse) => (
              <MasseLignes key={masse.titre} masse={masse} />
            ))}

            <tr className="bg-indigo-50 border-t-2 border-indigo-200">
              <td className="px-5 py-3 font-bold text-indigo-900">
                {libelleTotal}
              </td>
              <td className="px-4 py-3 text-right font-bold text-indigo-900 tabular">
                {formatMontant(totalN)}
              </td>
              <td className="px-4 py-3 text-right font-bold text-gray-500 tabular">
                {formatMontant(totalN1)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function MasseLignes({ masse }: { masse: MasseEtat }) {
  return (
    <>
      <tr className="bg-gray-50">
        <td
          colSpan={3}
          className="px-5 py-2 text-xs font-bold text-gray-600 uppercase tracking-wider"
        >
          {masse.titre}
        </td>
      </tr>

      {masse.rubriques.map((rubrique) => (
        <tr key={rubrique.libelle} className="hover:bg-slate-50">
          <td
            className={`px-5 py-2.5 ${rubrique.total ? 'font-semibold' : ''}`}
          >
            {rubrique.libelle}
          </td>
          <td
            className={`px-4 py-2.5 text-right tabular ${
              rubrique.total ? 'font-bold' : 'font-mono'
            }`}
          >
            {formatMontant(rubrique.montantN)}
          </td>
          <td className="px-4 py-2.5 text-right font-mono text-gray-400 tabular">
            {formatMontant(rubrique.montantN1)}
          </td>
        </tr>
      ))}
    </>
  );
}
