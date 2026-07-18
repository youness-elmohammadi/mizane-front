import type { ButtonHTMLAttributes, ReactNode } from 'react';

/**
 * Bouton de l'application. Les variantes reprennent celles du prototype :
 * indigo pour l'action principale, contour gris pour les actions secondaires,
 * rouge pour l'export PDF.
 */

type Variante = 'primaire' | 'secondaire' | 'danger' | 'fantome';
type Taille = 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  taille?: Taille;
  /** Classe Font Awesome, ex. « fa-plus ». */
  icone?: string;
  /** Affiche un spinner et désactive le bouton. */
  chargement?: boolean;
  /** Occupe toute la largeur disponible. */
  pleineLargeur?: boolean;
  children?: ReactNode;
}

const VARIANTES: Record<Variante, string> = {
  primaire:
    'bg-indigo-600 hover:bg-indigo-700 text-white focus-visible:ring-indigo-500',
  secondaire:
    'border border-gray-200 hover:bg-gray-50 text-gray-700 focus-visible:ring-gray-400',
  danger: 'bg-red-600 hover:bg-red-700 text-white focus-visible:ring-red-500',
  fantome:
    'text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 focus-visible:ring-indigo-500',
};

const TAILLES: Record<Taille, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
};

export default function Button({
  variante = 'primaire',
  taille = 'md',
  icone,
  chargement = false,
  pleineLargeur = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || chargement}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium',
        'transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:opacity-60 disabled:cursor-not-allowed',
        VARIANTES[variante],
        TAILLES[taille],
        pleineLargeur ? 'w-full' : '',
        className,
      ].join(' ')}
    >
      {chargement ? (
        <Spinner />
      ) : (
        icone && <i className={`fa-solid ${icone}`} aria-hidden="true" />
      )}
      {children}
    </button>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        className="opacity-25"
      />
      <path
        fill="currentColor"
        className="opacity-75"
        d="M4 12a8 8 0 0 1 8-8V0C5.37 0 0 5.37 0 12h4Z"
      />
    </svg>
  );
}
