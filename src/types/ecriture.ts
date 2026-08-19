/**
 * Modèle de référence des écritures comptables.
 *
 * Aligné CHAMP POUR CHAMP sur le `EcritureDto` du backend : les montants sont
 * en DIRHAMS (2 décimales), et l'écriture porte son statut ainsi que ses liens
 * de contre-passation. C'est ce qui permet à `ecrituresApi.ts` de n'effectuer
 * aucune conversion — il désenveloppe le `{ data }` et c'est tout.
 *
 * À ne pas confondre avec `ecriture.types.ts` (montants en centimes), qui ne
 * sert plus qu'aux données mockées des états.
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
