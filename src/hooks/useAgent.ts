/**
 * État du chat de l'agent IA : ouvert/fermé + messages (ticket S1-F07).
 *
 * Les messages vivent dans un store Zustand et non dans un useState de
 * ChatPanel : le bouton flottant est un composant séparé, et la conversation
 * doit survivre à un démontage du panneau ou à un changement de page.
 *
 * L'état ouvert/fermé reste dans uiStore, qui en est déjà propriétaire —
 * on évite ainsi deux sources de vérité pour la même information.
 */

import { create } from 'zustand';

import { useUiStore } from '../store/uiStore';
import {
  envoyerMessage,
  noterReponse,
  messageAccueil,
  type AvisMessage,
  type MessageChat,
} from '../services/agentService';

interface AgentState {
  messages: MessageChat[];
  enAttente: boolean;
  initialiser: (prenom: string) => void;
  envoyer: (question: string, page: string) => Promise<void>;
  noter: (messageId: string, avis: AvisMessage) => void;
  reinitialiser: () => void;
}

const useAgentStore = create<AgentState>((set, get) => ({
  messages: [],
  enAttente: false,

  /** Pose le message d'accueil, une seule fois. */
  initialiser: (prenom) => {
    if (get().messages.length > 0) return;
    set({ messages: [messageAccueil(prenom)] });
  },

  envoyer: async (question, page) => {
    const messageUtilisateur: MessageChat = {
      id: crypto.randomUUID(),
      auteur: 'UTILISATEUR',
      contenu: question,
      horodatage: new Date().toISOString(),
    };

    set((etat) => ({
      messages: [...etat.messages, messageUtilisateur],
      enAttente: true,
    }));

    try {
      const reponse = await envoyerMessage(question, { page });
      set((etat) => ({ messages: [...etat.messages, reponse] }));
    } catch {
      set((etat) => ({
        messages: [
          ...etat.messages,
          {
            id: crypto.randomUUID(),
            auteur: 'AGENT',
            contenu:
              "Je n'ai pas pu traiter votre demande. Réessayez dans un instant.",
            horodatage: new Date().toISOString(),
          },
        ],
      }));
    } finally {
      set({ enAttente: false });
    }
  },

  /** Enregistre l'avis 👍 / 👎 ; un second clic sur le même avis l'annule. */
  noter: (messageId, avis) => {
    set((etat) => ({
      messages: etat.messages.map((m) =>
        m.id === messageId
          ? { ...m, avis: m.avis === avis ? undefined : avis }
          : m
      ),
    }));

    // Remontée au serveur en arrière-plan : un échec ne doit pas casser l'UI.
    void noterReponse(messageId, avis).catch(() => undefined);
  },

  reinitialiser: () => set({ messages: [], enAttente: false }),
}));

/** Hook unique consommé par ChatPanel et ChatFloatingButton. */
export function useAgent() {
  const ouvert = useUiStore((state) => state.chatOpen);
  const basculer = useUiStore((state) => state.toggleChat);
  const fermer = useUiStore((state) => state.closeChat);

  const messages = useAgentStore((state) => state.messages);
  const enAttente = useAgentStore((state) => state.enAttente);
  const initialiser = useAgentStore((state) => state.initialiser);
  const envoyer = useAgentStore((state) => state.envoyer);
  const noter = useAgentStore((state) => state.noter);
  const reinitialiser = useAgentStore((state) => state.reinitialiser);

  return {
    ouvert,
    basculer,
    fermer,
    messages,
    enAttente,
    initialiser,
    envoyer,
    noter,
    reinitialiser,
  };
}
