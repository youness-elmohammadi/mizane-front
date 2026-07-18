import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useAuth } from '../../hooks/useAuth';
import { useDossier } from '../../hooks/useDossier';
import { listerDocumentsPublies } from '../../services/etatsService';
import type { DocumentPublie } from '../../types/etats.types';

import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Chargement, Erreur, Vide } from '../../components/ui/EtatChargement';

import { formatDateLongue } from '../../utils/dateUtils';

/**
 * Portail client — vue simplifiée destinée au dirigeant de l'entreprise.
 *
 * Le client n'accède ni aux écritures ni aux autres dossiers du cabinet :
 * il ne consulte que les états qui lui ont été explicitement publiés.
 */
export default function PortailPage() {
  const { user } = useAuth();
  // Les exercices ne sont plus rattachés au dossier : le ticket S1-F05 impose
  // une liste globale ('2025' / '2024').
  const {
    dossier,
    dossierId,
    exercicesDisponibles,
    isLoading: dossierEnCours,
  } = useDossier();

  const documents = useQuery({
    queryKey: ['documents', dossierId],
    queryFn: () => listerDocumentsPublies(dossierId!),
    enabled: dossierId !== null,
  });

  const [exerciceActif, setExerciceActif] = useState<number | null>(null);

  if (dossierEnCours || documents.isLoading) return <Chargement />;
  if (!dossier)
    return (
      <div className="p-6">
        <Vide titre="Aucun dossier sélectionné" />
      </div>
    );
  if (documents.isError)
    return <Erreur onReessayer={() => documents.refetch()} />;

  // Par défaut on affiche l'exercice le plus récent.
  const exercice = exerciceActif ?? Number(exercicesDisponibles[0]);
  const docsAffiches = (documents.data ?? []).filter(
    (d) => d.exercice === exercice
  );

  const initiales = (user?.nom ?? '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((mot) => mot.charAt(0))
    .join('')
    .toUpperCase();

  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto">
        {/* Bandeau d'accueil */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl font-bold">
              {initiales || '—'}
            </div>
            <div>
              <p className="text-indigo-200 text-sm">Espace financier</p>
              <h1 className="text-xl font-bold">
                Bienvenue, {user?.nom ?? 'Client'}
              </h1>
            </div>
          </div>
          <p className="text-indigo-200 text-sm">
            {dossier.raisonSociale} — Géré par Cabinet Expertise Maroc
          </p>
        </div>

        {/* Onglets d'exercice */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {exercicesDisponibles.map((annee) => (
            <button
              key={annee}
              type="button"
              onClick={() => setExerciceActif(Number(annee))}
              aria-pressed={Number(annee) === exercice}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                Number(annee) === exercice
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {annee}
            </button>
          ))}
        </div>

        {docsAffiches.length === 0 ? (
          <Card className="py-4">
            <Vide
              icone="fa-file-circle-question"
              titre={`Aucun document publié pour ${exercice}`}
              description="Vos états seront disponibles ici dès leur publication par le cabinet."
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {docsAffiches.map((doc) => (
              <CarteDocument key={doc.id} document={doc} />
            ))}
          </div>
        )}

        <p className="text-center text-gray-400 text-xs">
          Généré par Mizan — Cabinet Expertise Maroc
        </p>
      </div>
    </div>
  );
}

function CarteDocument({ document }: { document: DocumentPublie }) {
  const estBilan = document.type === 'BILAN';

  return (
    <Card className={`p-5 ${document.archive ? 'opacity-70' : ''}`}>
      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
              estBilan ? 'bg-blue-50' : 'bg-purple-50'
            }`}
          >
            <i
              className={`fa-solid ${
                estBilan
                  ? 'fa-scale-balanced text-blue-500'
                  : 'fa-chart-line text-purple-500'
              }`}
              aria-hidden="true"
            />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 truncate">
              {document.libelle}
            </p>
            <p className="text-gray-400 text-xs">{document.sousTitre}</p>
          </div>
        </div>

        <Badge ton={document.archive ? 'gris' : 'vert'}>
          {document.archive ? 'Archivé' : 'Disponible'}
        </Badge>
      </div>

      <p className="text-gray-500 text-xs mb-4">
        Publié le {formatDateLongue(document.publieLe)} par {document.publiePar}
      </p>

      <Button
        variante={document.archive ? 'secondaire' : 'danger'}
        icone="fa-file-pdf"
        pleineLargeur
      >
        Télécharger PDF
      </Button>
    </Card>
  );
}
