import {create} from 'zustand';

interface UiState {
    chatOpen: boolean;
    toggleChat: () => void;
    closeChat: () => void;
}

export const useUiStore = create<UiState>((set) => ({
    chatOpen: false,
    toggleChat: () => set((state) => ({chatOpen: !state.chatOpen })),
    closeChat: () => set({ chatOpen: false}),
}));