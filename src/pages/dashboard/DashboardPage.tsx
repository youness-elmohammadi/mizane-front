import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
import { useDossiers } from '../../hooks/useDossier';
import { listerEcheances, obtenirStats } from '../../services/dossierService';

import Card, { CardHeader, CarteKpi } from '../../components/ui/Card';
import { BadgeSuivi } from '../../components/ui/Badge';
import { Chargement, Erreur } from '../../components/ui/EtatChargement';
import GraphiqueDossiers from '../../components/charts/GraphiqueDossiers';

import { formatMontantCourt } from '../../utils/formatMontant';
import {
  formatDateAvecJour,
  formatDepuis,
  formatDansCombien,
  statutDepuisDerniereSaisie,
  urgenceEcheance,
} from '../../utils/dateUtils';
import type { EcheanceFiscale } from '../../types/dossier.types';

/**
 * Tableau de bord du cabinet : vue d'ensemble du portefeuille,
 * échéances fiscales à venir et évolution du nombre de dossiers.
 */
export default function DashboardPage() {
  const { user } = useAuth();

  const stats = useQuery({ queryKey: ['stats'], queryFn: obtenirStats });
  const echeances = useQuery({
    queryKey: ['echeances'],
    queryFn: listerEcheances,
  });
  const { data: dossiers, isLoading: dossiersEnCours } = useDossiers();

  const prenom = user?.nom.split(' ')[0] ?? '';

  if (stats.isLoading || dossiersEnCours) return <Chargement />;
  if (stats.isError || !stats.data)
    return <Erreur onReessayer={() => stats.refetch()} />;

  const s = stats.data;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Bonjour, {prenom} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Cabinet Expertise Maroc — {formatDateAvecJour()}
        </p>
      </div>

      {/* Cartes KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <CarteKpi
          libelle="Dossiers actifs"
          valeur={String(s.dossiersActifs)}
          icone="fa-folder"
          ton="indigo"
          detail={
            <span className="text-green-600">
              <i className="fa-solid fa-arrow-up" aria-hidden="true" /> +
              {s.nouveauxCeMois} ce mois
            </span>
          }
        />
        <CarteKpi
          libelle="En retard"
          valeur={String(s.enRetard)}
          icone="fa-triangle-exclamation"
          ton="rouge"
          valeurEnCouleur
          detail={
            <span className="text-red-500">Dernière saisie &gt; 15 jours</span>
          }
        />
        <CarteKpi
          libelle="Alertes fiscales"
          valeur={String(s.alertesFiscales)}
          icone="fa-bell"
          ton="orange"
          valeurEnCouleur
          detail={<span className="text-orange-500">Échéances ce mois</span>}
        />
        <CarteKpi
          libelle="Revenus estimés M+1"
          valeur={formatMontantCourt(s.revenusEstimesMad)}
          icone="fa-coins"
          ton="vert"
          detail={<span className="text-gray-400">MAD</span>}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Portefeuille */}
        <Card className="xl:col-span-2 overflow-hidden">
          <CardHeader
            titre="Portefeuille dossiers"
            action={
              <Link
                to="/dossiers"
                className="text-indigo-600 text-sm font-medium hover:text-indigo-800"
              >
                Voir tout
              </Link>
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-gray-500 text-xs uppercase">
                  <th className="px-5 py-3 text-left font-medium">Dossier</th>
                  <th className="px-4 py-3 text-left font-medium">Responsable</th>
                  <th className="px-4 py-3 text-left font-medium">
                    Dernière saisie
                  </th>
                  <th className="px-4 py-3 text-left font-medium">Statut</th>
                  <th className="px-4 py-3 text-left font-medium">TVA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {dossiers?.map((dossier) => {
                  const statut = statutDepuisDerniereSaisie(
                    dossier.derniereSaisie
                  );
                  const couleurDelai =
                    statut === 'OK'
                      ? 'text-green-600'
                      : statut === 'ATTENTION'
                        ? 'text-orange-600'
                        : 'text-red-600';

                  return (
                    <tr key={dossier.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-medium text-gray-900">
                        {dossier.raisonSociale}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {dossier.responsableNom}
                      </td>
                      <td className={`px-4 py-3 ${couleurDelai}`}>
                        {formatDepuis(dossier.derniereSaisie)}
                      </td>
                      <td className="px-4 py-3">
                        <BadgeSuivi statut={statut} />
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {LIBELLE_TVA[dossier.regimeTva]}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Colonne de droite */}
        <div className="space-y-4">
          <Card>
            <CardHeader titre="Échéances fiscales" />
            <div className="p-4 space-y-3">
              {echeances.isLoading && (
                <p className="text-sm text-gray-400">Chargement…</p>
              )}
              {echeances.data?.map((echeance) => (
                <CarteEcheance key={echeance.id} echeance={echeance} />
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="font-semibold text-gray-900 mb-4">
              Dossiers actifs / 6 mois
            </h2>
            <div className="h-[120px]">
              <GraphiqueDossiers donnees={s.evolutionDossiers} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

const LIBELLE_TVA = {
  MENSUEL: 'Mensuel',
  TRIMESTRIEL: 'Trimestriel',
  NON_ASSUJETTI: 'Non assujetti',
} as const;

/** Une échéance, colorée selon son urgence. */
function CarteEcheance({ echeance }: { echeance: EcheanceFiscale }) {
  const urgence = urgenceEcheance(echeance.dateEcheance);

  const styles = {
    CRITIQUE: {
      conteneur: 'bg-red-50 border-red-100',
      icone: 'fa-circle-exclamation text-red-500',
      titre: 'text-red-800',
      detail: 'text-red-600',
    },
    PROCHE: {
      conteneur: 'bg-orange-50 border-orange-100',
      icone: 'fa-clock text-orange-500',
      titre: 'text-orange-800',
      detail: 'text-orange-600',
    },
    LOINTAINE: {
      conteneur: 'bg-green-50 border-green-100',
      icone: 'fa-circle-check text-green-500',
      titre: 'text-green-800',
      detail: 'text-green-600',
    },
  }[urgence];

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg border ${styles.conteneur}`}
    >
      <i className={`fa-solid ${styles.icone} mt-0.5`} aria-hidden="true" />
      <div>
        <p className={`text-sm font-medium ${styles.titre}`}>
          {echeance.libelle}
        </p>
        <p className={`text-xs ${styles.detail}`}>
          {echeance.dossierNom} — {formatDansCombien(echeance.dateEcheance)}
        </p>
      </div>
    </div>
  );
}
