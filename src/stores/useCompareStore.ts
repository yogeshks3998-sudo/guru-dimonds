import { create } from 'zustand';

interface CompareState {
  compareIds: string[];
  drawerOpen: boolean;
  
  toggleCompare: (id: string) => void;
  removeCompare: (id: string) => void;
  clearCompare: () => void;
  setDrawerOpen: (open: boolean) => void;
}

const LOCAL_KEY = 'vedaara_compare_ids_v1';

const getInitialCompare = (): string[] => {
  try {
    const data = localStorage.getItem(LOCAL_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveCompare = (ids: string[]) => {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(ids));
  } catch {}
};

export const useCompareStore = create<CompareState>((set, get) => ({
  compareIds: getInitialCompare(),
  drawerOpen: false,

  toggleCompare: (id) => {
    const current = get().compareIds;
    if (current.includes(id)) {
      const updated = current.filter((item) => item !== id);
      saveCompare(updated);
      set({ compareIds: updated });
    } else {
      if (current.length >= 4) {
        alert('You can compare a maximum of 4 jewellery creations simultaneously.');
        return;
      }
      const updated = [...current, id];
      saveCompare(updated);
      set({ compareIds: updated, drawerOpen: true });
    }
  },

  removeCompare: (id) => {
    const updated = get().compareIds.filter((item) => item !== id);
    saveCompare(updated);
    set({ compareIds: updated });
  },

  clearCompare: () => {
    saveCompare([]);
    set({ compareIds: [], drawerOpen: false });
  },

  setDrawerOpen: (open) => set({ drawerOpen: open }),
}));
