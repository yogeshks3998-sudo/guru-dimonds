import React, { useEffect, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { useCMSStore } from '../../stores/useCMSStore';
import { useToast } from '../../components/ui/Toast';
import { Save, FileText, Image, MessageSquare, Megaphone, Globe } from 'lucide-react';
import { CMSHeroSlide } from '../../types';

export const AdminCMSPage: React.FC = () => {
  const { cms, updateHeroBanner, updateAnnouncement, updateFooter } = useCMSStore();
  const { showToast } = useToast();

  const [heroForm, setHeroForm] = useState(cms.heroBanner);
  const [announcementForm, setAnnouncementForm] = useState(cms.announcementBar);
  const [footerForm, setFooterForm] = useState(cms.footer);
  const heroSlides = heroForm.slides || [];

  useEffect(() => {
    setHeroForm(cms.heroBanner);
    setAnnouncementForm(cms.announcementBar);
    setFooterForm(cms.footer);
  }, [cms]);

  const updateHeroSlide = (index: number, slideData: Partial<CMSHeroSlide>) => {
    const slides = heroSlides.map((slide, slideIndex) =>
      slideIndex === index ? { ...slide, ...slideData } : slide
    );
    const firstSlide = slides[0];
    setHeroForm({
      ...heroForm,
      slides,
      title: firstSlide.title,
      subtitle: firstSlide.subtitle,
      ctaLabel: firstSlide.ctaLabel,
      ctaLink: firstSlide.ctaLink,
      imageUrl: firstSlide.imageUrl,
      mobileImageUrl: firstSlide.mobileImageUrl,
    });
  };

  const handleSaveCMS = (e: React.FormEvent) => {
    e.preventDefault();
    updateHeroBanner(heroForm);
    updateAnnouncement(announcementForm.enabled, announcementForm.text, announcementForm.link);
    updateFooter(footerForm);
    showToast('CMS Content Published', 'Storefront banners and editorial copy updated successfully.');
  };

  return (
    <AdminLayout activeTab="cms">
      <div className="space-y-8 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E7E1D7] pb-6">
          <div>
            <h1 className="font-serif text-3xl font-bold text-[#1B1A18]">Storefront Content Management</h1>
            <p className="text-xs text-[#6F6A62]">
              Edit hero banners, top announcement tickers, brand story copy, and footer contact details.
            </p>
          </div>

          <button
            onClick={handleSaveCMS}
            className="px-6 py-3 bg-[#A67C32] hover:bg-[#8e6828] text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-lg flex items-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" /> Save & Publish Storefront
          </button>
        </div>

        <form onSubmit={handleSaveCMS} className="space-y-8 text-xs">
          {/* Top Announcement Bar Editor */}
          <div className="bg-white border border-[#E7E1D7] rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="font-serif font-bold text-base text-[#1B1A18] border-b border-[#E7E1D7] pb-2 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-[#A67C32]" /> Top Announcement Ticker Bar
            </h3>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={announcementForm.enabled}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, enabled: e.target.checked })}
                  className="rounded text-[#A67C32]"
                />
                <span className="font-bold">Enable Ticker Banner</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-[#1B1A18] block mb-1">Ticker Message Text</label>
                <input
                  type="text"
                  value={announcementForm.text}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, text: e.target.value })}
                  className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="font-bold text-[#1B1A18] block mb-1">Link Target URL</label>
                <input
                  type="text"
                  value={announcementForm.link || ''}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, link: e.target.value })}
                  className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Hero Banner Editor */}
          <div className="bg-white border border-[#E7E1D7] rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="font-serif font-bold text-base text-[#1B1A18] border-b border-[#E7E1D7] pb-2 flex items-center gap-2">
              <Image className="w-4 h-4 text-[#A67C32]" /> Homepage Hero Slider
            </h3>

            <div className="space-y-6">
              {heroSlides.map((slide, index) => (
                <div key={slide.id} className="rounded-2xl border border-[#E7E1D7] bg-[#FAF8F3] p-4 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E7E1D7] pb-2">
                    <h4 className="font-serif font-bold text-sm text-[#1B1A18]">Hero Slide {index + 1}</h4>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#A67C32]">Auto Carousel</span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-[1fr_180px] gap-4">
                    <div className="space-y-4">
                      <div>
                        <label className="font-bold text-[#1B1A18] block mb-1">Small Label / Eyebrow</label>
                        <input
                          type="text"
                          value={slide.eyebrow}
                          onChange={(e) => updateHeroSlide(index, { eyebrow: e.target.value })}
                          className="w-full bg-white border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs font-bold"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-[#1B1A18] block mb-1">Main Heading Title</label>
                        <input
                          type="text"
                          value={slide.title}
                          onChange={(e) => updateHeroSlide(index, { title: e.target.value })}
                          className="w-full bg-white border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs font-hero font-bold text-base"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-[#1B1A18] block mb-1">Subheading Paragraph</label>
                        <textarea
                          rows={2}
                          value={slide.subtitle}
                          onChange={(e) => updateHeroSlide(index, { subtitle: e.target.value })}
                          className="w-full bg-white border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs"
                        />
                      </div>
                    </div>

                    <div className="rounded-xl overflow-hidden bg-white border border-[#E7E1D7] min-h-40">
                      {slide.imageUrl ? (
                        <img src={slide.imageUrl} alt={`Hero slide ${index + 1} preview`} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-[#6F6A62] uppercase font-bold">
                          No Image
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-[#1B1A18] block mb-1">Primary Button Label</label>
                      <input
                        type="text"
                        value={slide.ctaLabel}
                        onChange={(e) => updateHeroSlide(index, { ctaLabel: e.target.value })}
                        className="w-full bg-white border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-[#1B1A18] block mb-1">Primary Button Link</label>
                      <input
                        type="text"
                        value={slide.ctaLink}
                        onChange={(e) => updateHeroSlide(index, { ctaLink: e.target.value })}
                        className="w-full bg-white border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-[#1B1A18] block mb-1">Secondary Button Label</label>
                      <input
                        type="text"
                        value={slide.secondaryCtaLabel}
                        onChange={(e) => updateHeroSlide(index, { secondaryCtaLabel: e.target.value })}
                        className="w-full bg-white border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-[#1B1A18] block mb-1">Secondary Button Link</label>
                      <input
                        type="text"
                        value={slide.secondaryCtaLink}
                        onChange={(e) => updateHeroSlide(index, { secondaryCtaLink: e.target.value })}
                        className="w-full bg-white border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-[#1B1A18] block mb-1">Desktop Image URL</label>
                      <input
                        type="text"
                        value={slide.imageUrl}
                        onChange={(e) => updateHeroSlide(index, { imageUrl: e.target.value })}
                        className="w-full bg-white border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-[#1B1A18] block mb-1">Mobile Image URL</label>
                      <input
                        type="text"
                        value={slide.mobileImageUrl}
                        onChange={(e) => updateHeroSlide(index, { mobileImageUrl: e.target.value })}
                        className="w-full bg-white border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};
