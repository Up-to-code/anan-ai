import { create } from "zustand";

interface AppState {
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
    setSidebarOpen: (isOpen: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
    isSidebarOpen: true, // Default to open on desktop
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    setSidebarOpen: (isOpen: boolean) => set({ isSidebarOpen: isOpen }),
}));
