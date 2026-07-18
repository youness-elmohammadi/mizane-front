import { Bar } from 'react-chartjs-2';
import './setup';
import { COULEURS } from './setup';
import type { Cpc } from '../../types/etats.types';

/** Comparatif N / N-1 des grands agrégats du CPC, en milliers de dirhams. */

interface GraphiqueCpcProps {
  cpc: Cpc;
}

/** Centimes → milliers de dirhams (l'axe est libellé en « k »). */
const enMilliers = (centimes: number): number =>
  Math.round(centimes / 100 / 1000);

export default function GraphiqueCpc({ cpc }: GraphiqueCpcProps) {
  const chargesN =
    cpc.chiffreAffairesN - cpc.resultatExploitationN;
  const chargesN1 =
    cpc.chiffreAffairesN1 - cpc.resultatExploitationN1;

  return (
    <Bar
      height={280}
      data={{
        labels: [
          'Produits exploit.',
          'Charges exploit.',
          'Résultat exploit.',
          'Résultat net',
        ],
        datasets: [
          {
            label: String(cpc.exercice),
            data: [
              enMilliers(cpc.chiffreAffairesN),
              enMilliers(chargesN),
              enMilliers(cpc.resultatExploitationN),
              enMilliers(cpc.resultatNetN),
            ],
            backgroundColor: COULEURS.indigoBarre,
            borderRadius: 6,
          },
          {
            label: String(cpc.exercice - 1),
            data: [
              enMilliers(cpc.chiffreAffairesN1),
              enMilliers(chargesN1),
              enMilliers(cpc.resultatExploitationN1),
              enMilliers(cpc.resultatNetN1),
            ],
            backgroundColor: COULEURS.ardoise,
            borderRadius: 6,
          },
        ],
      }}
      options={{
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { font: { size: 11 } } },
        },
        scales: {
          y: {
            grid: { color: COULEURS.grille },
            ticks: { callback: (valeur) => `${valeur}k` },
          },
          x: { grid: { display: false }, ticks: { font: { size: 10 } } },
        },
      }}
    />
  );
}
