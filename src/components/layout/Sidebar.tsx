import { useAuth } from '../../hooks/useAuth';
import { useUiStore } from '../../store/uiStore';
import type { Role } from '../../types/auth.types';
import NavItem from './NavItem';

const ROLE_LABELS: Record<Role, string> = {
  GERANT: 'Gérant',
  ASSISTANT: 'Assistant',
  CLIENT: 'Client',
};

const SECTIONS = [
  {
    titre: 'Principal',
    items: [
      { to: '/dashboard', icon: 'fa-house', label: 'Tableau de bord' },
      { to: '/dossiers', icon: 'fa-folder', label: 'Dossiers' },
    ],
  },
  {
    titre: 'Comptabilité',
    items: [
      { to: '/saisie', icon: 'fa-pencil', label: 'Saisie comptable' },
      { to: '/bilan', icon: 'fa-chart-bar', label: 'Bilan' },
      { to: '/cpc', icon: 'fa-chart-line', label: 'CPC' },
    ],
  },
  {
    titre: 'Client',
    items: [{ to: '/portail', icon: 'fa-globe', label: 'Portail client' }],
  },
];

function getInitiales(nom: string): string {
  return nom
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((mot) => mot.charAt(0))
    .join('')
    .toUpperCase();
}

export default function Sidebar() {
  const { user, deconnexion } = useAuth();
  const toggleChat = useUiStore((state) => state.toggleChat);

  return (
    <aside className="w-64 bg-slate-900 flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-500 rounded-lg flex items-center justify-center">
            <i
              className="fa-solid fa-scale-balanced text-white text-sm"
              aria-hidden="true"
            />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-none">Mizan</p>
            <p className="text-slate-400 text-xs">Cabinet Expertise Maroc</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {SECTIONS.map((section, index) => (
          <div key={section.titre} className="space-y-1">
            <p
              className={`text-slate-500 text-xs font-semibold uppercase px-3 pb-2 tracking-wider ${
                index > 0 ? 'pt-4' : ''
              }`}
            >
              {section.titre}
            </p>
            {section.items.map((item) => (
              <NavItem
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
              />
            ))}
          </div>
        ))}

        {/* Agent IA — pas une route, un panneau */}
        <NavItem icon="fa-robot" label="Agent IA" onClick={toggleChat} />
      </nav>

      {/* Utilisateur */}
      <div className="px-4 py-4 border-t border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
            {user ? getInitiales(user.nom) : '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-slate-200 text-sm font-medium truncate">
              {user?.nom ?? 'Utilisateur'}
            </p>
            <p className="text-slate-500 text-xs">
              {user ? ROLE_LABELS[user.role] : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={deconnexion}
            aria-label="Se déconnecter"
            title="Se déconnecter"
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            <i
              className="fa-solid fa-right-from-bracket text-xs"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
    </aside>
  );
}