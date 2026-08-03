import React, { useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { useProductStore } from '../../stores/useProductStore';
import { useMetalRateStore } from '../../stores/useMetalRateStore';
import { Product } from '../../types';
import { calculateJewelleryPrice } from '../../utils/pricing';
import { formatINR } from '../../utils/formatters';
import { navigateTo } from '../../utils/navigation';
import { useToast } from '../../components/ui/Toast';
import { ImageWithFallback } from '../../components/ui/ImageWithFallback';
import { ArrowLeft, Save, Plus, Trash2, Sparkles, Calculator, Image as ImageIcon, CheckCircle, Star } from 'lucide-react';

interface AdminProductFormPageProps {
  productId?: string;
}

const STUDIO_IMAGE_PRESETS = [
  {
    title: 'Gold Ring',
    url: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Diamond Necklace',
    url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Gold Jhumka',
    url: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Emerald Pendant',
    url: 'https://images.unsplash.com/photo-1611591475281-a120023a105f?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Gold Bangle Set',
    url: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Silver Maala',
    url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
  },
];

export const AdminProductFormPage: React.FC<AdminProductFormPageProps> = ({ productId }) => {
  const { products, addProduct, updateProduct } = useProductStore();
  const { getRate } = useMetalRateStore();
  const { showToast } = useToast();

  const existing = products.find((p) => p.id === productId);

  const [formData, setFormData] = useState<Partial<Product>>(
    existing || {
      name: '',
      slug: '',
      sku: `VED-${Math.floor(1000 + Math.random() * 9000)}`,
      shortDescription: 'Carefully crafted jewellery creation by Guru Diamonds artisans.',
      category: 'Gold rings',
      subcategory: 'Rings',
      collection: 'Premium Gemstone Heritage',
      gender: 'Women',
      occasion: ['Wedding', 'Festive'],
      description: 'Carefully crafted jewellery creation by Guru Diamonds artisans.',
      pricingMode: 'RATE_LINKED',
      metalType: 'GOLD',
      metalPurity: '22K',
      metalColor: 'Yellow',
      grossWeightGrams: 8.5,
      netWeightGrams: 8.0,
      hallmarked: true,
      certified: true,
      makingChargeType: 'PER_GRAM',
      makingChargeValue: 650,
      wastagePercentage: 2.0,
      gemstones: [],
      certificationCharge: 500,
      packagingCharge: 300,
      gstPercentage: 3,
      totalStock: 1,
      hasVariants: false,
      variantAttributes: [],
      variants: [],
      lowStockThreshold: 1,
      images: ['https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=800&q=80'],
      readyToShip: true,
      dispatchDays: 2,
      returnEligible: true,
      returnPolicyDays: 7,
      codAvailable: true,
      badges: ['HALLMARKED', 'CERTIFIED'],
      tags: ['gold', 'ring', 'royal'],
      rating: 5.0,
      reviewCount: 1,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );

  const [newImageUrl, setNewImageUrl] = useState('');

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    const currentImages = formData.images || [];
    setFormData({
      ...formData,
      images: [...currentImages, newImageUrl.trim()],
    });
    setNewImageUrl('');
    showToast('Image Added', 'New product image link attached.');
  };

  const handleAddPresetImage = (url: string) => {
    const currentImages = formData.images || [];
    if (!currentImages.includes(url)) {
      setFormData({
        ...formData,
        images: [...currentImages, url],
      });
      showToast('Preset Added', 'Studio photography preset linked.');
    }
  };

  const handleRemoveImage = (index: number) => {
    const currentImages = formData.images || [];
    if (currentImages.length <= 1) {
      return alert('Product must have at least one media image.');
    }
    const updated = currentImages.filter((_, i) => i !== index);
    setFormData({ ...formData, images: updated });
  };

  const handleSetPrimaryImage = (index: number) => {
    const currentImages = formData.images || [];
    const selected = currentImages[index];
    const rest = currentImages.filter((_, i) => i !== index);
    setFormData({ ...formData, images: [selected, ...rest] });
    showToast('Primary Thumbnail Updated', 'Set as main product display image.');
  };

  const activeRate = getRate(formData.metalType || 'GOLD', formData.metalPurity || '22K');

  // Live Formula Calculator Preview
  const priceBreakdown = calculateJewelleryPrice({
    pricingMode: formData.pricingMode || 'RATE_LINKED',
    fixedPrice: formData.fixedPrice,
    metalType: formData.metalType || 'GOLD',
    purity: formData.metalPurity || '22K',
    netWeightGrams: formData.netWeightGrams || 1,
    ratePerGram: activeRate,
    makingChargeType: formData.makingChargeType || 'PER_GRAM',
    makingChargeValue: formData.makingChargeValue || 0,
    wastagePercentage: formData.wastagePercentage || 0,
    gemstones: formData.gemstones || [],
    certificationCharge: formData.certificationCharge || 0,
    packagingCharge: formData.packagingCharge || 0,
    gstPercentage: formData.gstPercentage || 3,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return alert('Please enter product name.');

    const finalSlug = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (existing) {
      updateProduct(existing.id, { ...formData, slug: finalSlug });
      showToast('Product Updated', `${formData.name} updated successfully.`);
    } else {
      const newProduct: Product = {
        ...(formData as Product),
        id: `prod-${Date.now()}`,
        slug: finalSlug,
      };
      addProduct(newProduct);
      showToast('New Product Published', `${formData.name} added to storefront catalogue.`);
    }

    navigateTo('/admin/products');
  };

  return (
    <AdminLayout activeTab="products">
      <div className="space-y-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E7E1D7] pb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateTo('/admin/products')}
              className="p-2 border border-[#E7E1D7] rounded-xl hover:bg-[#FAF8F3]"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="font-serif text-2xl font-bold text-[#1B1A18]">
                {existing ? `Edit: ${existing.name}` : 'Create New Jewellery Item'}
              </h1>
              <p className="text-xs text-[#6F6A62]">Configure formula pricing parameters, weight, and gemstones.</p>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-[#A67C32] hover:bg-[#8e6828] text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-lg flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> {existing ? 'Save Changes' : 'Publish Creation'}
          </button>
        </div>

        {/* Form & Live Calculator Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Fields */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6 bg-white p-6 border border-[#E7E1D7] rounded-2xl shadow-sm text-xs">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-base text-[#1B1A18] border-b border-[#E7E1D7] pb-2">
                1. Basic Information
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-[#1B1A18] block mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs"
                    placeholder="e.g. Royal 22K Peacock Jhumka"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#1B1A18] block mb-1">SKU Number</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-[#1B1A18] block mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="Gold rings">Gold rings</option>
                    <option value="Maalas">Maalas</option>
                    <option value="Gemstones">Gemstones</option>
                    <option value="Earrings">Earrings</option>
                    <option value="Necklaces">Necklaces</option>
                    <option value="Chains">Chains</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[#1B1A18] block mb-1">Collection</label>
                  <input
                    type="text"
                    value={formData.collection}
                    onChange={(e) => setFormData({ ...formData, collection: e.target.value })}
                    className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#1B1A18] block mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="Women">Women</option>
                    <option value="Men">Men</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Metal & Weight Parameters */}
            <div className="space-y-4 pt-4 border-t border-[#E7E1D7]">
              <h3 className="font-serif font-bold text-base text-[#1B1A18] border-b border-[#E7E1D7] pb-2">
                2. Metal & Weight Specification
              </h3>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-[#1B1A18] block mb-1">Metal Type</label>
                  <select
                    value={formData.metalType}
                    onChange={(e) => setFormData({ ...formData, metalType: e.target.value as any })}
                    className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="GOLD">Gold</option>
                    <option value="SILVER">Silver</option>
                    <option value="PLATINUM">Platinum</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#1B1A18] block mb-1">Metal Purity</label>
                  <select
                    value={formData.metalPurity}
                    onChange={(e) => setFormData({ ...formData, metalPurity: e.target.value as any })}
                    className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="24K">24K (999)</option>
                    <option value="22K">22K (916)</option>
                    <option value="18K">18K (750)</option>
                    <option value="14K">14K (585)</option>
                    <option value="999">999 Pure Silver</option>
                    <option value="925">925 Sterling Silver</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#1B1A18] block mb-1">Metal Color</label>
                  <input
                    type="text"
                    value={formData.metalColor}
                    onChange={(e) => setFormData({ ...formData, metalColor: e.target.value as Product['metalColor'] })}
                    className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-[#1B1A18] block mb-1">Gross Weight (grams)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.grossWeightGrams}
                    onChange={(e) => setFormData({ ...formData, grossWeightGrams: Number(e.target.value) })}
                    className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#1B1A18] block mb-1">Net Metal Weight (grams)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.netWeightGrams}
                    onChange={(e) => setFormData({ ...formData, netWeightGrams: Number(e.target.value) })}
                    className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs font-bold text-[#A67C32]"
                  />
                </div>
              </div>
            </div>

            {/* Pricing Formula Configuration */}
            <div className="space-y-4 pt-4 border-t border-[#E7E1D7]">
              <h3 className="font-serif font-bold text-base text-[#1B1A18] border-b border-[#E7E1D7] pb-2">
                3. Formula Pricing Parameters
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-[#1B1A18] block mb-1">Pricing Mode</label>
                  <select
                    value={formData.pricingMode}
                    onChange={(e) => setFormData({ ...formData, pricingMode: e.target.value as any })}
                    className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs font-bold text-[#A67C32]"
                  >
                    <option value="RATE_LINKED">Formula Rate-Linked (Live Bullion)</option>
                    <option value="FIXED">Fixed Price Override</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#1B1A18] block mb-1">Making Charge Type</label>
                  <select
                    value={formData.makingChargeType}
                    onChange={(e) => setFormData({ ...formData, makingChargeType: e.target.value as any })}
                    className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="PER_GRAM">Per Gram (₹/g)</option>
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Making Charge (₹)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-[#1B1A18] block mb-1">Making Charge Value</label>
                  <input
                    type="number"
                    value={formData.makingChargeValue}
                    onChange={(e) => setFormData({ ...formData, makingChargeValue: Number(e.target.value) })}
                    className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#1B1A18] block mb-1">Wastage %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.wastagePercentage}
                    onChange={(e) => setFormData({ ...formData, wastagePercentage: Number(e.target.value) })}
                    className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#1B1A18] block mb-1">GST %</label>
                  <input
                    type="number"
                    value={formData.gstPercentage}
                    onChange={(e) => setFormData({ ...formData, gstPercentage: Number(e.target.value) })}
                    className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs font-bold text-[#2E7D5B]"
                  />
                </div>
              </div>
            </div>

            {/* Product Imagery & CMS Media Gallery Section */}
            <div className="space-y-4 pt-4 border-t border-[#E7E1D7]">
              <div className="flex items-center justify-between border-b border-[#E7E1D7] pb-2">
                <h3 className="font-serif font-bold text-base text-[#1B1A18] flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#A67C32]" /> 4. Product Imagery & CMS Media Gallery
                </h3>
                <span className="text-[10px] text-[#6F6A62]">
                  {(formData.images || []).length} Photo(s) Attached
                </span>
              </div>

              {/* Add Custom Image URL Input */}
              <div className="space-y-2 bg-[#FAF8F3] p-4 rounded-xl border border-[#E7E1D7]">
                <label className="font-bold text-[#1B1A18] block">Add Custom Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-... or custom CDN link"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="flex-1 bg-white border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#A67C32]"
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="px-4 py-2 bg-[#A67C32] hover:bg-[#8e6828] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add Image
                  </button>
                </div>
              </div>

              {/* Quick preset gemstone and jewellery studio photography presets */}
              <div className="space-y-2">
                <span className="font-bold text-[#6F6A62] text-[11px] block">
                  Quick Attach Studio Presets:
                </span>
                <div className="flex flex-wrap gap-2">
                  {STUDIO_IMAGE_PRESETS.map((preset, idx) => {
                    const isAttached = (formData.images || []).includes(preset.url);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAddPresetImage(preset.url)}
                        disabled={isAttached}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border flex items-center gap-1.5 transition-all ${
                          isAttached
                            ? 'bg-[#E6F4EA] text-[#2E7D5B] border-[#2E7D5B]/40 opacity-70 cursor-default'
                            : 'bg-white text-[#1B1A18] border-[#E7E1D7] hover:border-[#A67C32] hover:text-[#A67C32]'
                        }`}
                      >
                        {isAttached ? <CheckCircle className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        <span>{preset.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Attached Images Grid Gallery */}
              <div className="space-y-2 pt-2">
                <label className="font-bold text-[#1B1A18] block">Attached Gallery Thumbnails</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {(formData.images || []).map((imgUrl, index) => (
                    <div
                      key={index}
                      className={`relative bg-white border rounded-xl overflow-hidden p-2 space-y-2 transition-all ${
                        index === 0 ? 'border-[#A67C32] ring-2 ring-[#A67C32]/20 shadow-md' : 'border-[#E7E1D7]'
                      }`}
                    >
                      <div className="aspect-square rounded-lg overflow-hidden bg-[#FAF8F3] relative group">
                        <ImageWithFallback src={imgUrl} alt={`Attached ${index + 1}`} className="w-full h-full object-cover" />
                        {index === 0 && (
                          <span className="absolute top-1.5 left-1.5 bg-[#A67C32] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-md flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 fill-current" /> Main Cover
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[10px] gap-1">
                        {index !== 0 ? (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryImage(index)}
                            className="text-[#A67C32] font-bold underline hover:text-[#8e6828]"
                          >
                            Set Main
                          </button>
                        ) : (
                          <span className="text-[#2E7D5B] font-bold">Primary</span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="p-1 text-[#B43C3C] hover:bg-[#FFF5F5] rounded-md transition-colors"
                          title="Remove Image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </form>

          {/* Right: Live Formula Preview Card */}
          <div className="space-y-6 sticky top-28">
            <div className="bg-[#FAF3E6] border border-[#D8C29D] rounded-2xl p-6 space-y-4 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-widest text-[#A67C32] flex items-center gap-1.5">
                <Calculator className="w-4 h-4" /> Live Formula Price Simulator
              </span>

              <div className="space-y-2 bg-white p-4 rounded-xl border border-[#D8C29D] text-xs">
                <div className="flex justify-between">
                  <span className="text-[#6F6A62]">Current Spot Rate ({formData.metalPurity}):</span>
                  <span>{formatINR(activeRate)}/g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6F6A62]">Net Weight:</span>
                  <span>{formData.netWeightGrams}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6F6A62]">Base Metal Value:</span>
                  <span className="font-bold">{formatINR(priceBreakdown.metalValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6F6A62]">Making Charges:</span>
                  <span>{formatINR(priceBreakdown.makingChargeTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6F6A62]">GST (3%):</span>
                  <span>{formatINR(priceBreakdown.gstAmount)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-[#D8C29D] font-bold text-sm">
                  <span>Calculated Retail:</span>
                  <span className="text-[#A67C32]">{formatINR(priceBreakdown.finalPrice)}</span>
                </div>
              </div>

              <p className="text-[11px] text-[#6F6A62] leading-tight">
                Storefront updates automatically in real-time when bullion market spot rates fluctuate.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
