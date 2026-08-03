import { create } from 'zustand';
import { CMSContent, CMSSection } from '../types';
import { INITIAL_CMS } from '../data/mockData';
import { cmsApi } from '../services/cmsApi';

interface CMSState {
  cms: CMSContent;
  loading: boolean;
  error: string | null;
  
  // Actions
  updateAnnouncement: (enabled: boolean, text: string, link?: string) => void;
  updateHeroBanner: (heroData: Partial<CMSContent['heroBanner']>) => void;
  toggleSection: (sectionId: string, enabled: boolean) => void;
  reorderSections: (newSections: CMSSection[]) => void;
  updateSectionTitle: (sectionId: string, title: string, subtitle?: string) => void;
  updateFooter: (footerData: Partial<CMSContent['footer']>) => void;
  hydrateCMS: () => Promise<void>;
}

const LOCAL_KEY = 'vedaara_cms_content_v1';

const getInitialCMS = (): CMSContent => {
  try {
    const data = localStorage.getItem(LOCAL_KEY);
    return data ? JSON.parse(data) : INITIAL_CMS;
  } catch {
    return INITIAL_CMS;
  }
};

const saveCMS = (cms: CMSContent) => {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(cms));
  } catch {}
};

export const useCMSStore = create<CMSState>((set, get) => ({
  cms: getInitialCMS(),
  loading: false,
  error: null,

  hydrateCMS: async () => {
    set({ loading: true, error: null });
    try {
      const cms = await cmsApi.getCMS();
      saveCMS(cms);
      set({ cms, loading: false });
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : 'Unable to load CMS content from API' });
    }
  },

  updateAnnouncement: (enabled, text, link) => {
    const updated = {
      ...get().cms,
      announcementBar: { enabled, text, link },
    };
    saveCMS(updated);
    set({ cms: updated });
    void cmsApi.updateCMS(updated).catch((error) => {
      set({ error: error instanceof Error ? error.message : 'Unable to save announcement' });
    });
  },

  updateHeroBanner: (heroData) => {
    const updated = {
      ...get().cms,
      heroBanner: { ...get().cms.heroBanner, ...heroData },
    };
    saveCMS(updated);
    set({ cms: updated });
    void cmsApi.updateCMS(updated).catch((error) => {
      set({ error: error instanceof Error ? error.message : 'Unable to save hero banner' });
    });
  },

  toggleSection: (sectionId, enabled) => {
    const updatedSections = get().cms.sections.map((sec) =>
      sec.id === sectionId ? { ...sec, enabled } : sec
    );
    const updated = { ...get().cms, sections: updatedSections };
    saveCMS(updated);
    set({ cms: updated });
    void cmsApi.updateCMS(updated).catch((error) => {
      set({ error: error instanceof Error ? error.message : 'Unable to save CMS section' });
    });
  },

  reorderSections: (newSections) => {
    const updated = { ...get().cms, sections: newSections };
    saveCMS(updated);
    set({ cms: updated });
    void cmsApi.updateCMS(updated).catch((error) => {
      set({ error: error instanceof Error ? error.message : 'Unable to reorder CMS sections' });
    });
  },

  updateSectionTitle: (sectionId, title, subtitle) => {
    const updatedSections = get().cms.sections.map((sec) =>
      sec.id === sectionId ? { ...sec, title, subtitle } : sec
    );
    const updated = { ...get().cms, sections: updatedSections };
    saveCMS(updated);
    set({ cms: updated });
    void cmsApi.updateCMS(updated).catch((error) => {
      set({ error: error instanceof Error ? error.message : 'Unable to save section title' });
    });
  },

  updateFooter: (footerData) => {
    const updated = {
      ...get().cms,
      footer: { ...get().cms.footer, ...footerData },
    };
    saveCMS(updated);
    set({ cms: updated });
    void cmsApi.updateCMS(updated).catch((error) => {
      set({ error: error instanceof Error ? error.message : 'Unable to save footer' });
    });
  },
}));
