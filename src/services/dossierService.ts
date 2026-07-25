/**
 * Dossiers clients, échéances fiscales et statistiques du cabinet.
 *
 * Comme `authService`, le backend Spring enveloppe ses réponses dans
 * `{ data: ... }` : on désenveloppe ici (`response.data.data`) pour que le
 * reste de l'app manipule directement les types métier.
 */

import api from './api';

import { USE_MOCKS, delaiSimule } from './config';
import type {
  Dossier,
  EcheanceFiscale,
  StatsCabinet,
} from '../types/dossier.types';
import { MOCK_ECHEANCES, MOCK_STATS } from '../mocks/mockData';
import { MOCK_DOSSIERS } from '../data/mock-dossiers';

export async function listerDossiers(): Promise<Dossier[]> {
  if (!USE_MOCKS) {
    const { data } = await api.get<{ data: Dossier[] }>('/api/dossiers');
    return data.data;
  }
  return delaiSimule(MOCK_DOSSIERS);
}

export async function obtenirDossier(id: string): Promise<Dossier> {
  if (!USE_MOCKS) {
    const { data } = await api.get<{ data: Dossier }>(`/api/dossiers/${id}`);
    return data.data;
  }

  const dossier = MOCK_DOSSIERS.find((d) => d.id === id);
  if (!dossier) throw new Error(`Dossier introuvable : ${id}`);

  return delaiSimule(dossier);
}

/** Payload de création — le backend calcule `id`, `statut` et `derniereSaisie`. */
export interface CreationDossier {
  raisonSociale: string;
  formeJuridique: Dossier['formeJuridique'];
  regimeTva: Dossier['regimeTva'];
  ice?: string | null;
  responsableNom: string;
}

export async function creerDossier(payload: CreationDossier): Promise<Dossier> {
  const { data } = await api.post<{ data: Dossier }>('/api/dossiers', payload);
  return data.data;
}

export async function listerEcheances(): Promise<EcheanceFiscale[]> {
  if (!USE_MOCKS) {
    const { data } = await api.get<{ data: EcheanceFiscale[] }>('/api/echeances');
    return data.data;
  }

  // Les plus urgentes d'abord.
  const triees = [...MOCK_ECHEANCES].sort((a, b) =>
    a.dateEcheance.localeCompare(b.dateEcheance)
  );
  return delaiSimule(triees);
}

export async function obtenirStats(): Promise<StatsCabinet> {
  if (!USE_MOCKS) {
    const { data } = await api.get<{ data: StatsCabinet }>('/api/cabinet/stats');
    return data.data;
  }
  return delaiSimule(MOCK_STATS);
}
