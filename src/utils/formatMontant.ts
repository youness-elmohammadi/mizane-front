/**
 * Formatage monétaire.
 *
 * Convention du projet : TOUS les montants circulent en centimes (entiers).
 * On ne divise par 100 qu'au moment de l'affichage. Cela évite les erreurs
 * d'arrondi de la virgule flottante (0.1 + 0.2 !== 0.3), inacceptables
 * dès qu'un bilan doit tomber juste au centime près.
 */

/*
 * On force « fr-FR » et non « fr-MA » : fr-MA formate les milliers avec un
 * POINT (48.000,00), ce qui se lit mal dans un tableau comptable et s'écarte
 * de la présentation attendue. fr-FR donne « 48 000,00 » — espace insécable
 * en séparateur de milliers, virgule décimale.
 */
const nfDeuxDecimales = new Intl.NumberFormat('fr-FR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const nfEntier = new Intl.NumberFormat('fr-FR', {
  maximumFractionDigits: 0,
});

/**
 * 4800000 → « 48 000,00 »
 * Utilisé dans les tableaux d'écritures et les états financiers.
 */
export function formatMontant(centimes: number): string {
  return nfDeuxDecimales.format(centimes / 100);
}

/**
 * 4800000 → « 48 000,00 MAD »
 */
export function formatMontantAvecDevise(centimes: number): string {
  return `${formatMontant(centimes)} MAD`;
}

/**
 * 284000000 → « 2 840 000 » (sans décimales, pour les cartes KPI).
 */
export function formatMontantCourt(centimes: number): string {
  return nfEntier.format(Math.round(centimes / 100));
}

/**
 * Affiche un montant, ou un tiret cadratin si le montant est nul.
 * Les tableaux comptables laissent la colonne vide plutôt que d'afficher « 0,00 ».
 */
export function formatMontantOuTiret(centimes: number): string {
  return centimes === 0 ? '—' : formatMontant(centimes);
}

/**
 * Convertit une saisie utilisateur en centimes.
 * Accepte « 12 000,00 », « 12000.5 », « 12 000 » → 1200000, 1200050, 1200000.
 * Renvoie 0 si la saisie est vide ou illisible.
 */
export function parseMontant(saisie: string): number {
  // En JavaScript, \s couvre déjà l'espace insécable (U+00A0) et l'espace
  // insécable étroit (U+202F) — ceux qu'Intl insère entre les milliers.
  const nettoye = saisie.replace(/\s/g, '').replace(',', '.');

  if (nettoye === '') return 0;

  const valeur = Number(nettoye);
  if (!Number.isFinite(valeur)) return 0;

  // Math.round évite 12.34 * 100 === 1233.9999999999998
  return Math.round(valeur * 100);
}

/**
 * Variation en pourcentage entre N-1 et N, arrondie à l'entier.
 * Renvoie `null` si N-1 vaut 0 (variation non calculable).
 */
export function calculerVariation(
  montantN: number,
  montantN1: number
): number | null {
  if (montantN1 === 0) return null;
  return Math.round(((montantN - montantN1) / Math.abs(montantN1)) * 100);
}

/** « +18% », « -11% », ou « — » si non calculable. */
export function formatVariation(variation: number | null): string {
  if (variation === null) return '—';
  return `${variation > 0 ? '+' : ''}${variation}%`;
}
