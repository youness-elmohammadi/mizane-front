import { useId } from 'react';
import type { InputHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react';

/**
 * Champs de formulaire. `useId` génère un identifiant unique et stable,
 * ce qui garantit la liaison label ↔ champ sans avoir à la gérer à la main
 * (accessibilité : cliquer le libellé donne le focus au champ).
 */

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  /** Message d'erreur affiché sous le champ. */
  erreur?: string;
  /** Icône Font Awesome placée à gauche du champ. */
  icone?: string;
}

const BASE_CHAMP =
  'w-full border rounded-lg px-3 py-2 text-sm bg-white ' +
  'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ' +
  'disabled:bg-gray-50 disabled:text-gray-400';

export default function Input({
  label,
  erreur,
  icone,
  className = '',
  ...props
}: InputProps) {
  const id = useId();
  const idErreur = `${id}-erreur`;

  return (
    <div>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {icone && (
          <i
            className={`fa-solid ${icone} absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm`}
            aria-hidden="true"
          />
        )}
        <input
          {...props}
          id={id}
          aria-invalid={erreur ? true : undefined}
          aria-describedby={erreur ? idErreur : undefined}
          className={[
            BASE_CHAMP,
            icone ? 'pl-9' : '',
            erreur ? 'border-red-300' : 'border-gray-200',
            className,
          ].join(' ')}
        />
      </div>

      {erreur && (
        <p id={idErreur} className="mt-1 text-xs text-red-600">
          {erreur}
        </p>
      )}
    </div>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  children: ReactNode;
}

export function Select({ label, children, className = '', ...props }: SelectProps) {
  const id = useId();

  return (
    <div>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      <select
        {...props}
        id={id}
        className={[BASE_CHAMP, 'border-gray-200 text-gray-700', className].join(
          ' '
        )}
      >
        {children}
      </select>
    </div>
  );
}
