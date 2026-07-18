/**
 * Écritures comptables en partie double.
 *
 * Règle fondamentale : une écriture est un ensemble de lignes dont la somme
 * des débits est STRICTEMENT égale à la somme des crédits. Une écriture
 * déséquilibrée n'est jamais enregistrable.
 */

/** Journaux du plan comptable marocain. */
export type CodeJournal = 'AC' | 'VE' | 'BQ' | 'CA' | 'OD';

export const JOURNAUX: Record<CodeJournal, string> = {
  AC: 'Achats',
  VE: 'Ventes',
  BQ: 'Banque',
  CA: 'Caisse',
  OD: 'Opérations diverses',
};

/**
 * Une ligne d'écriture : un compte PCGE mouvementé au débit OU au crédit.
 * Les montants sont en centimes (entiers) pour éviter toute erreur
 * d'arrondi en virgule flottante — impératif en comptabilité.
 */
export interface LigneEcriture {
  id: string;
  /** Numéro de compte PCGE, ex. « 6111 ». */
  compte: string;
  libelle: string;
  /** Montant au débit, en centimes. 0 si la ligne est au crédit. */
  debit: number;
  /** Montant au crédit, en centimes. 0 si la ligne est au débit. */
  credit: number;
  /** Code de lettrage (rapprochement), ex. « A ». `null` si non lettrée. */
  lettrage: string | null;
}

export interface Ecriture {
  id: string;
  dossierId: string;
  exercice: number;
  journal: CodeJournal;
  /** N° de pièce séquentiel, ex. « AC-2025-00041 ». */
  numeroPiece: string;
  /** ISO 8601 (date seule, `YYYY-MM-DD`). */
  date: string;
  libelle: string;
  lignes: LigneEcriture[];
}

/** Payload de création — l'id et le n° de pièce sont attribués par le serveur. */
export interface NouvelleEcriture {
  dossierId: string;
  exercice: number;
  journal: CodeJournal;
  date: string;
  libelle: string;
  lignes: Array<Omit<LigneEcriture, 'id' | 'lettrage'>>;
}

/** Résultat du contrôle d'équilibre, affiché en direct dans le formulaire. */
export interface Equilibre {
  totalDebit: number;
  totalCredit: number;
  equilibre: boolean;
  /** totalDebit - totalCredit, en centimes. 0 si équilibré. */
  ecart: number;
}
