/**
 * Point de bascule mocks → API.
 *
 * Tant que le backend Spring Boot n'expose pas ses endpoints, les services
 * renvoient les données de src/mocks/. Pour passer sur l'API réelle il suffit
 * de définir VITE_API_URL dans .env.local : aucune page, aucun hook ne change.
 */

export const API_URL = import.meta.env.VITE_API_URL ?? '';

/** true tant qu'aucune URL d'API n'est configurée. */
export const USE_MOCKS = API_URL === '';

/**
 * Simule la latence réseau pour que les états de chargement de l'interface
 * soient réellement visibles pendant le développement.
 */
export function delaiSimule<T>(donnees: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(donnees), ms));
}
