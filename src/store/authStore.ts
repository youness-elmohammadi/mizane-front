import { create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import type { Utilisateur } from '../types/auth.types';

interface AuthState {
    setUser: (user: Utilisateur, token: string) => void;
    /**
     * Remplace le seul access token, sans toucher à l'utilisateur.
     * Utilisé après un rafraîchissement silencieux (voir services/api.ts) :
     * l'identité ne change pas, uniquement le jeton.
     */
    setToken: (token: string) => void;
    token: string | null;
    user: {
        id: string
        nom: string
        email: string
        role: 'GERANT' | 'ASSISTANT' | 'CLIENT'
        cabinetId: string
    } | null
    clear: () => void;
    isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            token: null,
            user: null,
            setUser: (user ,token) => set({user, token}),
            setToken: (token) => set({ token }),
            clear: () => set({ user: null, token: null}),
            isAuthenticated: () => get().token !== null,
        }),
        { name: 'mizan-auth',
            storage: createJSONStorage(() => sessionStorage),
            partialize: (state) => ({ token: state.token, user: state.user })
        }
    )
);