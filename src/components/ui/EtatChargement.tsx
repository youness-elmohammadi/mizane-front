/**
 * États transverses : chargement, erreur, liste vide.
 * Regroupés ici pour que toutes les pages réagissent de la même façon.
 */

interface ChargementProps {
  message?: string;
}

export function Chargement({ message = 'Chargement…' }: ChargementProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <svg
        className="animate-spin mb-3"
        width="28"
        height="28"
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
      <p className="text-sm">{message}</p>
    </div>
  );
}

interface ErreurProps {
  message?: string;
  onReessayer?: () => void;
}

export function Erreur({
  message = 'Impossible de charger les données.',
  onReessayer,
}: ErreurProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <i
        className="fa-solid fa-triangle-exclamation text-red-400 text-2xl mb-3"
        aria-hidden="true"
      />
      <p className="text-sm text-gray-600 mb-3">{message}</p>
      {onReessayer && (
        <button
          type="button"
          onClick={onReessayer}
          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
        >
          Réessayer
        </button>
      )}
    </div>
  );
}

interface VideProps {
  icone?: string;
  titre: string;
  description?: string;
}

export function Vide({ icone = 'fa-inbox', titre, description }: VideProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <i className={`fa-solid ${icone} text-gray-300 text-3xl mb-3`} aria-hidden="true" />
      <p className="text-gray-600 font-medium text-sm">{titre}</p>
      {description && (
        <p className="text-gray-400 text-xs mt-1">{description}</p>
      )}
    </div>
  );
}
