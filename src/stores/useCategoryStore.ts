import { create } from 'zustand';
import { Category } from '../types';
import { INITIAL_CATEGORIES } from '../data/mockData';
import { productApi } from '../services/productApi';

const STORAGE_KEY = 'guru_diamonds_categories_v2';

interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;

  // Actions
  hydrateCategories: () => Promise<void>;
  toggleCategoryStatus: (id: string) => Promise<void>;
  addCategory: (data: Partial<Category>) => Promise<Category>;
  updateCategory: (id: string, updated: Partial<Category>) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
}

// Ensure default categories have enabled: true
const defaultCategories: Category[] = INITIAL_CATEGORIES.map((cat) => ({
  ...cat,
  enabled: cat.enabled !== undefined ? cat.enabled : true,
}));

function loadLocalCategories(): Category[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultCategories;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((cat: Category) => ({
        ...cat,
        enabled: cat.enabled !== undefined ? cat.enabled : true,
      }));
    }
  } catch {
    // ignore parse error
  }
  return defaultCategories;
}

function saveLocalCategories(cats: Category[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cats));
  } catch {
    // ignore quota error
  }
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: loadLocalCategories(),
  loading: false,
  error: null,

  hydrateCategories: async () => {
    set({ loading: true, error: null });
    try {
      const serverCategories = await productApi.listCategories();
      if (serverCategories && serverCategories.length > 0) {
        // Merge with local state to preserve any toggle states
        const local = get().categories;
        const localMap = new Map(local.map((c) => [c.id, c]));

        const merged = serverCategories.map((sc) => {
          const matched = localMap.get(sc.id);
          return {
            ...sc,
            enabled: matched?.enabled !== undefined ? matched.enabled : (sc.enabled !== undefined ? sc.enabled : true),
            subcategories: Array.isArray(sc.subcategories) ? sc.subcategories : [],
          };
        });

        // Add any local categories not yet on server
        const serverIds = new Set(serverCategories.map((s) => s.id));
        const extraLocal = local.filter((l) => !serverIds.has(l.id));

        const finalCategories = [...merged, ...extraLocal];
        set({ categories: finalCategories, loading: false });
        saveLocalCategories(finalCategories);
      } else {
        const local = loadLocalCategories();
        set({ categories: local, loading: false });
      }
    } catch {
      // Fallback to local storage or defaults gracefully
      const local = loadLocalCategories();
      set({ categories: local, loading: false });
    }
  },

  toggleCategoryStatus: async (id: string) => {
    const current = get().categories;
    const target = current.find((c) => c.id === id);
    if (!target) return;

    const nextEnabled = target.enabled === false ? true : false;
    const updated = current.map((c) => (c.id === id ? { ...c, enabled: nextEnabled } : c));
    set({ categories: updated });
    saveLocalCategories(updated);

    try {
      const updatedCategory = { ...target, enabled: nextEnabled };
      await productApi.updateCategory(id, updatedCategory);
    } catch {
      // Offline / dev fallback: local update already saved
    }
  },

  addCategory: async (data: Partial<Category>) => {
    const current = get().categories;
    const name = (data.name || 'New Category').trim();
    const slug = (data.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `category-${Date.now()}`).trim();
    const id = data.id || `cat-${Date.now()}`;

    const newCategory: Category = {
      id,
      name,
      slug,
      description: data.description || '',
      image: data.image || '/categories/Pendants.png',
      subcategories: data.subcategories || [],
      featured: data.featured || false,
      itemCount: 0,
      enabled: data.enabled !== undefined ? data.enabled : true,
    };

    const updated = [...current, newCategory];
    set({ categories: updated });
    saveLocalCategories(updated);

    try {
      await productApi.createCategory(newCategory);
    } catch {
      // Local fallback preserved
    }

    return newCategory;
  },

  updateCategory: async (id: string, updatedFields: Partial<Category>) => {
    const current = get().categories;
    const target = current.find((c) => c.id === id);
    if (!target) throw new Error('Category not found');

    const merged: Category = {
      ...target,
      ...updatedFields,
      subcategories: updatedFields.subcategories || target.subcategories || [],
    };

    const updated = current.map((c) => (c.id === id ? merged : c));
    set({ categories: updated });
    saveLocalCategories(updated);

    try {
      await productApi.updateCategory(id, merged);
    } catch {
      // Local fallback preserved
    }

    return merged;
  },

  deleteCategory: async (id: string) => {
    const current = get().categories;
    const updated = current.filter((c) => c.id !== id);
    set({ categories: updated });
    saveLocalCategories(updated);

    try {
      await productApi.deleteCategory(id);
    } catch {
      // Local fallback preserved
    }
  },
}));
