import React, { useEffect, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { useCMSStore } from '../../stores/useCMSStore';
import { useToast } from '../../components/ui/Toast';
import {
  Save,
  FileText,
  Image as ImageIcon,
  MessageSquare,
  Megaphone,
  Globe,
  Upload,
  Trash2,
  RefreshCw,
  Monitor,
  Smartphone,
  Link2,
} from 'lucide-react';
import { CMSHeroSlide } from '../../types';
import { ImageWithFallback } from '../../components/ui/ImageWithFallback';

const MAX_BANNER_WIDTH = 1920;
const MAX_MOBILE_BANNER_WIDTH = 1080;
const BANNER_QUALITY = 0.84;

function resizeBannerImage(file: File, isMobile = false): Promise<string> {
  if (!file.type.startsWith('image/')) {
    return Promise.reject(new Error(`${file.name} is not a valid image file.`));
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`Unable to read ${file.name}.`));
    reader.onload = () => {
      const image = new window.Image();
      image.onerror = () => reject(new Error(`Unable to process ${file.name}. Please select a standard image format.`));
      image.onload = () => {
        const maxWidth = isMobile ? MAX_MOBILE_BANNER_WIDTH : MAX_BANNER_WIDTH;
        const scale = Math.min(1, maxWidth / image.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext('2d');
        if (!context) {
          reject(new Error(`Unable to prepare canvas for ${file.name}.`));
          return;
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', BANNER_QUALITY));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export const AdminCMSPage: React.FC = () => {
  const { cms, updateHeroBanner, updateAnnouncement, updateFooter } = useCMSStore();
  const { showToast } = useToast();

  const [heroForm, setHeroForm] = useState(cms.heroBanner);
  const [announcementForm, setAnnouncementForm] = useState(cms.announcementBar);
  const [footerForm, setFooterForm] = useState(cms.footer);
  const [processingKey, setProcessingKey] = useState<string | null>(null);
  const [showUrlInputs, setShowUrlInputs] = useState<Record<number, boolean>>({});
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

  const handleBannerUpload = async (slideIndex: number, files: FileList | null, type: 'desktop' | 'mobile') => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const key = `${slideIndex}-${type}`;
    setProcessingKey(key);

    try {
      const resized = await resizeBannerImage(file, type === 'mobile');
      if (type === 'desktop') {
        updateHeroSlide(slideIndex, { imageUrl: resized });
      } else {
        updateHeroSlide(slideIndex, { mobileImageUrl: resized });
      }
      showToast(
        'Banner Image Selected',
        `${type === 'desktop' ? 'Desktop' : 'Mobile'} banner selected from local file. Click 'Save & Publish' to save changes.`
      );
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to process local banner image.');
    } finally {
      setProcessingKey(null);
    }
  };

  const handleRemoveBanner = (slideIndex: number, type: 'desktop' | 'mobile') => {
    if (type === 'desktop') {
      updateHeroSlide(slideIndex, { imageUrl: '' });
      showToast('Banner Removed', 'Desktop banner image removed.');
    } else {
      updateHeroSlide(slideIndex, { mobileImageUrl: '' });
      showToast('Mobile Banner Removed', 'Mobile banner image removed.');
    }
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
              <ImageIcon className="w-4 h-4 text-[#A67C32]" /> Homepage Hero Slider
            </h3>

            <div className="space-y-6">
              {heroSlides.map((slide, index) => (
                <div key={slide.id} className="rounded-2xl border border-[#E7E1D7] bg-[#FAF8F3] p-5 space-y-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-[#E7E1D7] pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#A67C32] text-white flex items-center justify-center font-bold text-xs">
                        {index + 1}
                      </span>
                      <h4 className="font-serif font-bold text-sm text-[#1B1A18]">Hero Slide {index + 1}</h4>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#A67C32] bg-[#FAF3E6] border border-[#D8C29D] px-2.5 py-0.5 rounded-full">
                      Auto Carousel
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-4">
                    <div className="space-y-4">
                      <div>
                        <label className="font-bold text-[#1B1A18] block mb-1">Small Label / Eyebrow</label>
                        <input
                          type="text"
                          value={slide.eyebrow}
                          onChange={(e) => updateHeroSlide(index, { eyebrow: e.target.value })}
                          placeholder="e.g. Silver Gemstone Rings"
                          className="w-full bg-white border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs font-bold"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-[#1B1A18] block mb-1">Main Heading Title</label>
                        <input
                          type="text"
                          value={slide.title}
                          onChange={(e) => updateHeroSlide(index, { title: e.target.value })}
                          placeholder="e.g. Handpicked Silver Statements"
                          className="w-full bg-white border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs font-hero font-bold text-base"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-[#1B1A18] block mb-1">Subheading Paragraph</label>
                        <textarea
                          rows={2}
                          value={slide.subtitle}
                          onChange={(e) => updateHeroSlide(index, { subtitle: e.target.value })}
                          placeholder="e.g. Explore bold silver rings set with natural stones, crafted for everyday elegance."
                          className="w-full bg-white border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs"
                        />
                      </div>
                    </div>

                    {/* Right Side Quick Thumbnail Preview */}
                    <div className="space-y-1.5">
                      <label className="font-bold text-[#1B1A18] block text-[11px]">Slide Preview</label>
                      <div className="rounded-xl overflow-hidden bg-white border border-[#E7E1D7] min-h-40 h-[170px] relative group shadow-xs">
                        {slide.imageUrl ? (
                          <>
                            <ImageWithFallback
                              src={slide.imageUrl}
                              alt={`Hero slide ${index + 1} preview`}
                              className="w-full h-full object-cover"
                            />
                            <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer p-2 text-center">
                              <Upload className="w-5 h-5 mb-1 text-[#D8C29D]" />
                              <span className="text-[10px] font-bold uppercase tracking-wider">Change Local Image</span>
                              <input
                                type="file"
                                accept="image/*"
                                disabled={processingKey === `${index}-desktop`}
                                onChange={(e) => {
                                  void handleBannerUpload(index, e.target.files, 'desktop');
                                  e.currentTarget.value = '';
                                }}
                                className="sr-only"
                              />
                            </label>
                          </>
                        ) : (
                          <label className="w-full h-full flex flex-col items-center justify-center text-[10px] text-[#A67C32] uppercase font-bold p-3 text-center cursor-pointer hover:bg-[#FFF9F0] transition-colors border-2 border-dashed border-[#D8C29D] rounded-xl">
                            <Upload className="w-6 h-6 mb-1 text-[#A67C32]" />
                            <span>Select Image</span>
                            <input
                              type="file"
                              accept="image/*"
                              disabled={processingKey === `${index}-desktop`}
                              onChange={(e) => {
                                void handleBannerUpload(index, e.target.files, 'desktop');
                                e.currentTarget.value = '';
                              }}
                              className="sr-only"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#E7E1D7]">
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

                  {/* Banner Image Selection from Local Files */}
                  <div className="pt-4 border-t border-[#E7E1D7] space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h5 className="font-serif font-bold text-sm text-[#1B1A18] flex items-center gap-1.5">
                          <Upload className="w-4 h-4 text-[#A67C32]" /> Select Banner Image from Local (Same as Products)
                        </h5>
                        <p className="text-[11px] text-[#6F6A62]">
                          Click below to pick image from your computer. Auto-resized and optimized to lightweight high-res JPEG.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowUrlInputs((prev) => ({ ...prev, [index]: !prev[index] }))}
                        className="text-[11px] font-semibold text-[#A67C32] hover:underline flex items-center gap-1 self-start sm:self-auto"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        {showUrlInputs[index] ? 'Hide URL inputs' : 'Or enter / edit Image URL'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Desktop Banner Local Uploader */}
                      <div className="space-y-2 bg-white p-3.5 rounded-xl border border-[#E7E1D7] shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[11px] text-[#1B1A18] flex items-center gap-1.5">
                            <Monitor className="w-3.5 h-3.5 text-[#A67C32]" /> Desktop Banner Image (Primary)
                          </span>
                          {slide.imageUrl && (
                            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E6F4EA] text-[#2E7D5B] border border-[#2E7D5B]/30">
                              Selected
                            </span>
                          )}
                        </div>

                        {slide.imageUrl ? (
                          <div className="space-y-2">
                            <div className="relative aspect-[16/7] rounded-lg overflow-hidden bg-[#FAF8F3] border border-[#E7E1D7] group">
                              <ImageWithFallback
                                src={slide.imageUrl}
                                alt={`Slide ${index + 1} Desktop`}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <label
                                  className="cursor-pointer bg-white text-[#1B1A18] hover:bg-[#FAF8F3] px-3 py-1.5 rounded-lg text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
                                  title="Replace from Local"
                                >
                                  <RefreshCw className="w-3.5 h-3.5 text-[#A67C32]" /> Replace Local
                                  <input
                                    type="file"
                                    accept="image/*"
                                    disabled={processingKey === `${index}-desktop`}
                                    onChange={(e) => {
                                      void handleBannerUpload(index, e.target.files, 'desktop');
                                      e.currentTarget.value = '';
                                    }}
                                    className="sr-only"
                                  />
                                </label>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveBanner(index, 'desktop')}
                                  className="bg-white text-[#B43C3C] hover:bg-[#FFF5F5] px-3 py-1.5 rounded-lg text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
                                  title="Remove Image"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Remove
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-[#6F6A62]">
                              <span className="truncate max-w-[220px]" title={slide.imageUrl}>
                                {slide.imageUrl.startsWith('data:') ? 'Local file attached (optimized JPEG)' : slide.imageUrl}
                              </span>
                              <label className="text-[#A67C32] font-bold cursor-pointer hover:underline flex items-center gap-1">
                                <RefreshCw className="w-3 h-3" /> Change
                                <input
                                  type="file"
                                  accept="image/*"
                                  disabled={processingKey === `${index}-desktop`}
                                  onChange={(e) => {
                                    void handleBannerUpload(index, e.target.files, 'desktop');
                                    e.currentTarget.value = '';
                                  }}
                                  className="sr-only"
                                />
                              </label>
                            </div>
                          </div>
                        ) : (
                          <label
                            className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all aspect-[16/7] ${
                              processingKey === `${index}-desktop`
                                ? 'border-[#A67C32] bg-[#FAF3E6] text-[#A67C32] animate-pulse'
                                : 'border-[#D8C29D] bg-[#FAF8F3] hover:border-[#A67C32] hover:bg-white text-[#1B1A18]'
                            }`}
                          >
                            <Upload className="w-7 h-7 text-[#A67C32] mb-1.5" />
                            <span className="font-bold text-xs uppercase tracking-wider text-[#A67C32]">
                              {processingKey === `${index}-desktop` ? 'Preparing banner...' : 'Select Desktop Banner'}
                            </span>
                            <span className="text-[10px] text-[#6F6A62] mt-0.5 text-center">
                              Click to choose local image file (JPG, PNG, WebP)
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              disabled={processingKey === `${index}-desktop`}
                              onChange={(e) => {
                                void handleBannerUpload(index, e.target.files, 'desktop');
                                e.currentTarget.value = '';
                              }}
                              className="sr-only"
                            />
                          </label>
                        )}
                      </div>

                      {/* Mobile Banner Local Uploader (Optional) */}
                      <div className="space-y-2 bg-white p-3.5 rounded-xl border border-[#E7E1D7] shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[11px] text-[#1B1A18] flex items-center gap-1.5">
                            <Smartphone className="w-3.5 h-3.5 text-[#A67C32]" /> Mobile Banner Image (Optional)
                          </span>
                          {slide.mobileImageUrl && (
                            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E6F4EA] text-[#2E7D5B] border border-[#2E7D5B]/30">
                              Selected
                            </span>
                          )}
                        </div>

                        {slide.mobileImageUrl ? (
                          <div className="space-y-2">
                            <div className="relative aspect-[16/7] rounded-lg overflow-hidden bg-[#FAF8F3] border border-[#E7E1D7] group">
                              <ImageWithFallback
                                src={slide.mobileImageUrl}
                                alt={`Slide ${index + 1} Mobile`}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <label
                                  className="cursor-pointer bg-white text-[#1B1A18] hover:bg-[#FAF8F3] px-3 py-1.5 rounded-lg text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
                                  title="Replace from Local"
                                >
                                  <RefreshCw className="w-3.5 h-3.5 text-[#A67C32]" /> Replace Local
                                  <input
                                    type="file"
                                    accept="image/*"
                                    disabled={processingKey === `${index}-mobile`}
                                    onChange={(e) => {
                                      void handleBannerUpload(index, e.target.files, 'mobile');
                                      e.currentTarget.value = '';
                                    }}
                                    className="sr-only"
                                  />
                                </label>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveBanner(index, 'mobile')}
                                  className="bg-white text-[#B43C3C] hover:bg-[#FFF5F5] px-3 py-1.5 rounded-lg text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
                                  title="Remove Image"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Remove
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-[#6F6A62]">
                              <span className="truncate max-w-[220px]" title={slide.mobileImageUrl}>
                                {slide.mobileImageUrl.startsWith('data:') ? 'Local file attached (optimized JPEG)' : slide.mobileImageUrl}
                              </span>
                              <label className="text-[#A67C32] font-bold cursor-pointer hover:underline flex items-center gap-1">
                                <RefreshCw className="w-3 h-3" /> Change
                                <input
                                  type="file"
                                  accept="image/*"
                                  disabled={processingKey === `${index}-mobile`}
                                  onChange={(e) => {
                                    void handleBannerUpload(index, e.target.files, 'mobile');
                                    e.currentTarget.value = '';
                                  }}
                                  className="sr-only"
                                />
                              </label>
                            </div>
                          </div>
                        ) : (
                          <label
                            className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all aspect-[16/7] ${
                              processingKey === `${index}-mobile`
                                ? 'border-[#A67C32] bg-[#FAF3E6] text-[#A67C32] animate-pulse'
                                : 'border-[#D8C29D] bg-[#FAF8F3] hover:border-[#A67C32] hover:bg-white text-[#1B1A18]'
                            }`}
                          >
                            <Upload className="w-7 h-7 text-[#A67C32] mb-1.5" />
                            <span className="font-bold text-xs uppercase tracking-wider text-[#A67C32]">
                              {processingKey === `${index}-mobile` ? 'Preparing banner...' : 'Select Mobile Banner'}
                            </span>
                            <span className="text-[10px] text-[#6F6A62] mt-0.5 text-center">
                              Optional (uses desktop banner if left unselected)
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              disabled={processingKey === `${index}-mobile`}
                              onChange={(e) => {
                                void handleBannerUpload(index, e.target.files, 'mobile');
                                e.currentTarget.value = '';
                              }}
                              className="sr-only"
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Optional URL input fallback */}
                    {showUrlInputs[index] && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-dashed border-[#E7E1D7] bg-white p-3 rounded-xl">
                        <div>
                          <label className="font-bold text-[#1B1A18] block mb-1">Desktop Image URL (Direct Link)</label>
                          <input
                            type="text"
                            value={slide.imageUrl || ''}
                            onChange={(e) => updateHeroSlide(index, { imageUrl: e.target.value })}
                            placeholder="https://... or /hero/hero1.png"
                            className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-[#1B1A18] block mb-1">Mobile Image URL (Direct Link)</label>
                          <input
                            type="text"
                            value={slide.mobileImageUrl || ''}
                            onChange={(e) => updateHeroSlide(index, { mobileImageUrl: e.target.value })}
                            placeholder="https://... or /hero/hero1.png"
                            className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs font-mono"
                          />
                        </div>
                      </div>
                    )}
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
