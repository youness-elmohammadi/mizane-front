/**
 * PCGE — Plan Comptable Général des Entreprises (Maroc).
 *
 * Les comptes sont codés par un numéro dont le PREMIER CHIFFRE donne la classe.
 * La classe détermine à la fois la nature du compte et l'état où il atterrit :
 *
 *   Classe 1 — Financement permanent      → Bilan / Passif
 *   Classe 2 — Actif immobilisé           → Bilan / Actif
 *   Classe 3 — Actif circulant (hors trésorerie) → Bilan / Actif
 *   Classe 4 — Passif circulant (hors trésorerie) → Bilan / Passif
 *   Classe 5 — Trésorerie                 → Bilan / Actif ou Passif
 *   Classe 6 — Charges                    → CPC
 *   Classe 7 — Produits                   → CPC
 *
 * C'est cette classification qui permet de construire le Bilan et le CPC
 * automatiquement à partir du seul journal des écritures.
 */

export type ClassePcge = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const LIBELLES_CLASSES: Record<ClassePcge, string> = {
  1: 'Financement permanent',
  2: 'Actif immobilisé',
  3: 'Actif circulant',
  4: 'Passif circulant',
  5: 'Trésorerie',
  6: 'Charges',
  7: 'Produits',
};

/**
 * Extrait la classe d'un numéro de compte.
 * « 6111 » → 6. Renvoie `null` si le numéro est invalide.
 */
export function classeDuCompte(compte: string): ClassePcge | null {
  const premier = Number(compte.trim().charAt(0));

  if (!Number.isInteger(premier) || premier < 1 || premier > 7) return null;
  return premier as ClassePcge;
}

/**
 * Un compte est-il « de bilan » (classes 1 à 5) ou « de gestion » (6 et 7) ?
 * Les comptes de gestion sont soldés à la clôture ; les comptes de bilan
 * sont reportés d'un exercice sur l'autre.
 */
export function estCompteDeBilan(compte: string): boolean {
  const classe = classeDuCompte(compte);
  return classe !== null && classe <= 5;
}

export function estCompteDeGestion(compte: string): boolean {
  const classe = classeDuCompte(compte);
  return classe === 6 || classe === 7;
}

/**
 * Sens « naturel » du solde d'un compte.
 * Un compte d'actif ou de charge augmente au débit ; un compte de passif
 * ou de produit augmente au crédit. Sert à contrôler la vraisemblance
 * d'une saisie et à calculer les soldes dans le bon sens.
 */
export function sensNaturel(compte: string): 'DEBIT' | 'CREDIT' | null {
  const classe = classeDuCompte(compte);
  if (classe === null) return null;

  // Classes d'actif et de charges → débitrices
  if (classe === 2 || classe === 3 || classe === 6) return 'DEBIT';
  // Classes de passif et de produits → créditrices
  if (classe === 1 || classe === 4 || classe === 7) return 'CREDIT';
  // Classe 5 (trésorerie) : débitrice si positive, mais un découvert la rend créditrice
  return 'DEBIT';
}

/**
 * Comptes les plus courants, pour l'autocomplétion du formulaire de saisie.
 * Liste volontairement restreinte : le PCGE complet compte plusieurs centaines
 * de comptes et sera servi par l'API une fois le backend en place.
 */
export interface ComptePcge {
  numero: string;
  libelle: string;
}

export const COMPTES_COURANTS: ComptePcge[] = [
  // Classe 1 — Financement permanent
  { numero: '1111', libelle: 'Capital social' },
  { numero: '1140', libelle: 'Réserve légale' },
  { numero: '1191', libelle: "Résultat net de l'exercice" },
  { numero: '1481', libelle: 'Emprunts auprès des établissements de crédit' },

  // Classe 2 — Actif immobilisé
  { numero: '2111', libelle: 'Frais de constitution' },
  { numero: '2220', libelle: 'Brevets, marques et droits similaires' },
  { numero: '2321', libelle: 'Bâtiments' },
  { numero: '2340', libelle: 'Matériel de transport' },
  { numero: '2351', libelle: 'Mobilier de bureau' },
  { numero: '2355', libelle: 'Matériel informatique' },

  // Classe 3 — Actif circulant
  { numero: '3111', libelle: 'Marchandises' },
  { numero: '3421', libelle: 'Clients' },
  { numero: '3455', libelle: 'État — TVA récupérable' },

  // Classe 4 — Passif circulant
  { numero: '4411', libelle: 'Fournisseurs' },
  { numero: '4432', libelle: 'Rémunérations dues au personnel' },
  { numero: '4455', libelle: 'État — TVA facturée' },
  { numero: '4456', libelle: 'État — TVA due' },

  // Classe 5 — Trésorerie
  { numero: '5141', libelle: 'Banques (solde débiteur)' },
  { numero: '5161', libelle: 'Caisse' },

  // Classe 6 — Charges
  { numero: '6111', libelle: 'Achats de marchandises' },
  { numero: '6125', libelle: 'Achats non stockés de matières et fournitures' },
  { numero: '6131', libelle: 'Locations et charges locatives' },
  { numero: '6141', libelle: 'Transports' },
  { numero: '6171', libelle: 'Rémunérations du personnel' },
  { numero: '6311', libelle: 'Intérêts des emprunts' },
  { numero: '6701', libelle: 'Impôts sur les résultats' },

  // Classe 7 — Produits
  { numero: '7111', libelle: 'Ventes de marchandises' },
  { numero: '7121', libelle: 'Ventes de biens produits' },
  { numero: '7127', libelle: 'Ventes de services produits' },
  { numero: '7381', libelle: 'Intérêts et produits assimilés' },
];

/** Retrouve le libellé officiel d'un compte, ou `null` s'il est inconnu. */
export function libelleDuCompte(numero: string): string | null {
  return COMPTES_COURANTS.find((c) => c.numero === numero)?.libelle ?? null;
}

/** Filtre les comptes par numéro ou libellé, pour l'autocomplétion. */
export function chercherComptes(requete: string, limite = 8): ComptePcge[] {
  const q = requete.trim().toLowerCase();
  if (q === '') return [];

  return COMPTES_COURANTS.filter(
    (c) =>
      c.numero.startsWith(q) || c.libelle.toLowerCase().includes(q)
  ).slice(0, limite);
}

/**
 * Valide la forme d'un numéro de compte PCGE : 3 à 8 chiffres,
 * premier chiffre entre 1 et 7.
 */
export function estNumeroCompteValide(compte: string): boolean {
  const c = compte.trim();
  return /^[1-7]\d{2,7}$/.test(c);
}
