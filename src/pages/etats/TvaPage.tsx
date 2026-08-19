import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useDossier } from '../../hooks/useDossier';
import { obtenirDeclarationTva } from '../../services/etatsService';
import { formatMontantAvecDevise, formatMontantOuTiret } from '../../utils/formatMontant';
import { formatDateLongue } from '../../utils/dateUtils';

import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import DossierSwitcher from '../../components/layout/DossierSwitcher';
import { Chargement, Erreur } from '../../components/ui/EtatChargement';

const MOIS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

/**
 * Déclaration de TVA.
 *
 * Par défaut on affiche la période ÉCOULÉE — c'est celle qu'il faut déposer,
 * la période en cours n'étant pas terminée. Le calcul vient des comptes 4455
 * (TVA facturée) et 3455 (TVA récupérable) sur l'intervalle de dates.
 */
export default function TvaPage() {
  const { dossier, dossierId, isLoading: dossierEnCours } = useDossier();

  const moisEcoule = new Date();
  moisEcoule.setMonth(moisEcoule.getMonth() - 1);

  const [annee, setAnnee] = useState(moisEcoule.getFullYear());
  const [periode, setPeriode] = useState(moisEcoule.getMonth() + 1);

  const tva = useQuery({
    queryKey: ['tva', dossierId, annee, periode],
    queryFn: () => obtenirDeclarationTva(dossierId!, annee, periode),
    enabled: dossierId !== null,
    retry: false,
  });

  if (dossierEnCours) return <Chargement />;

  const d = tva.data;
  const trimestriel = d?.regime === 'TRIMESTRIEL';

  return (
    <div className="p-6">
      <PageHeader
        titre="Déclaration de TVA"
        sousTitre={dossier?.raisonSociale}
        actions={<DossierSwitcher />}
      />

      {/* Sélecteur de période */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <label htmlFor="tva-periode" className="text-sm text-gray-600">
          {trimestriel ? 'Trimestre :' : 'Mois :'}
        </label>
        <select
          id="tva-periode"
          value={periode}
          onChange={(e) => setPeriode(Number(e.target.value))}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
        >
          {trimestriel
            ? [1, 2, 3, 4].map((t) => (
                <option key={t} value={t}>T{t}</option>
              ))
            : MOIS.map((m, i) => (
                <option key={m} value={i + 1}>{m}</option>
              ))}
        </select>

        <label htmlFor="tva-annee" className="text-sm text-gray-600 ml-2">Année :</label>
        <select
          id="tva-annee"
          value={annee}
          onChange={(e) => setAnnee(Number(e.target.value))}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
        >
          {[0, 1, 2].map((n) => {
            const a = new Date().getFullYear() - n;
            return <option key={a} value={a}>{a}</option>;
          })}
        </select>
      </div>

      {tva.isLoading ? (
        <Chargement />
      ) : tva.isError ? (
        <Erreur
          message={
            (tva.error as { response?: { data?: { error?: string } } })?.response?.data?.error ??
            'Impossible de calculer la déclaration.'
          }
          onReessayer={() => tva.refetch()}
        />
      ) : d ? (
        <>
          {/* Résultat de la période */}
          <div
            className={`mb-5 rounded-lg border px-5 py-4 ${
              d.creditTva > 0
                ? 'bg-blue-50 border-blue-200'
                : 'bg-amber-50 border-amber-200'
            }`}
          >
            {d.creditTva > 0 ? (
              <>
                <p className="text-sm text-gray-700">
                  Crédit de TVA — <strong>rien à payer</strong> pour {d.periode}.
                </p>
                <p className="text-2xl font-bold text-blue-700 mt-1">
                  {formatMontantAvecDevise(d.creditTva)}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Reportable sur la période suivante.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-700">
                  TVA due pour <strong>{d.periode}</strong>
                </p>
                <p className="text-2xl font-bold text-amber-700 mt-1">
                  {formatMontantAvecDevise(d.tvaDue)}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  À déclarer avant le {formatDateLongue(d.dateLimiteDepot)} sur Simpl-TVA.
                </p>
              </>
            )}
          </div>

          <Card>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-100">
                <Ligne libelle="TVA facturée (compte 4455)" montant={d.tvaFacturee} />
                <Ligne libelle="TVA récupérable (compte 3455)" montant={d.tvaRecuperable} />
                <tr className="bg-gray-50 font-semibold">
                  <td className="px-4 py-3">
                    {d.creditTva > 0 ? 'Crédit de TVA' : 'TVA due'}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {formatMontantOuTiret(d.creditTva > 0 ? d.creditTva : d.tvaDue)}
                  </td>
                </tr>
                <Ligne libelle="Chiffre d'affaires HT (pour contrôle)" montant={d.chiffreAffairesHt} />
                <Ligne libelle="Achats HT (pour contrôle)" montant={d.achatsHt} />
              </tbody>
            </table>
          </Card>

          <p className="text-xs text-gray-500 mt-4">
            Période du {d.dateDebut} au {d.dateFin} · Régime{' '}
            {d.regime === 'MENSUEL' ? 'mensuel' : 'trimestriel'}. ⚠️ Montants
            calculés depuis les écritures — à valider avant tout dépôt.
          </p>
        </>
      ) : null}
    </div>
  );
}

function Ligne({ libelle, montant }: { libelle: string; montant: number }) {
  return (
    <tr>
      <td className="px-4 py-2.5 text-gray-700">{libelle}</td>
      <td className="px-4 py-2.5 text-right font-mono">{formatMontantOuTiret(montant)}</td>
    </tr>
  );
}
