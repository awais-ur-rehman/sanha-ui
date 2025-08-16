import { create } from 'zustand'

interface UIState {
  isSidebarCollapsed: boolean
  isMobileMenuOpen: boolean
}

interface UIActions {
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleMobileMenu: () => void
  setMobileMenuOpen: (open: boolean) => void
}

type UIStore = UIState & UIActions

export const useUIStore = create<UIStore>((set) => ({
  // State
  isSidebarCollapsed: false,
  isMobileMenuOpen: false,

  // Actions
  toggleSidebar: () => {
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed }))
  },

  setSidebarCollapsed: (collapsed: boolean) => {
    set({ isSidebarCollapsed: collapsed })
  },

  toggleMobileMenu: () => {
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen }))
  },

  setMobileMenuOpen: (open: boolean) => {
    set({ isMobileMenuOpen: open })
  }
})) 