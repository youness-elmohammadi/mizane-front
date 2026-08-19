/**
 * Écritures comptables — service API.
 *
 * ⚠️ UNITÉS : les écritures circulent en DIRHAMS de bout en bout. Le type
 * `Ecriture` de `types/ecriture.ts` correspond CHAMP POUR CHAMP au
 * `EcritureDto` du backend (compteNum, dateEcriture, pieceRef, statut…).
 * Il n'y a donc AUCUNE conversion à faire ici : on désenveloppe le `{ data }`
 * du backend et c'est tout.
 *
 * (Seuls les ÉTATS — bilan, CPC — circulent en centimes ; voir etatsService.)
 */

import api from './api';
import type { Ecriture, Journal } from '../types/ecriture';

/** Un compte du PCGE du dossier, tel que renvoyé par l'autocomplétion. */
export interface CompteApi {
  num: string;
  libelle: string;
  classe: number;
}

/** Exercice comptable — la saisie exige un `id` (UUID), pas une année. */
export interface ExerciceApi {
  id: string;
  annee: number;
  dateOuverture: string;
  dateCloture: string;
  statut: 'OUVERT' | 'CLOTURE';
}

export interface NouvelleEcriturePayload {
  exerciceId: string;
  journal: Journal;
  /** ISO `YYYY-MM-DD`. */
  dateEcriture: string;
  libelle: string;
  lignes: Array<{
    compteNum: string;
    libelle: string;
    /** Dirhams. 0 si la ligne est au crédit. */
    debit: number;
    credit: number;
  }>;
}

export async function listerExercices(dossierId: string): Promise<ExerciceApi[]> {
  const { data } = await api.get<{ data: ExerciceApi[] }>(
    `/api/dossiers/${dossierId}/exercices`
  );
  return data.data;
}

export async function listerEcritures(
  dossierId: string,
  journal?: Journal,
  exerciceId?: string
): Promise<Ecriture[]> {
  const { data } = await api.get<{ data: Ecriture[] }>(
    `/api/dossiers/${dossierId}/ecritures`,
    { params: { journal, exerciceId } }
  );
  return data.data;
}

/**
 * Crée une écriture.
 *
 * Le numéro de pièce n'est PAS envoyé : il est attribué par le serveur via une
 * séquence verrouillée (`SELECT … FOR UPDATE`). Le calculer côté client
 * rouvrirait la faille de concurrence que cette séquence ferme.
 */
export async function creerEcriture(
  dossierId: string,
  payload: NouvelleEcriturePayload
): Promise<Ecriture> {
  const { data } = await api.post<{ data: Ecriture }>(
    `/api/dossiers/${dossierId}/ecritures`,
    payload
  );
  return data.data;
}

/**
 * Contre-passe une écriture (on ne modifie jamais une écriture validée :
 * on en crée l'inverse, et les deux restent visibles).
 */
export async function contrepasser(
  dossierId: string,
  ecritureId: string
): Promise<Ecriture> {
  const { data } = await api.post<{ data: Ecriture }>(
    `/api/dossiers/${dossierId}/ecritures/${ecritureId}/contrepasser`
  );
  return data.data;
}

/** Autocomplétion des comptes du PCGE du dossier (20 résultats max, côté serveur). */
export async function chercherComptes(
  dossierId: string,
  q: string
): Promise<CompteApi[]> {
  const { data } = await api.get<{ data: CompteApi[] }>(
    `/api/dossiers/${dossierId}/comptes`,
    { params: { q } }
  );
  return data.data;
}

/** Lettrage d'un lot de lignes sur un compte de tiers. */
export async function lettrer(
  dossierId: string,
  ligneIds: string[]
): Promise<{ lettre: string; nbLignes: number; compteNum: string }> {
  const { data } = await api.post<{
    data: { lettre: string; nbLignes: number; compteNum: string };
  }>(`/api/dossiers/${dossierId}/lettrage`, { ligneIds });
  return data.data;
}

/** Clôture d'un exercice : solde les comptes de gestion et génère les à-nouveaux. */
export async function cloturerExercice(
  dossierId: string,
  exerciceId: string
): Promise<{
  anneeClose: number;
  anneeSuivante: number;
  resultat: number;
  exerciceSuivantId: string;
}> {
  const { data } = await api.post<{
    data: {
      anneeClose: number;
      anneeSuivante: number;
      resultat: number;
      exerciceSuivantId: string;
    };
  }>(`/api/dossiers/${dossierId}/exercices/${exerciceId}/cloturer`);
  return data.data;
}
