import { create } from 'zustand';
import { CMSContent, CMSSection } from '../types';
import { INITIAL_CMS } from '../data/mockData';

interface CMSState {
  cms: CMSContent;
  
  // Actions
  updateAnnouncement: (enabled: boolean, text: string, link?: string) => void;
  updateHeroBanner: (heroData: Partial<CMSContent['heroBanner']>) => void;
  toggleSection: (sectionId: string, enabled: boolean) => void;
  reorderSections: (newSections: CMSSection[]) => void;
  updateSectionTitle: (sectionId: string, title: string, subtitle?: string) => void;
  updateFooter: (footerData: Partial<CMSContent['footer']>) => void;
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

  updateAnnouncement: (enabled, text, link) => {
    const updated = {
      ...get().cms,
      announcementBar: { enabled, text, link },
    };
    saveCMS(updated);
    set({ cms: updated });
  },

  updateHeroBanner: (heroData) => {
    const updated = {
      ...get().cms,
      heroBanner: { ...get().cms.heroBanner, ...heroData },
    };
    saveCMS(updated);
    set({ cms: updated });
  },

  toggleSection: (sectionId, enabled) => {
    const updatedSections = get().cms.sections.map((sec) =>
      sec.id === sectionId ? { ...sec, enabled } : sec
    );
    const updated = { ...get().cms, sections: updatedSections };
    saveCMS(updated);
    set({ cms: updated });
  },

  reorderSections: (newSections) => {
    const updated = { ...get().cms, sections: newSections };
    saveCMS(updated);
    set({ cms: updated });
  },

  updateSectionTitle: (sectionId, title, subtitle) => {
    const updatedSections = get().cms.sections.map((sec) =>
      sec.id === sectionId ? { ...sec, title, subtitle } : sec
    );
    const updated = { ...get().cms, sections: updatedSections };
    saveCMS(updated);
    set({ cms: updated });
  },

  updateFooter: (footerData) => {
    const updated = {
      ...get().cms,
      footer: { ...get().cms.footer, ...footerData },
    };
    saveCMS(updated);
    set({ cms: updated });
  },
}));
