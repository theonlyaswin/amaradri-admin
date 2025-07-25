import { create } from 'zustand';

interface SidebarStore {
    isExpanded: boolean;
    toggleSidebar: () => void;
}

type State = {
    isExpanded: boolean;
}

type Actions = {
    toggleSidebar: () => void;
}

export const useSidebarStore = create<SidebarStore>((set: (fn: (state: State) => State) => void) => ({
    isExpanded: false,
    toggleSidebar: () => set((state) => ({ isExpanded: !state.isExpanded })),
})); 