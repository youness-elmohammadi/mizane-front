/**
 * Journal des écritures comptables.
 *
 * En mode mock les écritures créées sont conservées en mémoire (rechargement
 * de la page = remise à zéro), ce qui suffit à valider tout le parcours de
 * saisie sans backend.
 */

import api from './api';
import { USE_MOCKS, delaiSimule } from './config';
import type {
  Ecriture,
  Equilibre,
  NouvelleEcriture,
  CodeJournal,
} from '../types/ecriture.types';
import { MOCK_ECRITURES } from '../mocks/mockData';

/** Copie de travail : les créations en mock viennent s'y ajouter. */
let ecritures: Ecriture[] = [...MOCK_ECRITURES];

export interface FiltresEcritures {
  dossierId: string;
  exercice: number;
  /** `null` = tous les journaux. */
  journal?: CodeJournal | null;
  /** Format `YYYY-MM`. `null` = tous les mois. */
  mois?: string | null;
}

/**
 * Calcule l'équilibre débit/crédit d'un ensemble de lignes.
 *
 * C'est LA règle de la partie double : une écriture n'est valide que si
 * la somme des débits égale exactement la somme des crédits. Les montants
 * étant des entiers (centimes), la comparaison est exacte — pas d'epsilon.
 */
export function calculerEquilibre(
  lignes: Array<{ debit: number; credit: number }>
): Equilibre {
  const totalDebit = lignes.reduce((somme, l) => somme + l.debit, 0);
  const totalCredit = lignes.reduce((somme, l) => somme + l.credit, 0);

  return {
    totalDebit,
    totalCredit,
    equilibre: totalDebit === totalCredit && totalDebit > 0,
    ecart: totalDebit - totalCredit,
  };
}

/** Équilibre de tout un journal, affiché en en-tête de la page Saisie. */
export function calculerEquilibreJournal(liste: Ecriture[]): Equilibre {
  return calculerEquilibre(liste.flatMap((e) => e.lignes));
}

export async function listerEcritures(
  filtres: FiltresEcritures
): Promise<Ecriture[]> {
  if (!USE_MOCKS) {
    const { data } = await api.get<Ecriture[]>('/api/ecritures', {
      params: filtres,
    });
    return data;
  }

  const resultat = ecritures
    .filter((e) => e.dossierId === filtres.dossierId)
    .filter((e) => e.exercice === filtres.exercice)
    .filter((e) => !filtres.journal || e.journal === filtres.journal)
    .filter((e) => !filtres.mois || e.date.startsWith(filtres.mois))
    .sort((a, b) => a.date.localeCompare(b.date));

  return delaiSimule(resultat);
}

/**
 * Prochain numéro de pièce pour un journal et un exercice.
 * Format : `AC-2025-00042`. Côté backend ce compteur devra être garanti
 * par une séquence en base pour rester unique en cas d'accès concurrent.
 */
export async function prochainNumeroPiece(
  dossierId: string,
  exercice: number,
  journal: CodeJournal
): Promise<string> {
  if (!USE_MOCKS) {
    const { data } = await api.get<{ numeroPiece: string }>(
      '/api/ecritures/prochain-numero',
      { params: { dossierId, exercice, journal } }
    );
    return data.numeroPiece;
  }

  const existantes = ecritures.filter(
    (e) =>
      e.dossierId === dossierId &&
      e.exercice === exercice &&
      e.journal === journal
  );

  const dernier = existantes.reduce((max, e) => {
    const n = Number(e.numeroPiece.split('-')[2]);
    return Number.isFinite(n) && n > max ? n : max;
  }, 0);

  const suivant = String(dernier + 1).padStart(5, '0');
  return delaiSimule(`${journal}-${exercice}-${suivant}`, 100);
}

export class ErreurEcritureDesequilibree extends Error {
  readonly ecart: number;

  constructor(ecart: number) {
    super('Écriture déséquilibrée : le total des débits doit égaler le total des crédits');
    this.name = 'ErreurEcritureDesequilibree';
    this.ecart = ecart;
  }
}

export async function creerEcriture(
  nouvelle: NouvelleEcriture
): Promise<Ecriture> {
  // Contrôle côté client — le backend devra le refaire, jamais faire confiance au client.
  const equilibre = calculerEquilibre(nouvelle.lignes);
  if (!equilibre.equilibre) {
    throw new ErreurEcritureDesequilibree(equilibre.ecart);
  }

  if (!USE_MOCKS) {
    const { data } = await api.post<Ecriture>('/api/ecritures', nouvelle);
    return data;
  }

  const numeroPiece = await prochainNumeroPiece(
    nouvelle.dossierId,
    nouvelle.exercice,
    nouvelle.journal
  );

  const creee: Ecriture = {
    id: `ecr-${crypto.randomUUID()}`,
    dossierId: nouvelle.dossierId,
    exercice: nouvelle.exercice,
    journal: nouvelle.journal,
    numeroPiece,
    date: nouvelle.date,
    libelle: nouvelle.libelle,
    lignes: nouvelle.lignes.map((l, index) => ({
      ...l,
      id: `lig-${crypto.randomUUID()}-${index}`,
      lettrage: null,
    })),
  };

  ecritures = [...ecritures, creee];
  return delaiSimule(creee);
}
