import React, { useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { useCMSStore } from '../../stores/useCMSStore';
import { useToast } from '../../components/ui/Toast';
import { Save, FileText, Image, MessageSquare, Megaphone, Globe } from 'lucide-react';

export const AdminCMSPage: React.FC = () => {
  const { cms, updateHeroBanner, updateAnnouncement, updateFooter } = useCMSStore();
  const { showToast } = useToast();

  const [heroForm, setHeroForm] = useState(cms.heroBanner);
  const [announcementForm, setAnnouncementForm] = useState(cms.announcementBar);
  const [footerForm, setFooterForm] = useState(cms.footer);

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
              <Image className="w-4 h-4 text-[#A67C32]" /> Main Homepage Hero Banner
            </h3>

            <div className="space-y-4">
              <div>
                <label className="font-bold text-[#1B1A18] block mb-1">Main Heading Title</label>
                <input
                  type="text"
                  value={heroForm.title}
                  onChange={(e) => setHeroForm({ ...heroForm, title: e.target.value })}
                  className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs font-serif font-bold text-base"
                />
              </div>

              <div>
                <label className="font-bold text-[#1B1A18] block mb-1">Subheading Paragraph</label>
                <textarea
                  rows={2}
                  value={heroForm.subtitle}
                  onChange={(e) => setHeroForm({ ...heroForm, subtitle: e.target.value })}
                  className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-[#1B1A18] block mb-1">CTA Button Label</label>
                  <input
                    type="text"
                    value={heroForm.ctaLabel}
                    onChange={(e) => setHeroForm({ ...heroForm, ctaLabel: e.target.value })}
                    className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#1B1A18] block mb-1">Banner Background Image URL</label>
                  <input
                    type="text"
                    value={heroForm.imageUrl}
                    onChange={(e) => setHeroForm({ ...heroForm, imageUrl: e.target.value })}
                    className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};
