/**
 * Agent IA — assistant comptable (ticket S1-F07).
 *
 * Comportement mocké imposé par le ticket : rotation des réponses avec une
 * latence simulée d'une seconde. Le backend branchera l'API Anthropic
 * (ANTHROPIC_API_KEY est déjà prévue dans .env.local) : la signature de
 * `envoyerMessage` ne changera pas.
 */

import api from './api';
import { USE_MOCKS } from './config';

export type AvisMessage = 'UTILE' | 'A_AMELIORER';

export interface MessageChat {
  id: string;
  auteur: 'UTILISATEUR' | 'AGENT';
  contenu: string;
  horodatage: string;
  /** Retour de l'utilisateur sur une réponse de l'agent (👍 / 👎). */
  avis?: AvisMessage;
}

export interface ContexteAgent {
  /** Page consultée, affichée dans le bandeau du panneau de chat. */
  page: string;
  dossierNom?: string;
}

/** Réponses mockées, servies en rotation (une par message envoyé). */
export const MOCK_RESPONSES = [
  'Je suis votre assistant comptable Mizan. Comment puis-je vous aider ?',
  'La TVA mensuelle est due avant le 20 de chaque mois sur Simpl-TVA. ⚠️ Information indicative.',
  'Pour saisir une écriture, allez dans Saisie comptable → Nouvelle écriture.',
];

/**
 * Index de rotation, au niveau du module : il continue d'avancer même si le
 * panneau de chat est démonté puis remonté.
 */
let indexRotation = 0;

/** Remet la rotation à zéro (utilisé à la déconnexion et par les tests). */
export function reinitialiserRotation(): void {
  indexRotation = 0;
}

const LATENCE_MOCK_MS = 1000;

export async function envoyerMessage(
  question: string,
  contexte: ContexteAgent
): Promise<MessageChat> {
  if (!USE_MOCKS) {
    const { data } = await api.post<MessageChat>('/api/agent/messages', {
      question,
      contexte,
    });
    return data;
  }

  const contenu = MOCK_RESPONSES[indexRotation % MOCK_RESPONSES.length];
  indexRotation += 1;

  // Latence simulée : sans elle, l'indicateur « en train d'écrire » ne serait
  // jamais visible et l'interface paraîtrait irréaliste.
  await new Promise((resolve) => setTimeout(resolve, LATENCE_MOCK_MS));

  return {
    id: crypto.randomUUID(),
    auteur: 'AGENT',
    contenu,
    horodatage: new Date().toISOString(),
  };
}

/**
 * Remonte l'avis 👍 / 👎 de l'utilisateur.
 * En mock on ne fait rien d'autre que résoudre : l'avis est déjà stocké
 * localement par useAgent pour l'affichage.
 */
export async function noterReponse(
  messageId: string,
  avis: AvisMessage
): Promise<void> {
  if (!USE_MOCKS) {
    await api.post(`/api/agent/messages/${messageId}/avis`, { avis });
  }
}

/** Message d'accueil affiché à l'ouverture du panneau. */
export function messageAccueil(prenom: string): MessageChat {
  return {
    id: 'accueil',
    auteur: 'AGENT',
    contenu:
      `Bonjour ${prenom} ! Je suis votre assistant comptable. ` +
      'Je peux vous aider avec la navigation, les règles PCGE, ou les échéances fiscales marocaines. ' +
      'Comment puis-je vous aider ?',
    horodatage: new Date().toISOString(),
  };
}
