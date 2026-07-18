/**
 * Données mockées des dossiers clients — source unique de vérité.
 *
 * Emplacement imposé par le ticket S1-F05. Les champs `ice`, `responsableNom`
 * et `statut` ont été ajoutés au socle du ticket car la page « Dossiers clients »
 * (S1-F06) les affiche en colonnes, et `derniereSaisie` car le tableau de bord
 * en déduit le statut de suivi (OK / Attention / En retard).
 */

import type { Dossier } from '../types/dossier.types';

/** Date ISO située il y a `n` jours — garde les statuts « vivants » à chaque exécution. */
function ilYaJours(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export const MOCK_DOSSIERS: Dossier[] = [
  {
    id: '1',
    raisonSociale: 'SARL Bensalah Import-Export',
    formeJuridique: 'SARL',
    regimeTva: 'MENSUEL',
    ice: '001234567000012',
    responsableNom: 'Sara Idrissi',
    statut: 'ACTIF',
    derniereSaisie: ilYaJours(2),
  },
  {
    id: '2',
    raisonSociale: 'SA Atlas Holding',
    formeJuridique: 'SA',
    regimeTva: 'TRIMESTRIEL',
    ice: '002345678000089',
    responsableNom: 'Youssef Amrani',
    statut: 'ACTIF',
    derniereSaisie: ilYaJours(9),
  },
  {
    id: '3',
    raisonSociale: 'Auto-ent. Kamal Tazi',
    formeJuridique: 'AUTO_ENTREPRENEUR',
    regimeTva: 'NON_ASSUJETTI',
    ice: null,
    responsableNom: 'Sara Idrissi',
    statut: 'ACTIF',
    derniereSaisie: ilYaJours(18),
  },
  {
    id: '4',
    raisonSociale: 'SNC Amine & Frères',
    formeJuridique: 'SNC',
    regimeTva: 'MENSUEL',
    ice: '003456789000045',
    responsableNom: 'Youssef Amrani',
    statut: 'ACTIF',
    derniereSaisie: ilYaJours(1),
  },
  {
    id: '5',
    raisonSociale: 'SARL Rim Consulting',
    formeJuridique: 'SARL',
    regimeTva: 'TRIMESTRIEL',
    ice: '004567890000078',
    responsableNom: 'Sara Idrissi',
    statut: 'ARCHIVE',
    derniereSaisie: ilYaJours(22),
  },
];

/**
 * Exercices proposés dans le sélecteur.
 * Le ticket demande « 2025 / 2024 en dropdown simple » : la liste est donc
 * globale et non rattachée à un dossier.
 */
export const EXERCICES = ['2025', '2024'] as const;

export const EXERCICE_DEFAUT = '2025';
