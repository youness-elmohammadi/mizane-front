import type { ReactNode } from 'react';

/**
 * Carte blanche à coins arrondis — le conteneur de base du prototype.
 */

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  titre: string;
  action?: ReactNode;
  className?: string;
}

export function CardHeader({ titre, action, className = '' }: CardHeaderProps) {
  return (
    <div
      className={`flex items-center justify-between px-5 py-4 border-b border-gray-100 ${className}`}
    >
      <h2 className="font-semibold text-gray-900">{titre}</h2>
      {action}
    </div>
  );
}

interface CarteKpiProps {
  libelle: string;
  valeur: string;
  icone: string;
  /** Couleur de l'icône et de sa pastille. */
  ton?: 'indigo' | 'rouge' | 'orange' | 'vert';
  /** Ligne de commentaire sous la valeur. */
  detail?: ReactNode;
  /** Colore la valeur elle-même (ex. le nombre de dossiers en retard). */
  valeurEnCouleur?: boolean;
}

const TONS_KPI = {
  indigo: { fond: 'bg-indigo-50', icone: 'text-indigo-500', valeur: 'text-gray-900' },
  rouge: { fond: 'bg-red-50', icone: 'text-red-500', valeur: 'text-red-600' },
  orange: { fond: 'bg-orange-50', icone: 'text-orange-500', valeur: 'text-orange-600' },
  vert: { fond: 'bg-green-50', icone: 'text-green-500', valeur: 'text-green-600' },
} as const;

/** Carte KPI du tableau de bord. */
export function CarteKpi({
  libelle,
  valeur,
  icone,
  ton = 'indigo',
  detail,
  valeurEnCouleur = false,
}: CarteKpiProps) {
  const couleurs = TONS_KPI[ton];

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-500 text-sm">{libelle}</span>
        <div
          className={`w-9 h-9 ${couleurs.fond} rounded-lg flex items-center justify-center`}
        >
          <i
            className={`fa-solid ${icone} ${couleurs.icone} text-sm`}
            aria-hidden="true"
          />
        </div>
      </div>
      <p
        className={`text-3xl font-bold tabular ${
          valeurEnCouleur ? couleurs.valeur : 'text-gray-900'
        }`}
      >
        {valeur}
      </p>
      {detail && <div className="text-xs mt-1">{detail}</div>}
    </Card>
  );
}
