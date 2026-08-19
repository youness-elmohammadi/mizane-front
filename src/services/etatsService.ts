/**
 * États de synthèse : balance, grand livre, bilan, CPC, et documents publiés.
 *
 * Ces états sont CALCULÉS côté backend (module `com.mizan.etats`) par
 * agrégation des lignes d'écriture, regroupées selon la classe PCGE du compte.
 *
 * ⚠️ UNITÉS : contrairement aux écritures (qui circulent en dirhams), les états
 * circulent en CENTIMES entiers — c'est le contrat de `types/etats.types.ts` et
 * de `formatMontant()`, qui divise par 100 à l'affichage. La conversion est
 * faite côté backend (`etats/Montants.java`) : il n'y a rien à convertir ici.
 *
 * Le backend enveloppe toutes ses réponses dans `{ data: … }` — on désenveloppe
 * ici pour que les pages manipulent directement les types métier.
 */

import api from './api';
import { USE_MOCKS, delaiSimule } from './config';
import type { Bilan, Cpc, DocumentPublie } from '../types/etats.types';
import { MOCK_BILAN, MOCK_CPC, MOCK_DOCUMENTS } from '../mocks/mockData';

/**
 * `exerciceId` est facultatif : sans lui le backend prend l'exercice OUVERT le
 * plus récent, ce qui est le comportement voulu au quotidien.
 */
export async function obtenirBilan(
  dossierId: string,
  exercice: number,
  exerciceId?: string
): Promise<Bilan> {
  if (!USE_MOCKS) {
    const { data } = await api.get<{ data: Bilan }>(
      `/api/dossiers/${dossierId}/bilan`,
      { params: { exerciceId } }
    );
    return data.data;
  }
  return delaiSimule({ ...MOCK_BILAN, dossierId, exercice });
}

export async function obtenirCpc(
  dossierId: string,
  exercice: number,
  exerciceId?: string
): Promise<Cpc> {
  if (!USE_MOCKS) {
    const { data } = await api.get<{ data: Cpc }>(
      `/api/dossiers/${dossierId}/cpc`,
      { params: { exerciceId } }
    );
    return data.data;
  }
  return delaiSimule({ ...MOCK_CPC, dossierId, exercice });
}

// ─────────────────────────── Balance & grand livre ───────────────────────────

/** Une ligne de balance générale. Montants en centimes. */
export interface LigneBalance {
  compteNum: string;
  compteLib: string;
  classe: number;
  totalDebit: number;
  totalCredit: number;
  soldeDebiteur: number;
  soldeCrediteur: number;
}

export interface Balance {
  dossierId: string;
  exercice: number;
  lignes: LigneBalance[];
  totalDebit: number;
  totalCredit: number;
  /** Contrôle fondamental : si false, une écriture déséquilibrée est passée. */
  equilibree: boolean;
}

export interface MouvementGrandLivre {
  date: string;
  pieceRef: string;
  journal: string;
  libelle: string;
  debit: number;
  credit: number;
  /** Solde cumulé après ce mouvement, dans le sens débiteur. */
  soldeProgressif: number;
  lettre: string | null;
}

export interface GrandLivre {
  dossierId: string;
  exercice: number;
  compteNum: string;
  compteLib: string;
  mouvements: MouvementGrandLivre[];
  totalDebit: number;
  totalCredit: number;
  solde: number;
}

export async function obtenirBalance(
  dossierId: string,
  exerciceId?: string
): Promise<Balance> {
  const { data } = await api.get<{ data: Balance }>(
    `/api/dossiers/${dossierId}/balance`,
    { params: { exerciceId } }
  );
  return data.data;
}

export async function obtenirGrandLivre(
  dossierId: string,
  compte: string,
  exerciceId?: string
): Promise<GrandLivre> {
  const { data } = await api.get<{ data: GrandLivre }>(
    `/api/dossiers/${dossierId}/grand-livre`,
    { params: { compte, exerciceId } }
  );
  return data.data;
}

export async function listerDocumentsPublies(
  dossierId: string
): Promise<DocumentPublie[]> {
  if (!USE_MOCKS) {
    const { data } = await api.get<{ data: DocumentPublie[] }>(
      `/api/dossiers/${dossierId}/documents`
    );
    return data.data;
  }

  const docs = MOCK_DOCUMENTS.filter((d) => d.dossierId === dossierId);
  return delaiSimule(docs);
}

/** Publie un état sur le portail du client. Réservé au cabinet. */
export async function publierDocument(
  dossierId: string,
  document: {
    type: 'BILAN' | 'CPC' | 'TVA' | 'AUTRE';
    exercice: number;
    libelle: string;
    sousTitre?: string;
  }
): Promise<DocumentPublie> {
  const { data } = await api.post<{ data: DocumentPublie }>(
    `/api/dossiers/${dossierId}/documents`,
    document
  );
  return data.data;
}

// ─────────────────────────── Déclaration de TVA ───────────────────────────

/**
 * Déclaration de TVA d'une période. Montants en centimes.
 *
 * `tvaDue` et `creditTva` s'excluent : une période dégage soit un montant à
 * payer, soit un crédit reportable — jamais les deux.
 */
export interface DeclarationTva {
  dossierId: string;
  regime: 'MENSUEL' | 'TRIMESTRIEL' | 'NON_ASSUJETTI';
  /** Libellé lisible, ex. « Mars 2026 » ou « T1 2026 ». */
  periode: string;
  dateDebut: string;
  dateFin: string;
  /** Date limite de dépôt DGI : le 20 du mois suivant. */
  dateLimiteDepot: string;
  tvaFacturee: number;
  tvaRecuperable: number;
  tvaDue: number;
  creditTva: number;
  chiffreAffairesHt: number;
  achatsHt: number;
}

export async function obtenirDeclarationTva(
  dossierId: string,
  annee?: number,
  periode?: number
): Promise<DeclarationTva> {
  const { data } = await api.get<{ data: DeclarationTva }>(
    `/api/dossiers/${dossierId}/tva`,
    { params: { annee, periode } }
  );
  return data.data;
}

/**
 * Vérifie l'égalité Actif = Passif.
 * Un bilan qui ne s'équilibre pas signale une erreur de saisie ou de report :
 * on l'affiche donc en évidence plutôt que de laisser passer silencieusement.
 */
export function bilanEstEquilibre(bilan: Bilan): boolean {
  return bilan.totalActifN === bilan.totalPassifN;
}
