import type { Ecriture } from '../types/ecriture';

/**
 * Écritures de démonstration (S2-F01, mockées jusqu'à S2-F03).
 * 4 écritures pour illustrer TOUS les badges :
 *  - ecr-2 est contre-passée (badge orange),
 *  - ecr-3 est CLOS (badge gris),
 *  - ecr-4 est la contre-passation de ecr-2 (badge violet « CP de … »).
 */
export const MOCK_ECRITURES: Ecriture[] = [
  {
    id: 'ecr-1',
    journal: 'AC',
    dateEcriture: '2026-01-15',
    pieceRef: 'AC-2026-00001',
    libelle: 'Fournisseur Dupont — facture F-2026-042',
    statut: 'VALIDE',
    totalDebit: 1440,
    totalCredit: 1440,
    contrepassePar: null,
    originalDe: null,
    lignes: [
      { id: 'l1', compteNum: '6111', compteLib: 'Achats de marchandises', libelle: 'Marchandises', debit: 1200, credit: 0 },
      { id: 'l2', compteNum: '3455', compteLib: 'État — TVA récupérable', libelle: 'TVA 20 %', debit: 240, credit: 0 },
      { id: 'l3', compteNum: '4411', compteLib: 'Fournisseurs', libelle: 'Dupont', debit: 0, credit: 1440 },
    ],
  },
  {
    id: 'ecr-2',
    journal: 'VE',
    dateEcriture: '2026-01-18',
    pieceRef: 'VE-2026-00001',
    libelle: 'Vente client Tazi',
    statut: 'VALIDE',
    totalDebit: 6000,
    totalCredit: 6000,
    contrepassePar: 'ecr-4',
    originalDe: null,
    lignes: [
      { id: 'l4', compteNum: '3421', compteLib: 'Clients', libelle: 'Tazi', debit: 6000, credit: 0 },
      { id: 'l5', compteNum: '7111', compteLib: 'Ventes de marchandises', libelle: 'Vente', debit: 0, credit: 6000 },
    ],
  },
  {
    id: 'ecr-3',
    journal: 'OD',
    dateEcriture: '2026-01-05',
    pieceRef: 'OD-2026-00001',
    libelle: 'Salaires décembre',
    statut: 'CLOS',
    totalDebit: 25000,
    totalCredit: 25000,
    contrepassePar: null,
    originalDe: null,
    lignes: [
      { id: 'l6', compteNum: '6171', compteLib: 'Rémunérations du personnel', libelle: 'Salaires', debit: 25000, credit: 0 },
      { id: 'l7', compteNum: '4432', compteLib: 'Rémunérations dues au personnel', libelle: 'Net à payer', debit: 0, credit: 25000 },
    ],
  },
  {
    id: 'ecr-4',
    journal: 'AN',
    dateEcriture: '2026-01-20',
    pieceRef: 'AN-2026-00001',
    libelle: 'CONTREPASSATION de VE-2026-00001 — Vente client Tazi',
    statut: 'VALIDE',
    totalDebit: 6000,
    totalCredit: 6000,
    contrepassePar: null,
    originalDe: 'ecr-2',
    lignes: [
      { id: 'l8', compteNum: '3421', compteLib: 'Clients', libelle: 'Tazi', debit: 0, credit: 6000 },
      { id: 'l9', compteNum: '7111', compteLib: 'Ventes de marchandises', libelle: 'Vente', debit: 6000, credit: 0 },
    ],
  },
];
