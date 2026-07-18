/**
 * Un « dossier » = une entreprise cliente du cabinet.
 * C'est l'unité d'isolation métier : toute écriture, tout état financier
 * appartient à un dossier et à un exercice.
 */

/** Forme juridique marocaine. */
export type FormeJuridique =
  | 'SARL'
  | 'SA'
  | 'SNC'
  | 'AUTO_ENTREPRENEUR'
  | 'SASU';

/** Abréviation affichée dans la colonne « Forme » du tableau. */
export const ABREVIATIONS_FORME: Record<FormeJuridique, string> = {
  SARL: 'SARL',
  SA: 'SA',
  SNC: 'SNC',
  AUTO_ENTREPRENEUR: 'AE',
  SASU: 'SASU',
};

/** Périodicité de déclaration TVA (DGI). */
export type RegimeTva = 'MENSUEL' | 'TRIMESTRIEL' | 'NON_ASSUJETTI';

/** Statut administratif du dossier — badge « Actif » / « Archivé ». */
export type StatutDossier = 'ACTIF' | 'ARCHIVE';

/** Statut de SUIVI, déduit de la dernière saisie (à ne pas confondre avec StatutDossier). */
export type StatutSuivi = 'OK' | 'ATTENTION' | 'RETARD';

export interface Dossier {
  id: string;
  raisonSociale: string;
  formeJuridique: FormeJuridique;
  regimeTva: RegimeTva;
  /** Identifiant Commun de l'Entreprise — 15 chiffres. `null` pour un auto-entrepreneur. */
  ice: string | null;
  responsableNom: string;
  statut: StatutDossier;
  /** ISO 8601. Sert à calculer le statut de suivi (voir statutDepuisDerniereSaisie). */
  derniereSaisie: string;
}

/** Échéance fiscale affichée sur le tableau de bord. */
export interface EcheanceFiscale {
  id: string;
  dossierId: string;
  dossierNom: string;
  type: 'TVA' | 'IS' | 'IR';
  libelle: string;
  /** ISO 8601 — date limite de dépôt. */
  dateEcheance: string;
}

/** Agrégats affichés dans les cartes KPI du tableau de bord. */
export interface StatsCabinet {
  dossiersActifs: number;
  nouveauxCeMois: number;
  enRetard: number;
  alertesFiscales: number;
  revenusEstimesMad: number;
  /** Évolution du nombre de dossiers sur 6 mois (graphique). */
  evolutionDossiers: Array<{ mois: string; valeur: number }>;
}
