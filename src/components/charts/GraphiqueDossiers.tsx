import { Line } from 'react-chartjs-2';
import './setup';
import { COULEURS } from './setup';

/** Courbe d'évolution du nombre de dossiers actifs (tableau de bord). */

interface GraphiqueDossiersProps {
  donnees: Array<{ mois: string; valeur: number }>;
}

export default function GraphiqueDossiers({ donnees }: GraphiqueDossiersProps) {
  // L'axe ne démarre pas à zéro : on veut lire la tendance, pas la valeur absolue.
  const minimum = Math.max(0, Math.min(...donnees.map((d) => d.valeur)) - 3);

  return (
    <Line
      height={120}
      data={{
        labels: donnees.map((d) => d.mois),
        datasets: [
          {
            label: 'Dossiers actifs',
            data: donnees.map((d) => d.valeur),
            borderColor: COULEURS.indigo,
            backgroundColor: COULEURS.indigoTransparent,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: COULEURS.indigo,
            pointRadius: 4,
          },
        ],
      }}
      options={{
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: false,
            min: minimum,
            grid: { color: COULEURS.grille },
          },
          x: { grid: { display: false } },
        },
      }}
    />
  );
}
