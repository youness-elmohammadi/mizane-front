/**
 * Enregistrement des modules Chart.js.
 *
 * Chart.js v4 est « tree-shakable » : rien n'est actif par défaut, il faut
 * déclarer les éléments utilisés. On les enregistre une seule fois ici,
 * et chaque composant de graphique importe simplement ce fichier.
 */

import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip,
  Legend
);

/** Palette alignée sur celle du prototype (indigo Tailwind). */
export const COULEURS = {
  indigo: '#6366f1',
  indigoTransparent: 'rgba(99, 102, 241, 0.08)',
  indigoBarre: 'rgba(99, 102, 241, 0.8)',
  ardoise: 'rgba(203, 213, 225, 0.8)',
  grille: '#f1f5f9',
} as const;
