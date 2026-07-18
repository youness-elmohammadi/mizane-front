import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { COMPTES_DEMO_PUBLICS } from "../../services/authService";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { connexion } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Route demandée avant la redirection vers /login — on y retourne après connexion.
  const from = (location.state as { from?: { pathname: string} } | null)?.from?.pathname ?? '/dashboard';

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const utilisateur = await connexion(email, password);

      // Un client n'a accès qu'à son portail, pas aux outils du cabinet.
      navigate(utilisateur.role === 'CLIENT' ? '/portail' : from, {
        replace: true,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Email ou mot de passe incorrect'
      );
      setLoading(false);
    }
  };

  /** Pré-remplit le formulaire — pratique pour la démonstration. */
  const remplirCompte = (emailDemo: string) => {
    setEmail(emailDemo);
    setPassword('mizan2026');
    setError(null);
  };

  return(
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto pt-24 px-4">
        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">⚖️</div>
          <h1 className="text-3xl font-bold text-slate-900">Mizan</h1>
          <p className="text-sm text-gray-500 mt-1">SaaS Comptable Marocain</p>
        </div>

        {/* Carte */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">
            Connexion à votre espace
          </h2>

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-indigo-500
                           focus:border-indigo-500"
              />
            </div>

            {/* Mot de passe */}
            <div className="mb-6">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg
                             focus:outline-none focus:ring-2 focus:ring-indigo-500
                             focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={
                    showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'
                  }
                  className="absolute inset-y-0 right-0 px-3 flex items-center
                             text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Bouton */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2
                         bg-indigo-600 text-white font-medium py-2.5 rounded-lg
                         hover:bg-indigo-700 focus:outline-none focus:ring-2
                         focus:ring-indigo-500 focus:ring-offset-2
                         disabled:opacity-60 disabled:cursor-not-allowed
                         transition-colors"
            >
              {loading && <Spinner />}
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>

            {/* Erreur */}
            {error && (
              <div
                role="alert"
                className="mt-4 flex items-start gap-2 rounded-lg border
                           border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                <span aria-hidden="true">⚠️</span>
                <span>{error}</span>
              </div>
            )}
          </form>
        </div>

        {/* Comptes de démonstration — à retirer une fois le backend branché. */}
        <div className="mt-6">
          <p className="text-xs text-gray-400 text-center mb-2">
            Comptes de démonstration (mot de passe : mizan2026)
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {COMPTES_DEMO_PUBLICS.map((compte) => (
              <button
                key={compte.email}
                type="button"
                onClick={() => remplirCompte(compte.email)}
                className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1
                           text-gray-600 hover:bg-gray-50 hover:border-indigo-300 transition-colors"
              >
                {compte.nom}
                <span className="text-gray-400"> — {compte.role.toLowerCase()}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function EyeIcon() {
  return(
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.5 13.5 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin"
      width="16"
      height="16"
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