import { useQuery } from '@tanstack/react-query';

import { useDossier } from '../../hooks/useDossier';
import { obtenirCpc } from '../../services/etatsService';
import type { LigneCpc } from '../../types/etats.types';

import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import DossierSwitcher from '../../components/layout/DossierSwitcher';
import { Chargement, Erreur, Vide } from '../../components/ui/EtatChargement';
import GraphiqueCpc from '../../components/charts/GraphiqueCpc';

import {
  formatMontant,
  formatMontantCourt,
  calculerVariation,
  formatVariation,
} from '../../utils/formatMontant';

/**
 * CPC — Compte de Produits et Charges.
 * Lecture en cascade : exploitation → financier → courant → net.
 */
export default function CpcPage() {
  const { dossier, dossierId, exercice, isLoading: dossierEnCours } = useDossier();

  const cpc = useQuery({
    queryKey: ['cpc', dossierId, exercice],
    queryFn: () => obtenirCpc(dossierId!, exercice),
    enabled: dossierId !== null,
  });

  if (dossierEnCours || cpc.isLoading) return <Chargement />;
  if (!dossier)
    return (
      <div className="p-6">
        <Vide titre="Aucun dossier sélectionné" />
      </div>
    );
  if (cpc.isError || !cpc.data)
    return <Erreur onReessayer={() => cpc.refetch()} />;

  const donnees = cpc.data;

  return (
    <div className="p-6">
      <PageHeader
        titre="CPC — Compte de Produits et Charges"
        sousTitre={`${dossier.raisonSociale} — Exercice ${donnees.exercice}`}
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

      {/* Trois agrégats clés */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <CarteAgregat
          libelle="Chiffre d'affaires"
          montantN={donnees.chiffreAffairesN}
          montantN1={donnees.chiffreAffairesN1}
          exerciceN1={donnees.exercice - 1}
        />
        <CarteAgregat
          libelle="Résultat d'exploitation"
          montantN={donnees.resultatExploitationN}
          montantN1={donnees.resultatExploitationN1}
          exerciceN1={donnees.exercice - 1}
        />
        <CarteAgregat
          libelle="Résultat net"
          montantN={donnees.resultatNetN}
          montantN1={donnees.resultatNetN1}
          exerciceN1={donnees.exercice - 1}
          accentue
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-gray-500 text-xs uppercase">
                  <th className="px-5 py-3 text-left font-medium">Rubrique</th>
                  <th className="px-4 py-3 text-right font-medium">
                    {donnees.exercice}
                  </th>
                  <th className="px-4 py-3 text-right font-medium">
                    {donnees.exercice - 1}
                  </th>
                  <th className="px-4 py-3 text-right font-medium">Var.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {donnees.lignes.map((ligne) => (
                  <LigneTableauCpc key={ligne.libelle} ligne={ligne} />
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold text-gray-900 mb-4">
            Comparatif N vs N-1
          </h3>
          <div className="h-[280px]">
            <GraphiqueCpc cpc={donnees} />
          </div>
        </Card>
      </div>
    </div>
  );
}

interface CarteAgregatProps {
  libelle: string;
  montantN: number;
  montantN1: number;
  exerciceN1: number;
  accentue?: boolean;
}

function CarteAgregat({
  libelle,
  montantN,
  montantN1,
  exerciceN1,
  accentue = false,
}: CarteAgregatProps) {
  const variation = calculerVariation(montantN, montantN1);
  const enHausse = variation !== null && variation >= 0;

  return (
    <Card className="p-5">
      <p className="text-gray-500 text-sm mb-1">{libelle}</p>
      <p
        className={`text-2xl font-bold tabular ${accentue ? 'text-green-600' : 'text-gray-900'}`}
      >
        {formatMontantCourt(montantN)}{' '}
        <span className="text-sm text-gray-400 font-normal">MAD</span>
      </p>
      <p
        className={`text-xs mt-1 ${enHausse ? 'text-green-600' : 'text-red-500'}`}
      >
        <i
          className={`fa-solid ${enHausse ? 'fa-arrow-up' : 'fa-arrow-down'}`}
          aria-hidden="true"
        />{' '}
        {formatVariation(variation)} vs {exerciceN1}
      </p>
    </Card>
  );
}

/** Styles par type de ligne, repris du prototype. */
const STYLES_LIGNE = {
  normale: { tr: 'hover:bg-slate-50', libelle: 'text-gray-600', montant: 'font-mono' },
  soustotal: { tr: 'bg-gray-100', libelle: 'font-bold', montant: 'font-bold' },
  courant: {
    tr: 'bg-indigo-50',
    libelle: 'font-bold text-indigo-900',
    montant: 'font-bold text-indigo-900',
  },
  net: {
    tr: 'border-t-2 border-green-300 bg-green-50',
    libelle: 'font-bold text-green-900 text-base',
    montant: 'font-bold text-green-700 text-base',
  },
  section: { tr: '', libelle: '', montant: '' },
} as const;

function LigneTableauCpc({ ligne }: { ligne: LigneCpc }) {
  // Les en-têtes de section occupent toute la largeur.
  if (ligne.style === 'section') {
    const couleur =
      ligne.accent === 'violet'
        ? 'bg-purple-50 text-purple-800'
        : 'bg-blue-50 text-blue-800';

    return (
      <tr className={couleur}>
        <td colSpan={4} className="px-5 py-2 text-xs font-bold">
          {ligne.libelle}
        </td>
      </tr>
    );
  }

  const styles = STYLES_LIGNE[ligne.style];
  const variation = calculerVariation(ligne.montantN, ligne.montantN1);

  // Une hausse est favorable pour un produit, défavorable pour une charge.
  // On se contente ici d'un code couleur sur le signe de la variation.
  const couleurVariation =
    variation === null
      ? 'text-gray-400'
      : variation >= 0
        ? 'text-green-600'
        : 'text-red-500';

  const padding = ligne.style === 'net' || ligne.style === 'courant' ? 'py-3' : 'py-2.5';

  return (
    <tr className={styles.tr}>
      <td className={`px-5 ${padding} ${styles.libelle}`}>{ligne.libelle}</td>
      <td className={`px-4 ${padding} text-right tabular ${styles.montant}`}>
        {formatMontant(ligne.montantN)}
      </td>
      <td className={`px-4 ${padding} text-right font-mono text-gray-400 tabular`}>
        {formatMontant(ligne.montantN1)}
      </td>
      <td
        className={`px-4 ${padding} text-right font-medium ${couleurVariation}`}
      >
        {formatVariation(variation)}
      </td>
    </tr>
  );
}
