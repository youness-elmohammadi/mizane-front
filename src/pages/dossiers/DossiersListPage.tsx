import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useDossier } from '../../hooks/useDossier';
import { ABREVIATIONS_FORME } from '../../types/dossier.types';
import type { Dossier, StatutDossier } from '../../types/dossier.types';

import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { BadgeStatut, BadgeTva } from '../../components/ui/Badge';
import { Chargement, Erreur, Vide } from '../../components/ui/EtatChargement';

type FiltreStatut = 'TOUS' | StatutDossier;

/**
 * Liste des dossiers clients (ticket S1-F06).
 *
 * Le bouton « Ouvrir » sélectionne le dossier dans le store global puis
 * navigue vers la saisie comptable : la page de saisie retrouve donc
 * le bon contexte sans qu'on ait à le passer dans l'URL.
 */
export default function DossiersListPage() {
  const { dossiers, setDossier, isLoading, isError } = useDossier();
  const navigate = useNavigate();

  const [recherche, setRecherche] = useState('');
  const [filtreStatut, setFiltreStatut] = useState<FiltreStatut>('TOUS');

  // useMemo : le filtrage ne se recalcule que si la liste ou les critères changent.
  const dossiersFiltres = useMemo(() => {
    const q = recherche.trim().toLowerCase();

    return dossiers
      .filter((d) => filtreStatut === 'TOUS' || d.statut === filtreStatut)
      .filter((d) => {
        if (q === '') return true;
        return (
          d.raisonSociale.toLowerCase().includes(q) ||
          d.responsableNom.toLowerCase().includes(q) ||
          (d.ice?.includes(q) ?? false)
        );
      });
  }, [dossiers, recherche, filtreStatut]);

  const ouvrirDossier = (dossier: Dossier) => {
    setDossier(dossier);
    navigate('/saisie');
  };

  if (isLoading) return <Chargement />;
  if (isError) return <Erreur />;

  const nbActifs = dossiers.filter((d) => d.statut === 'ACTIF').length;

  return (
    <div className="p-6">
      <PageHeader
        titre="Dossiers clients"
        sousTitre={`${nbActifs} dossiers actifs`}
        actions={
          <Button icone="fa-plus" className="py-2.5">
            Nouveau dossier
          </Button>
        }
      />

      <Card className="overflow-hidden">
        {/* Barre de filtres */}
        <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap gap-3">
          <input
            type="search"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher un dossier..."
            aria-label="Rechercher un dossier"
            className="flex-1 min-w-[200px] border border-gray-200 rounded-lg px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={filtreStatut}
            onChange={(e) => setFiltreStatut(e.target.value as FiltreStatut)}
            aria-label="Filtrer par statut"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 bg-white
                       focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="TOUS">Tous les statuts</option>
            <option value="ACTIF">Actif</option>
            <option value="ARCHIVE">Archivé</option>
          </select>
        </div>

        {dossiersFiltres.length === 0 ? (
          <Vide
            icone="fa-folder-open"
            titre="Aucun dossier ne correspond"
            description="Modifiez votre recherche ou le filtre de statut."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-gray-500 text-xs uppercase">
                  <th className="px-5 py-3 text-left font-medium">Dossier</th>
                  <th className="px-4 py-3 text-left font-medium">Forme</th>
                  <th className="px-4 py-3 text-left font-medium">ICE</th>
                  <th className="px-4 py-3 text-left font-medium">Responsable</th>
                  <th className="px-4 py-3 text-left font-medium">Régime TVA</th>
                  <th className="px-4 py-3 text-left font-medium">Statut</th>
                  <th className="px-4 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {dossiersFiltres.map((dossier) => (
                  <tr key={dossier.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-gray-900">
                      {dossier.raisonSociale}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {ABREVIATIONS_FORME[dossier.formeJuridique]}
                    </td>
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                      {dossier.ice ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {dossier.responsableNom}
                    </td>
                    <td className="px-4 py-3">
                      <BadgeTva regime={dossier.regimeTva} />
                    </td>
                    <td className="px-4 py-3">
                      <BadgeStatut statut={dossier.statut} />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => ouvrirDossier(dossier)}
                        className="text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                      >
                        Ouvrir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
