/**
 * Jeu de données de démonstration.
 *
 * Reprend les chiffres du prototype HTML. C'est la SEULE source de fausses
 * données du projet : les services (src/services/) l'utilisent aujourd'hui et
 * basculeront sur l'API sans que les pages n'aient à changer.
 *
 * Rappel de convention : tous les montants sont en CENTIMES.
 */

import type { EcheanceFiscale, StatsCabinet } from '../types/dossier.types';
import type { Ecriture } from '../types/ecriture.types';
import type { Bilan, Cpc, DocumentPublie } from '../types/etats.types';

/** Raccourci : convertit des dirhams en centimes, pour garder les données lisibles. */
const mad = (dirhams: number): number => Math.round(dirhams * 100);

/** Date ISO située dans `n` jours. */
function dansJours(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export const CABINET_ID = 'cab-001';

/*
 * Les dossiers eux-mêmes vivent dans src/data/mock-dossiers.ts
 * (emplacement imposé par le ticket S1-F05). Les identifiants utilisés ici
 * ('1' à '5') sont ceux de ce fichier.
 */

// ─────────────────────────── ÉCHÉANCES FISCALES ──────────────────────────

export const MOCK_ECHEANCES: EcheanceFiscale[] = [
  {
    id: 'ech-001',
    dossierId: '3',
    dossierNom: 'Kamal Tazi',
    type: 'TVA',
    libelle: 'TVA mensuelle',
    dateEcheance: dansJours(2),
  },
  {
    id: 'ech-002',
    dossierId: '1',
    dossierNom: 'SARL Bensalah',
    type: 'TVA',
    libelle: 'TVA mensuelle',
    dateEcheance: dansJours(6),
  },
  {
    id: 'ech-003',
    dossierId: '2',
    dossierNom: 'SA Atlas',
    type: 'IS',
    libelle: 'IS — Acompte',
    dateEcheance: dansJours(8),
  },
  {
    id: 'ech-004',
    dossierId: '4',
    dossierNom: 'SNC Amine & Frères',
    type: 'TVA',
    libelle: 'TVA trimestrielle',
    dateEcheance: dansJours(22),
  },
  {
    id: 'ech-005',
    dossierId: '5',
    dossierNom: 'SARL Rim Consulting',
    type: 'TVA',
    libelle: 'TVA trimestrielle',
    dateEcheance: dansJours(28),
  },
];

// ──────────────────────────── STATS CABINET ─────────────────────────────

export const MOCK_STATS: StatsCabinet = {
  dossiersActifs: 24,
  nouveauxCeMois: 2,
  enRetard: 3,
  alertesFiscales: 5,
  revenusEstimesMad: mad(42_000),
  evolutionDossiers: [
    { mois: 'Fév', valeur: 18 },
    { mois: 'Mar', valeur: 19 },
    { mois: 'Avr', valeur: 21 },
    { mois: 'Mai', valeur: 21 },
    { mois: 'Juin', valeur: 22 },
    { mois: 'Juil', valeur: 24 },
  ],
};

// ───────────────────────────── ÉCRITURES ────────────────────────────────

/*
 * Chaque écriture est équilibrée : somme(débits) === somme(crédits).
 * Les totaux affichés dans la page Saisie sont recalculés à partir d'ici,
 * jamais codés en dur — c'est ce qui rend le contrôle d'équilibre réel.
 */
export const MOCK_ECRITURES: Ecriture[] = [
  {
    id: 'ecr-001',
    dossierId: '1',
    exercice: 2025,
    journal: 'AC',
    numeroPiece: 'AC-2025-00041',
    date: '2025-12-15',
    libelle: 'Achat marchandises — Fournisseur Alami',
    lignes: [
      {
        id: 'lig-001',
        compte: '6111',
        libelle: 'Achat marchandises — Fournisseur Alami',
        debit: mad(48_000),
        credit: 0,
        lettrage: 'A',
      },
      {
        id: 'lig-002',
        compte: '4411',
        libelle: 'Fournisseur Alami — Facture F-2025-892',
        debit: 0,
        credit: mad(48_000),
        lettrage: 'A',
      },
    ],
  },
  {
    id: 'ecr-002',
    dossierId: '1',
    exercice: 2025,
    journal: 'VE',
    numeroPiece: 'VE-2025-00089',
    date: '2025-12-18',
    libelle: 'Vente produits — Client Tazi SARL',
    lignes: [
      {
        id: 'lig-003',
        compte: '3421',
        libelle: 'Vente produits — Client Tazi SARL',
        debit: mad(72_000),
        credit: 0,
        lettrage: null,
      },
      {
        id: 'lig-004',
        compte: '7111',
        libelle: 'Produits — Facture V-2025-089',
        debit: 0,
        credit: mad(72_000),
        lettrage: null,
      },
    ],
  },
  {
    id: 'ecr-003',
    dossierId: '1',
    exercice: 2025,
    journal: 'BQ',
    numeroPiece: 'BQ-2025-00112',
    date: '2025-12-20',
    libelle: 'Règlement fournisseur Alami',
    lignes: [
      {
        id: 'lig-005',
        compte: '4411',
        libelle: 'Règlement fournisseur Alami',
        debit: mad(48_000),
        credit: 0,
        lettrage: 'A',
      },
      {
        id: 'lig-006',
        compte: '5141',
        libelle: 'Banque CIH — Virement sortant',
        debit: 0,
        credit: mad(48_000),
        lettrage: 'A',
      },
    ],
  },
  {
    id: 'ecr-004',
    dossierId: '1',
    exercice: 2025,
    journal: 'VE',
    numeroPiece: 'VE-2025-00090',
    date: '2025-12-22',
    libelle: 'Vente marchandises — Client Rim',
    lignes: [
      {
        id: 'lig-007',
        compte: '3421',
        libelle: 'Client Rim — Facture V-2025-090',
        debit: mad(38_400),
        credit: 0,
        lettrage: null,
      },
      {
        id: 'lig-008',
        compte: '7111',
        libelle: 'Ventes de marchandises',
        debit: 0,
        credit: mad(32_000),
        lettrage: null,
      },
      {
        id: 'lig-009',
        compte: '4455',
        libelle: 'TVA facturée 20 %',
        debit: 0,
        credit: mad(6_400),
        lettrage: null,
      },
    ],
  },
  {
    id: 'ecr-005',
    dossierId: '1',
    exercice: 2025,
    journal: 'CA',
    numeroPiece: 'CA-2025-00017',
    date: '2025-12-28',
    libelle: 'Achat fournitures de bureau',
    lignes: [
      {
        id: 'lig-010',
        compte: '6125',
        libelle: 'Fournitures de bureau',
        debit: mad(1_800),
        credit: 0,
        lettrage: null,
      },
      {
        id: 'lig-011',
        compte: '5161',
        libelle: 'Caisse',
        debit: 0,
        credit: mad(1_800),
        lettrage: null,
      },
    ],
  },
];

// ─────────────────────────────── BILAN ──────────────────────────────────

export const MOCK_BILAN: Bilan = {
  dossierId: '1',
  exercice: 2025,
  dateCloture: '2025-12-31',
  actif: [
    {
      titre: 'Actif immobilisé (Classe 2)',
      rubriques: [
        {
          libelle: 'Immobilisations incorporelles',
          montantN: mad(120_000),
          montantN1: mad(135_000),
        },
        {
          libelle: 'Immobilisations corporelles',
          montantN: mad(680_000),
          montantN1: mad(720_000),
        },
        {
          libelle: 'Total Actif immobilisé',
          montantN: mad(800_000),
          montantN1: mad(855_000),
          total: true,
        },
      ],
    },
    {
      titre: 'Actif circulant (Classe 3-4)',
      rubriques: [
        { libelle: 'Stocks', montantN: mad(350_000), montantN1: mad(290_000) },
        {
          libelle: 'Créances clients',
          montantN: mad(480_000),
          montantN1: mad(410_000),
        },
        {
          libelle: 'Autres créances',
          montantN: mad(120_000),
          montantN1: mad(98_000),
        },
        {
          libelle: 'Total Actif circulant',
          montantN: mad(950_000),
          montantN1: mad(798_000),
          total: true,
        },
      ],
    },
    {
      titre: 'Trésorerie (Classe 5)',
      rubriques: [
        {
          libelle: 'Banques & CCP',
          montantN: mad(580_000),
          montantN1: mad(420_000),
        },
        { libelle: 'Caisse', montantN: mad(120_000), montantN1: mad(85_000) },
      ],
    },
  ],
  passif: [
    {
      titre: 'Capitaux propres (Classe 1)',
      rubriques: [
        {
          libelle: 'Capital social',
          montantN: mad(500_000),
          montantN1: mad(500_000),
        },
        { libelle: 'Réserves', montantN: mad(280_000), montantN1: mad(210_000) },
        {
          libelle: 'Résultat net',
          montantN: mad(420_000),
          montantN1: mad(310_000),
        },
        {
          libelle: 'Total Capitaux propres',
          montantN: mad(1_200_000),
          montantN1: mad(1_020_000),
          total: true,
        },
      ],
    },
    {
      titre: 'Dettes de financement',
      rubriques: [
        {
          libelle: 'Emprunts bancaires LT',
          montantN: mad(650_000),
          montantN1: mad(730_000),
        },
      ],
    },
    {
      titre: 'Dettes CT (Classe 4)',
      rubriques: [
        {
          libelle: 'Dettes fournisseurs',
          montantN: mad(380_000),
          montantN1: mad(290_000),
        },
        {
          libelle: 'Dettes fiscales & sociales',
          montantN: mad(120_000),
          montantN1: mad(88_000),
        },
        {
          libelle: 'Autres dettes CT',
          montantN: mad(100_000),
          montantN1: mad(30_000),
        },
        {
          libelle: 'Total Dettes CT',
          montantN: mad(600_000),
          montantN1: mad(408_000),
          total: true,
        },
      ],
    },
  ],
  totalActifN: mad(2_450_000),
  totalActifN1: mad(2_158_000),
  totalPassifN: mad(2_450_000),
  totalPassifN1: mad(2_158_000),
};

// ──────────────────────────────── CPC ───────────────────────────────────

/*
 * Note : le prototype affichait un résultat net 2024 de 311 000 au CPC mais
 * 310 000 au bilan. L'IS 2024 a été porté à 100 000 (au lieu de 99 000) pour
 * que les deux états concordent : 410 000 - 100 000 = 310 000.
 */
export const MOCK_CPC: Cpc = {
  dossierId: '1',
  exercice: 2025,
  chiffreAffairesN: mad(2_840_000),
  chiffreAffairesN1: mad(2_410_000),
  resultatExploitationN: mad(580_000),
  resultatExploitationN1: mad(466_000),
  resultatNetN: mad(420_000),
  resultatNetN1: mad(310_000),
  lignes: [
    { libelle: 'I. EXPLOITATION', montantN: 0, montantN1: 0, style: 'section', accent: 'bleu' },
    {
      libelle: "Produits d'exploitation",
      montantN: mad(2_840_000),
      montantN1: mad(2_410_000),
      style: 'normale',
    },
    {
      libelle: "Charges d'exploitation",
      montantN: mad(2_260_000),
      montantN1: mad(1_944_000),
      style: 'normale',
    },
    {
      libelle: "Résultat d'exploitation",
      montantN: mad(580_000),
      montantN1: mad(466_000),
      style: 'soustotal',
    },
    { libelle: 'II. FINANCIER', montantN: 0, montantN1: 0, style: 'section', accent: 'violet' },
    {
      libelle: 'Produits financiers',
      montantN: mad(18_000),
      montantN1: mad(12_000),
      style: 'normale',
    },
    {
      libelle: 'Charges financières',
      montantN: mad(68_000),
      montantN1: mad(76_000),
      style: 'normale',
    },
    {
      libelle: 'Résultat financier',
      montantN: mad(-50_000),
      montantN1: mad(-64_000),
      style: 'soustotal',
    },
    {
      libelle: 'Résultat courant',
      montantN: mad(530_000),
      montantN1: mad(402_000),
      style: 'courant',
    },
    {
      libelle: 'Résultat non courant',
      montantN: mad(20_000),
      montantN1: mad(8_000),
      style: 'normale',
    },
    {
      libelle: 'Résultat avant IS',
      montantN: mad(550_000),
      montantN1: mad(410_000),
      style: 'soustotal',
    },
    {
      libelle: 'Impôt sur les Sociétés',
      montantN: mad(-130_000),
      montantN1: mad(-100_000),
      style: 'normale',
    },
    {
      libelle: 'RÉSULTAT NET',
      montantN: mad(420_000),
      montantN1: mad(310_000),
      style: 'net',
    },
  ],
};

// ───────────────────── DOCUMENTS DU PORTAIL CLIENT ──────────────────────

export const MOCK_DOCUMENTS: DocumentPublie[] = [
  {
    id: 'doc-001',
    dossierId: '1',
    type: 'BILAN',
    exercice: 2025,
    libelle: 'Bilan 2025',
    sousTitre: 'au 31/12/2025',
    publieLe: '2026-01-15',
    publiePar: 'Ahmed Benali',
    archive: false,
  },
  {
    id: 'doc-002',
    dossierId: '1',
    type: 'CPC',
    exercice: 2025,
    libelle: 'CPC 2025',
    sousTitre: 'Exercice 01/01 — 31/12/2025',
    publieLe: '2026-01-15',
    publiePar: 'Ahmed Benali',
    archive: false,
  },
  {
    id: 'doc-003',
    dossierId: '1',
    type: 'BILAN',
    exercice: 2024,
    libelle: 'Bilan 2024',
    sousTitre: 'au 31/12/2024',
    publieLe: '2025-02-20',
    publiePar: 'Ahmed Benali',
    archive: true,
  },
  {
    id: 'doc-004',
    dossierId: '1',
    type: 'CPC',
    exercice: 2024,
    libelle: 'CPC 2024',
    sousTitre: 'Exercice 2024',
    publieLe: '2025-02-20',
    publiePar: 'Ahmed Benali',
    archive: true,
  },
];
