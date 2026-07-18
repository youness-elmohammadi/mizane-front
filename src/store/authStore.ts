import { create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import type { Utilisateur } from '../types/auth.types';

interface AuthState {
    setUser: (user: Utilisateur, token: string) => void;
    token: string | null;
    user: Utilisateur | null;
    clear: () => void;
    isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            token: null,
            user: null,
            setUser: (user ,token) => set({user, token}),
            clear: () => set({ user: null, token: null}),
            isAuthenticated: () => get().token !== null,
        }),
        { name: 'mizan-auth',
            storage: createJSONStorage(() => sessionStorage),
            partialize: (state) => ({ token: state.token, user: state.user })
        }
    )
);