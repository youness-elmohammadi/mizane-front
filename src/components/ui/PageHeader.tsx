import type { ReactNode } from 'react';

/**
 * En-tête de page : titre à gauche, actions à droite.
 * Uniformise l'espacement sur toutes les pages.
 */

interface PageHeaderProps {
  titre: string;
  sousTitre?: string;
  actions?: ReactNode;
}

export default function PageHeader({
  titre,
  sousTitre,
  actions,
}: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{titre}</h1>
        {sousTitre && <p className="text-gray-500 text-sm mt-1">{sousTitre}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
