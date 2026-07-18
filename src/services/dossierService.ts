/**
 * Dossiers clients, échéances fiscales et statistiques du cabinet.
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
    const { data } = await api.get<Dossier[]>('/api/dossiers');
    return data;
  }
  return delaiSimule(MOCK_DOSSIERS);
}

export async function obtenirDossier(id: string): Promise<Dossier> {
  if (!USE_MOCKS) {
    const { data } = await api.get<Dossier>(`/api/dossiers/${id}`);
    return data;
  }

  const dossier = MOCK_DOSSIERS.find((d) => d.id === id);
  if (!dossier) throw new Error(`Dossier introuvable : ${id}`);

  return delaiSimule(dossier);
}

export async function listerEcheances(): Promise<EcheanceFiscale[]> {
  if (!USE_MOCKS) {
    const { data } = await api.get<EcheanceFiscale[]>('/api/echeances');
    return data;
  }

  // Les plus urgentes d'abord.
  const triees = [...MOCK_ECHEANCES].sort((a, b) =>
    a.dateEcheance.localeCompare(b.dateEcheance)
  );
  return delaiSimule(triees);
}

export async function obtenirStats(): Promise<StatsCabinet> {
  if (!USE_MOCKS) {
    const { data } = await api.get<StatsCabinet>('/api/cabinet/stats');
    return data;
  }
  return delaiSimule(MOCK_STATS);
}
