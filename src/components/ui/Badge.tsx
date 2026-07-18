import type { ReactNode } from 'react';
import type {
  StatutDossier,
  StatutSuivi,
  RegimeTva,
} from '../../types/dossier.types';

/**
 * Pastilles de statut. Les trois couleurs du prototype (vert / orange / rouge)
 * sont centralisées ici pour rester cohérentes d'un tableau à l'autre.
 */

export type TonBadge = 'vert' | 'orange' | 'rouge' | 'gris' | 'indigo';

const TONS: Record<TonBadge, string> = {
  vert: 'bg-green-100 text-green-700',
  orange: 'bg-orange-100 text-orange-700',
  rouge: 'bg-red-100 text-red-700',
  gris: 'bg-gray-100 text-gray-500',
  indigo: 'bg-indigo-100 text-indigo-700',
};

interface BadgeProps {
  ton?: TonBadge;
  icone?: string;
  children: ReactNode;
  className?: string;
}

export default function Badge({
  ton = 'gris',
  icone,
  children,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium',
        TONS[ton],
        className,
      ].join(' ')}
    >
      {icone && <i className={`fa-solid ${icone}`} aria-hidden="true" />}
      {children}
    </span>
  );
}

const LIBELLES_SUIVI: Record<StatutSuivi, { texte: string; ton: TonBadge }> = {
  OK: { texte: 'OK', ton: 'vert' },
  ATTENTION: { texte: 'Attention', ton: 'orange' },
  RETARD: { texte: 'En retard', ton: 'rouge' },
};

/** Pastille de SUIVI, déduite de la dernière saisie (tableau de bord). */
export function BadgeSuivi({ statut }: { statut: StatutSuivi }) {
  const { texte, ton } = LIBELLES_SUIVI[statut];
  return <Badge ton={ton}>{texte}</Badge>;
}

const LIBELLES_STATUT: Record<StatutDossier, { texte: string; ton: TonBadge }> = {
  ACTIF: { texte: 'Actif', ton: 'vert' },
  ARCHIVE: { texte: 'Archivé', ton: 'gris' },
};

/** Pastille de statut ADMINISTRATIF du dossier (page Dossiers clients). */
export function BadgeStatut({ statut }: { statut: StatutDossier }) {
  const { texte, ton } = LIBELLES_STATUT[statut];
  return <Badge ton={ton}>{texte}</Badge>;
}

const LIBELLES_TVA: Record<RegimeTva, { texte: string; ton: TonBadge }> = {
  MENSUEL: { texte: 'Mensuel', ton: 'vert' },
  TRIMESTRIEL: { texte: 'Trimestriel', ton: 'orange' },
  NON_ASSUJETTI: { texte: 'Non assujetti', ton: 'gris' },
};

export function BadgeTva({ regime }: { regime: RegimeTva }) {
  const { texte, ton } = LIBELLES_TVA[regime];
  return <Badge ton={ton}>{texte}</Badge>;
}
