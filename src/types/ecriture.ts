/**
 * Modèle d'écriture pour l'écran de saisie (ticket S2-F01).
 *
 * Distinct de `ecriture.types.ts` (ancien modèle en centimes) : ici les
 * montants sont en DIRHAMS (nombres à 2 décimales), et l'écriture porte son
 * statut + ses liens de contre-passation.
 */

/** Journaux comptables — même liste que l'enum backend CodeJournal (+ AN). */
export type Journal = 'AC' | 'VE' | 'BQ' | 'CA' | 'OD' | 'AN';

/** Statut d'une écriture : figée si son exercice est clôturé. */
export type StatutEcriture = 'VALIDE' | 'CLOS';

/** Libellés lisibles des journaux (Record → TypeScript exige qu'ils soient tous couverts). */
export const LIBELLES_JOURNAUX: Record<Journal, string> = {
  AC: 'Achats',
  VE: 'Ventes',
  BQ: 'Banque',
  CA: 'Caisse',
  OD: 'Opérations diverses',
  AN: 'À-nouveaux',
};

export interface LigneEcriture {
  id: string;
  compteNum: string;
  compteLib: string;
  libelle: string;
  debit: number; // MAD (0 si la ligne est au crédit)
  credit: number; // MAD (0 si la ligne est au débit)
}

export interface Ecriture {
  id: string;
  journal: Journal;
  dateEcriture: string; // ISO 'YYYY-MM-DD'
  pieceRef: string;
  libelle: string;
  statut: StatutEcriture;
  totalDebit: number;
  totalCredit: number;
  lignes: LigneEcriture[];
  /** id de l'écriture inverse, si celle-ci a été annulée. */
  contrepassePar: string | null;
  /** id de l'écriture d'origine, si celle-ci EST une contre-passation. */
  originalDe: string | null;
}
