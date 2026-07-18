/**
 * Accès à l'utilisateur connecté et aux actions de connexion/déconnexion.
 * Les composants passent par ce hook plutôt que d'attaquer le store
 * directement : si l'authentification change (refresh token, SSO…),
 * un seul fichier est à modifier.
 */

import { useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { useDossierStore } from '../store/dossierStore';
import { seConnecter as appelConnexion } from '../services/authService';
import type { Role } from '../types/auth.types';

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const setUser = useAuthStore((state) => state.setUser);
  const clear = useAuthStore((state) => state.clear);
  const reinitialiserDossier = useDossierStore((state) => state.reinitialiser);

  const connexion = useCallback(
    async (email: string, motDePasse: string) => {
      const { token, utilisateur } = await appelConnexion(email, motDePasse);
      setUser(utilisateur, token);
      return utilisateur;
    },
    [setUser]
  );

  /** Purge aussi le dossier sélectionné : il appartient à la session précédente. */
  const deconnexion = useCallback(() => {
    clear();
    reinitialiserDossier();
  }, [clear, reinitialiserDossier]);

  const aLeRole = useCallback(
    (...roles: Role[]) => (user ? roles.includes(user.role) : false),
    [user]
  );

  return {
    user,
    estConnecte: token !== null,
    /** Un client ne voit que son propre portail, pas les outils du cabinet. */
    estClient: user?.role === 'CLIENT',
    connexion,
    deconnexion,
    aLeRole,
  };
}
