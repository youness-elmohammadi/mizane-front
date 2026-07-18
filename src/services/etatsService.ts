/**
 * États de synthèse (Bilan, CPC) et documents publiés au client.
 *
 * Ces états sont aujourd'hui des données figées. Côté backend ils seront
 * CALCULÉS à partir du journal des écritures, par agrégation des soldes
 * de comptes selon leur classe PCGE (voir src/utils/pcgeUtils.ts).
 */

import api from './api';
import { USE_MOCKS, delaiSimule } from './config';
import type { Bilan, Cpc, DocumentPublie } from '../types/etats.types';
import { MOCK_BILAN, MOCK_CPC, MOCK_DOCUMENTS } from '../mocks/mockData';

export async function obtenirBilan(
  dossierId: string,
  exercice: number
): Promise<Bilan> {
  if (!USE_MOCKS) {
    const { data } = await api.get<Bilan>(
      `/api/dossiers/${dossierId}/bilan`,
      { params: { exercice } }
    );
    return data;
  }
  return delaiSimule({ ...MOCK_BILAN, dossierId, exercice });
}

export async function obtenirCpc(
  dossierId: string,
  exercice: number
): Promise<Cpc> {
  if (!USE_MOCKS) {
    const { data } = await api.get<Cpc>(`/api/dossiers/${dossierId}/cpc`, {
      params: { exercice },
    });
    return data;
  }
  return delaiSimule({ ...MOCK_CPC, dossierId, exercice });
}

export async function listerDocumentsPublies(
  dossierId: string
): Promise<DocumentPublie[]> {
  if (!USE_MOCKS) {
    const { data } = await api.get<DocumentPublie[]>(
      `/api/dossiers/${dossierId}/documents`
    );
    return data;
  }

  const docs = MOCK_DOCUMENTS.filter((d) => d.dossierId === dossierId);
  return delaiSimule(docs);
}

/**
 * Vérifie l'égalité Actif = Passif.
 * Un bilan qui ne s'équilibre pas signale une erreur de saisie ou de report :
 * on l'affiche donc en évidence plutôt que de laisser passer silencieusement.
 */
export function bilanEstEquilibre(bilan: Bilan): boolean {
  return bilan.totalActifN === bilan.totalPassifN;
}
