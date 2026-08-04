import { create } from 'zustand';
import { CMSContent, CMSHeroSlide, CMSSection } from '../types';
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

const LOCAL_KEY = 'guru_diamonds_cms_content_v1';
const LEGACY_LOCAL_KEY = 'vedaara_cms_content_v1';
const BRAND_FOOTER_CONTACT: Pick<CMSContent['footer'], 'phone' | 'email' | 'address' | 'whatsapp'> = {
  phone: '+91 78991 25449',
  email: 'info@gurudimonds.in',
  address: 'No. 1108, 1st Cross, Kurubageri, Lashkar Mohalla, Mysuru - 570001, Karnataka, India',
  whatsapp: '+91 78991 25449',
};

const withBrandFooterContact = (cms: CMSContent): CMSContent => ({
  ...cms,
  heroBanner: normalizeHeroBanner(cms.heroBanner),
  footer: {
    ...cms.footer,
    ...BRAND_FOOTER_CONTACT,
  },
});

const createFallbackHeroSlides = (heroBanner: CMSContent['heroBanner']): CMSHeroSlide[] => {
  const defaultSlides = INITIAL_CMS.heroBanner.slides || [];
  const firstSlide: CMSHeroSlide = {
    id: defaultSlides[0]?.id || 'hero-slide-1',
    eyebrow: defaultSlides[0]?.eyebrow || 'Where Trust Meets Brilliance',
    title: heroBanner.title || defaultSlides[0]?.title || 'Guru Diamonds',
    subtitle: heroBanner.subtitle || defaultSlides[0]?.subtitle || '',
    ctaLabel: heroBanner.ctaLabel || defaultSlides[0]?.ctaLabel || 'Explore Collection',
    ctaLink: heroBanner.ctaLink || defaultSlides[0]?.ctaLink || '/shop',
    secondaryCtaLabel: defaultSlides[0]?.secondaryCtaLabel || 'Custom Commissions',
    secondaryCtaLink: defaultSlides[0]?.secondaryCtaLink || '/custom-jewellery',
    imageUrl: heroBanner.imageUrl || defaultSlides[0]?.imageUrl || '',
    mobileImageUrl: heroBanner.mobileImageUrl || defaultSlides[0]?.mobileImageUrl || heroBanner.imageUrl || '',
  };

  return [firstSlide, ...defaultSlides.slice(1)].slice(0, 3);
};

const normalizeHeroBanner = (heroBanner: CMSContent['heroBanner']): CMSContent['heroBanner'] => {
  const fallbackSlides = createFallbackHeroSlides(heroBanner);
  const slides = Array.isArray(heroBanner.slides) && heroBanner.slides.length > 0
    ? heroBanner.slides
    : fallbackSlides;

  const normalizedSlides = fallbackSlides.map((fallback, index) => {
    const slide = slides[index] || fallback;
    return {
      ...fallback,
      ...slide,
      id: slide.id || fallback.id,
      mobileImageUrl: slide.mobileImageUrl || slide.imageUrl || fallback.mobileImageUrl,
    };
  });

  return {
    ...heroBanner,
    title: normalizedSlides[0].title,
    subtitle: normalizedSlides[0].subtitle,
    ctaLabel: normalizedSlides[0].ctaLabel,
    ctaLink: normalizedSlides[0].ctaLink,
    imageUrl: normalizedSlides[0].imageUrl,
    mobileImageUrl: normalizedSlides[0].mobileImageUrl,
    slides: normalizedSlides,
  };
};

const getInitialCMS = (): CMSContent => {
  try {
    const data = localStorage.getItem(LOCAL_KEY) || localStorage.getItem(LEGACY_LOCAL_KEY);
    if (data && !localStorage.getItem(LOCAL_KEY)) {
      localStorage.setItem(LOCAL_KEY, data);
    }
    const cms = data ? JSON.parse(data) : INITIAL_CMS;
    return withBrandFooterContact(cms);
  } catch {
    return INITIAL_CMS;
  }
};

const saveCMS = (cms: CMSContent) => {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(withBrandFooterContact(cms)));
  } catch {}
};

export const useCMSStore = create<CMSState>((set, get) => ({
  cms: getInitialCMS(),
  loading: false,
  error: null,

  hydrateCMS: async () => {
    set({ loading: true, error: null });
    try {
      const cms = withBrandFooterContact(await cmsApi.getCMS());
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
      heroBanner: normalizeHeroBanner({ ...get().cms.heroBanner, ...heroData }),
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
      footer: { ...get().cms.footer, ...footerData, ...BRAND_FOOTER_CONTACT },
    };
    saveCMS(updated);
    set({ cms: updated });
    void cmsApi.updateCMS(updated).catch((error) => {
      set({ error: error instanceof Error ? error.message : 'Unable to save footer' });
    });
  },
}));
