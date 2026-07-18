/**
 * Authentification.
 *
 * La forme de la réponse (`{ token, utilisateur }`) est déjà celle que
 * renverra `POST /api/auth/login` côté Spring Boot : le jour où le backend
 * est prêt, seule la branche `USE_MOCKS` disparaît.
 */

import api from './api';
import { USE_MOCKS, delaiSimule } from './config';
import type { Utilisateur } from '../types/auth.types';
import { CABINET_ID } from '../mocks/mockData';

export interface ReponseConnexion {
  token: string;
  utilisateur: Utilisateur;
}

/** Comptes de démonstration — remplacés par la table `utilisateur` du backend. */
const COMPTES_DEMO: Array<Utilisateur & { motDePasse: string }> = [
  {
    id: 'u-001',
    email: 'ahmed@cabinet.ma',
    motDePasse: 'mizan2026',
    role: 'GERANT',
    nom: 'Ahmed Benali',
    cabinetId: CABINET_ID,
  },
  {
    id: 'u-002',
    email: 'sara@cabinet.ma',
    motDePasse: 'mizan2026',
    role: 'ASSISTANT',
    nom: 'Sara Idrissi',
    cabinetId: CABINET_ID,
  },
  {
    id: 'u-003',
    email: 'youssef@cabinet.ma',
    motDePasse: 'mizan2026',
    role: 'ASSISTANT',
    nom: 'Youssef Amrani',
    cabinetId: CABINET_ID,
  },
  {
    id: 'u-004',
    email: 'kamal@bensalah.ma',
    motDePasse: 'mizan2026',
    role: 'CLIENT',
    nom: 'Kamal Bensalah',
    cabinetId: CABINET_ID,
  },
];

/** Liste affichée sur l'écran de connexion pour faciliter la démonstration. */
export const COMPTES_DEMO_PUBLICS = COMPTES_DEMO.map(({ email, nom, role }) => ({
  email,
  nom,
  role,
}));

export class ErreurIdentifiants extends Error {
  constructor() {
    super('Email ou mot de passe incorrect');
    this.name = 'ErreurIdentifiants';
  }
}

export async function seConnecter(
  email: string,
  motDePasse: string
): Promise<ReponseConnexion> {
  if (!USE_MOCKS) {
    const { data } = await api.post<ReponseConnexion>('/api/auth/login', {
      email,
      motDePasse,
    });
    return data;
  }

  await delaiSimule(null, 400);

  const compte = COMPTES_DEMO.find(
    (c) =>
      c.email === email.trim().toLowerCase() && c.motDePasse === motDePasse
  );

  if (!compte) throw new ErreurIdentifiants();

  // On ne renvoie jamais le mot de passe, même en mock : on reconstruit
  // explicitement l'objet utilisateur à partir des seuls champs publics.
  const utilisateur: Utilisateur = {
    id: compte.id,
    email: compte.email,
    nom: compte.nom,
    role: compte.role,
    cabinetId: compte.cabinetId,
  };

  return {
    token: `mock-jwt.${btoa(utilisateur.id)}.signature`,
    utilisateur,
  };
}
