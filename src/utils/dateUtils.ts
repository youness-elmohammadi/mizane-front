/**
 * Utilitaires de dates.
 * Les dates circulent en ISO 8601 (`YYYY-MM-DD`) et ne sont formatées
 * en français qu'à l'affichage.
 */

import type { StatutSuivi } from '../types/dossier.types';

const MS_PAR_JOUR = 86_400_000;

/** « 2025-12-15 » → « 15/12/2025 » */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat('fr-MA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

/** « 2026-01-15 » → « 15 janvier 2026 » */
export function formatDateLongue(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat('fr-MA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
}

/** → « Lundi 7 juillet 2026 » (première lettre en majuscule, comme le prototype). */
export function formatDateAvecJour(date: Date = new Date()): string {
  const texte = new Intl.DateTimeFormat('fr-MA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);

  return texte.charAt(0).toUpperCase() + texte.slice(1);
}

/**
 * Nombre de jours calendaires entre deux dates (positif si `fin` est après `debut`).
 * On normalise à minuit pour qu'un écart de 25 h ne compte pas pour 2 jours.
 */
export function joursEntre(debutIso: string, finIso: string): number {
  const debut = new Date(debutIso).setHours(0, 0, 0, 0);
  const fin = new Date(finIso).setHours(0, 0, 0, 0);
  return Math.round((fin - debut) / MS_PAR_JOUR);
}

/** « Il y a 2j », « Aujourd'hui », « Il y a 18j » */
export function formatDepuis(iso: string, maintenant: Date = new Date()): string {
  const jours = joursEntre(iso, maintenant.toISOString());

  if (jours <= 0) return "Aujourd'hui";
  if (jours === 1) return 'Hier';
  return `Il y a ${jours}j`;
}

/** « dans 2 jours », « demain », « en retard » */
export function formatDansCombien(iso: string, maintenant: Date = new Date()): string {
  const jours = joursEntre(maintenant.toISOString(), iso);

  if (jours < 0) return 'en retard';
  if (jours === 0) return "aujourd'hui";
  if (jours === 1) return 'demain';
  return `dans ${jours} jours`;
}

/**
 * Statut d'un dossier déduit de sa dernière saisie.
 * Seuils métier : au-delà de 15 jours sans saisie le dossier est en retard,
 * au-delà de 7 jours il demande de l'attention.
 */
export function statutDepuisDerniereSaisie(
  derniereSaisieIso: string,
  maintenant: Date = new Date()
): StatutSuivi {
  const jours = joursEntre(derniereSaisieIso, maintenant.toISOString());

  if (jours > 15) return 'RETARD';
  if (jours > 7) return 'ATTENTION';
  return 'OK';
}

/**
 * Urgence d'une échéance fiscale, pour choisir la couleur de la carte.
 */
export function urgenceEcheance(
  dateEcheanceIso: string,
  maintenant: Date = new Date()
): 'CRITIQUE' | 'PROCHE' | 'LOINTAINE' {
  const jours = joursEntre(maintenant.toISOString(), dateEcheanceIso);

  if (jours <= 3) return 'CRITIQUE';
  if (jours <= 15) return 'PROCHE';
  return 'LOINTAINE';
}

/** Date du jour au format `YYYY-MM-DD`, pour les valeurs par défaut des `<input type="date">`. */
export function aujourdhuiIso(): string {
  return new Date().toISOString().slice(0, 10);
}
