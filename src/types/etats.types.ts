/**
 * États de synthèse marocains : Bilan et CPC.
 *
 * Les deux sont structurés en « rubriques » regroupées en « masses ».
 * Tous les montants sont en centimes (entiers).
 */

/** Une ligne d'état financier, avec comparatif N-1. */
export interface RubriqueEtat {
  /** Libellé affiché, ex. « Immobilisations corporelles ». */
  libelle: string;
  /** Montant exercice N, en centimes. */
  montantN: number;
  /** Montant exercice N-1, en centimes. */
  montantN1: number;
  /** true → ligne de sous-total mise en gras. */
  total?: boolean;
}

/** Un groupe de rubriques, ex. « Actif immobilisé (Classe 2) ». */
export interface MasseEtat {
  titre: string;
  rubriques: RubriqueEtat[];
}

/** Bilan : photographie du patrimoine à la clôture. */
export interface Bilan {
  dossierId: string;
  exercice: number;
  /** ISO 8601 — date de clôture, ex. « 2025-12-31 ». */
  dateCloture: string;
  actif: MasseEtat[];
  passif: MasseEtat[];
  totalActifN: number;
  totalActifN1: number;
  totalPassifN: number;
  totalPassifN1: number;
}

/** CPC : Compte de Produits et Charges (l'équivalent marocain du compte de résultat). */
export interface Cpc {
  dossierId: string;
  exercice: number;
  chiffreAffairesN: number;
  chiffreAffairesN1: number;
  resultatExploitationN: number;
  resultatExploitationN1: number;
  resultatNetN: number;
  resultatNetN1: number;
  /** Lignes du tableau, dans l'ordre d'affichage. */
  lignes: LigneCpc[];
}

export type StyleLigneCpc =
  | 'normale'
  | 'section' // en-tête « I. EXPLOITATION »
  | 'soustotal' // « Résultat d'exploitation »
  | 'courant' // « Résultat courant »
  | 'net'; // « RÉSULTAT NET »

export interface LigneCpc {
  libelle: string;
  montantN: number;
  montantN1: number;
  style: StyleLigneCpc;
  /** Couleur d'accent pour les en-têtes de section. */
  accent?: 'bleu' | 'violet';
}

/** Document publié sur le portail client. */
export interface DocumentPublie {
  id: string;
  dossierId: string;
  type: 'BILAN' | 'CPC';
  exercice: number;
  libelle: string;
  sousTitre: string;
  /** ISO 8601 — date de publication. */
  publieLe: string;
  publiePar: string;
  archive: boolean;
}
