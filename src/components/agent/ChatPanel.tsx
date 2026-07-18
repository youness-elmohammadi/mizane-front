import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useLocation } from 'react-router-dom';

import { useAgent } from '../../hooks/useAgent';
import { useAuth } from '../../hooks/useAuth';
import type { AvisMessage, MessageChat } from '../../services/agentService';
import TexteFormate from './TexteFormate';

/**
 * Panneau latéral de l'assistant IA (ticket S1-F07).
 *
 * Le bandeau indique la page consultée : ce contexte est transmis à l'agent
 * pour qu'il puisse répondre en tenant compte de l'endroit où se trouve
 * l'utilisateur.
 */

/** Correspondance route → libellé affiché dans le bandeau de contexte. */
const LIBELLES_PAGES: Record<string, string> = {
  '/dashboard': 'Tableau de bord',
  '/dossiers': 'Dossiers',
  '/saisie': 'Saisie comptable',
  '/bilan': 'Bilan',
  '/cpc': 'CPC',
  '/portail': 'Portail client',
};

function initiales(nom: string): string {
  return nom
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((mot) => mot.charAt(0))
    .join('')
    .toUpperCase();
}

export default function ChatPanel() {
  const { ouvert, fermer, messages, enAttente, initialiser, envoyer, noter } =
    useAgent();

  const { user } = useAuth();
  const { pathname } = useLocation();
  const pageCourante = LIBELLES_PAGES[pathname] ?? 'Mizan';

  const [saisie, setSaisie] = useState('');
  const finDeListe = useRef<HTMLDivElement>(null);

  // Message d'accueil, posé une seule fois dès que l'utilisateur est connu.
  useEffect(() => {
    if (user) initialiser(user.nom.split(' ')[0]);
  }, [user, initialiser]);

  // Défile vers le bas à chaque nouveau message.
  useEffect(() => {
    finDeListe.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, enAttente]);

  // Échap ferme le panneau.
  useEffect(() => {
    if (!ouvert) return;

    const surTouche = (e: KeyboardEvent) => {
      if (e.key === 'Escape') fermer();
    };
    document.addEventListener('keydown', surTouche);
    return () => document.removeEventListener('keydown', surTouche);
  }, [ouvert, fermer]);

  const soumettre = (e: FormEvent) => {
    e.preventDefault();

    const question = saisie.trim();
    if (question === '' || enAttente) return;

    setSaisie('');
    void envoyer(question, pageCourante);
  };

  return (
    /*
     * Panneau toujours monté, translaté hors écran quand il est fermé :
     * cela permet d'animer la transition et de conserver la position de
     * défilement de la conversation.
     */
    <aside
      aria-label="Assistant Mizan IA"
      aria-hidden={!ouvert}
      className={`fixed right-0 top-0 h-full w-96 max-w-full bg-white shadow-2xl z-40
                  flex flex-col border-l border-gray-100
                  transition-transform duration-300 ease-in-out
                  ${ouvert ? 'translate-x-0' : 'translate-x-full'}`}
    >
      {/* En-tête */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-indigo-600 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <i className="fa-solid fa-robot text-white text-sm" aria-hidden="true" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Mizan IA</p>
            <p className="text-indigo-200 text-xs">Assistant comptable</p>
          </div>
        </div>
        <button
          type="button"
          onClick={fermer}
          aria-label="Fermer l'assistant"
          className="text-white/70 hover:text-white transition-colors"
        >
          <i className="fa-solid fa-xmark" aria-hidden="true" />
        </button>
      </div>

      {/* Bandeau de contexte — se met à jour selon la route */}
      <div className="px-4 py-2 bg-indigo-50 border-b border-indigo-100 flex-shrink-0">
        <span className="text-indigo-600 text-xs font-medium flex items-center gap-1.5">
          <i className="fa-solid fa-location-dot" aria-hidden="true" />
          {pageCourante}
        </span>
      </div>

      {/* Fil de conversation */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) =>
          message.auteur === 'AGENT' ? (
            <MessageAgent
              key={message.id}
              message={message}
              onNoter={noter}
              /* Pas de vote sur le message d'accueil : ce n'est pas une réponse. */
              notable={message.id !== 'accueil'}
            />
          ) : (
            <MessageUtilisateur
              key={message.id}
              message={message}
              initiales={user ? initiales(user.nom) : '?'}
            />
          )
        )}

        {enAttente && <IndicateurEcriture />}
        <div ref={finDeListe} />
      </div>

      {/* Saisie */}
      <form onSubmit={soumettre} className="p-4 border-t border-gray-100 flex-shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={saisie}
            onChange={(e) => setSaisie(e.target.value)}
            placeholder="Posez votre question..."
            aria-label="Votre question"
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={saisie.trim() === '' || enAttente}
            aria-label="Envoyer"
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50
                       disabled:cursor-not-allowed text-white w-9 h-9 rounded-xl
                       flex items-center justify-center flex-shrink-0 transition-colors"
          >
            <i className="fa-solid fa-paper-plane text-sm" aria-hidden="true" />
          </button>
        </div>
      </form>
    </aside>
  );
}

interface MessageAgentProps {
  message: MessageChat;
  onNoter: (messageId: string, avis: AvisMessage) => void;
  notable: boolean;
}

function MessageAgent({ message, onNoter, notable }: MessageAgentProps) {
  return (
    <div className="flex gap-3">
      <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
        <i className="fa-solid fa-robot text-indigo-500 text-xs" aria-hidden="true" />
      </div>

      <div className="space-y-2 max-w-[85%]">
        <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3 text-sm text-gray-700">
          <TexteFormate texte={message.contenu} />
        </div>

        {notable && (
          <div className="flex gap-2">
            <BoutonAvis
              actif={message.avis === 'UTILE'}
              onClick={() => onNoter(message.id, 'UTILE')}
              emoji="👍"
              libelle="Utile"
            />
            <BoutonAvis
              actif={message.avis === 'A_AMELIORER'}
              onClick={() => onNoter(message.id, 'A_AMELIORER')}
              emoji="👎"
              libelle="À améliorer"
            />
          </div>
        )}
      </div>
    </div>
  );
}

interface BoutonAvisProps {
  actif: boolean;
  onClick: () => void;
  emoji: string;
  libelle: string;
}

function BoutonAvis({ actif, onClick, emoji, libelle }: BoutonAvisProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={actif}
      className={`text-xs border rounded-full px-3 py-1 flex items-center gap-1
                  transition-colors
                  ${
                    actif
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                      : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
    >
      <span aria-hidden="true">{emoji}</span> {libelle}
    </button>
  );
}

function MessageUtilisateur({
  message,
  initiales,
}: {
  message: MessageChat;
  initiales: string;
}) {
  return (
    <div className="flex gap-3 flex-row-reverse">
      <div className="w-7 h-7 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
        {initiales}
      </div>
      <div className="bg-indigo-600 rounded-2xl rounded-tr-none px-4 py-3 text-sm text-white max-w-[85%]">
        {message.contenu}
      </div>
    </div>
  );
}

/** Trois points animés pendant que l'agent « réfléchit ». */
function IndicateurEcriture() {
  return (
    <div className="flex gap-3">
      <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
        <i className="fa-solid fa-robot text-indigo-500 text-xs" aria-hidden="true" />
      </div>
      <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3.5 flex gap-1.5">
        {[0, 150, 300].map((delai) => (
          <span
            key={delai}
            className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: `${delai}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
