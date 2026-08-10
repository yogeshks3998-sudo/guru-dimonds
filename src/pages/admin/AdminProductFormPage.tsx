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
import { ArrowLeft, Save, Trash2, Calculator, Image as ImageIcon, Star, Upload, RefreshCw } from 'lucide-react';

interface AdminProductFormPageProps {
  productId?: string;
}

const MAX_PRODUCT_IMAGES = 3;
const MAX_IMAGE_WIDTH = 1400;
const IMAGE_QUALITY = 0.82;

function resizeProductImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    return Promise.reject(new Error(`${file.name} is not an image file.`));
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`Unable to read ${file.name}.`));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error(`Unable to process ${file.name}.`));
      image.onload = () => {
        const scale = Math.min(1, MAX_IMAGE_WIDTH / image.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext('2d');
        if (!context) {
          reject(new Error(`Unable to prepare ${file.name}.`));
          return;
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', IMAGE_QUALITY));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export const AdminProductFormPage: React.FC<AdminProductFormPageProps> = ({ productId }) => {
  const { products, addProduct, updateProduct } = useProductStore();
  const { getRate } = useMetalRateStore();
  const { showToast } = useToast();

  const existing = products.find((p) => p.id === productId);

  const [formData, setFormData] = useState<Partial<Product>>(
    existing || {
      name: '',
      slug: '',
      sku: '',
      shortDescription: '',
      category: 'Gemstones',
      subcategory: '',
      collection: '',
      gender: 'Unisex',
      occasion: [],
      description: '',
      pricingMode: 'FIXED',
      fixedPrice: 0,
      metalType: 'SILVER',
      metalPurity: '925',
      metalColor: 'White',
      grossWeightGrams: 0,
      netWeightGrams: 0,
      hallmarked: false,
      certified: false,
      makingChargeType: 'FIXED',
      makingChargeValue: 0,
      wastagePercentage: 0,
      gemstones: [],
      certificationCharge: 0,
      packagingCharge: 0,
      gstPercentage: 3,
      totalStock: 0,
      hasVariants: false,
      variantAttributes: [],
      variants: [],
      lowStockThreshold: 1,
      images: [],
      readyToShip: true,
      dispatchDays: 7,
      returnEligible: true,
      returnPolicyDays: 7,
      codAvailable: true,
      badges: [],
      tags: [],
      rating: 0,
      reviewCount: 0,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );

  const [isProcessingImages, setIsProcessingImages] = useState(false);

  const handleImageUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    const currentImages = formData.images || [];
    const availableSlots = MAX_PRODUCT_IMAGES - currentImages.length;
    if (availableSlots <= 0) {
      alert(`Only ${MAX_PRODUCT_IMAGES} images are allowed for one product.`);
      return;
    }

    setIsProcessingImages(true);
    try {
      const selectedFiles = Array.from(files).slice(0, availableSlots);
      const resizedImages = await Promise.all(selectedFiles.map((file) => resizeProductImage(file)));
      setFormData({ ...formData, images: [...currentImages, ...resizedImages] });
      showToast('Images Uploaded', `${resizedImages.length} product image(s) attached.`);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to upload image.');
    } finally {
      setIsProcessingImages(false);
    }
  };

  const handleReplaceImage = async (index: number, files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;

    setIsProcessingImages(true);
    try {
      const resizedImage = await resizeProductImage(file);
      const updated = [...(formData.images || [])];
      updated[index] = resizedImage;
      setFormData({ ...formData, images: updated });
      showToast('Image Updated', 'Product image replaced successfully.');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to replace image.');
    } finally {
      setIsProcessingImages(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return alert('Please enter product name.');
    if (!formData.sku) return alert('Please enter SKU number.');
    if (!formData.images?.length) return alert('Please upload at least one product image.');

    const finalSlug = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    try {
      if (existing) {
        await updateProduct(existing.id, { ...formData, slug: finalSlug });
        showToast('Product Updated', `${formData.name} updated successfully.`);
      } else {
        const newProduct: Product = {
          ...(formData as Product),
          id: `prod-${Date.now()}`,
          slug: finalSlug,
        };
        await addProduct(newProduct);
        showToast('New Product Published', `${formData.name} added to storefront catalogue.`);
      }

      navigateTo('/admin/products');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to save product. Please try again.');
    }
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
                    className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs font-semibold"
                  >
                    <option value="Rings">Rings</option>
                    <option value="Earrings">Earrings</option>
                    <option value="Neck Jewellery">Neck Jewellery</option>
                    <option value="Pendants">Pendants</option>
                    <option value="Bracelets & Bangles">Bracelets & Bangles</option>
                    <option value="Gemstones">Gemstones</option>
                    <option value="Spiritual Maalas">Spiritual Maalas</option>
                    <option value="Rudraksha (1 to 24 Mukhi)">Rudraksha (1 to 24 Mukhi)</option>
                    <option value="God Small Statues">God Small Statues</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[#1B1A18] block mb-1">Collection</label>
                  <input
                    type="text"
                    value={formData.collection || ''}
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
                    <option value="Kids">Kids</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-[#1B1A18] block mb-1">Subcategory</label>
                  <input
                    type="text"
                    value={formData.subcategory || ''}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#1B1A18] block mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.totalStock ?? 0}
                    onChange={(e) => setFormData({ ...formData, totalStock: Number(e.target.value) })}
                    className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#1B1A18] block mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Product['status'] })}
                    className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="DRAFT">Draft</option>
                    <option value="HIDDEN">Hidden</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#1B1A18] block mb-1">Short Description</label>
                <textarea
                  value={formData.shortDescription || ''}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  className="min-h-20 w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-[#1B1A18] block mb-1">Full Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="min-h-28 w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs"
                />
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
                    value={formData.metalColor || ''}
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
                    value={formData.grossWeightGrams ?? 0}
                    onChange={(e) => setFormData({ ...formData, grossWeightGrams: Number(e.target.value) })}
                    className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#1B1A18] block mb-1">Net Metal Weight (grams)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.netWeightGrams ?? 0}
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
                {formData.pricingMode === 'FIXED' && (
                  <div>
                    <label className="font-bold text-[#1B1A18] block mb-1">Fixed Retail Price</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.fixedPrice ?? 0}
                      onChange={(e) => setFormData({ ...formData, fixedPrice: Number(e.target.value) })}
                      className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs font-bold text-[#A67C32]"
                    />
                  </div>
                )}
                <div>
                  <label className="font-bold text-[#1B1A18] block mb-1">Making Charge Value</label>
                  <input
                    type="number"
                    value={formData.makingChargeValue ?? 0}
                    onChange={(e) => setFormData({ ...formData, makingChargeValue: Number(e.target.value) })}
                    className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#1B1A18] block mb-1">Wastage %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.wastagePercentage ?? 0}
                    onChange={(e) => setFormData({ ...formData, wastagePercentage: Number(e.target.value) })}
                    className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#1B1A18] block mb-1">GST %</label>
                  <input
                    type="number"
                    value={formData.gstPercentage ?? 3}
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

              <div className="bg-[#FAF8F3] p-4 rounded-xl border border-[#E7E1D7]">
                <label
                  className={`flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
                    (formData.images || []).length >= MAX_PRODUCT_IMAGES
                      ? 'border-[#D8C29D] bg-[#F4E4C8]/40 text-[#6F6A62] cursor-not-allowed'
                      : 'border-[#D8C29D] bg-white text-[#1B1A18] hover:border-[#A67C32] hover:bg-[#FFF9F0]'
                  }`}
                >
                  <Upload className="w-7 h-7 text-[#A67C32]" />
                  <span className="font-bold text-xs uppercase tracking-wider">
                    {isProcessingImages ? 'Preparing images...' : 'Upload Product Images'}
                  </span>
                  <span className="text-[11px] text-[#6F6A62]">
                    Upload up to {MAX_PRODUCT_IMAGES} local images. They are resized and saved with the product.
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={isProcessingImages || (formData.images || []).length >= MAX_PRODUCT_IMAGES}
                    onChange={(e) => {
                      void handleImageUpload(e.target.files);
                      e.currentTarget.value = '';
                    }}
                    className="sr-only"
                  />
                </label>
              </div>

              {/* Attached Images Grid Gallery */}
              <div className="space-y-2 pt-2">
                <label className="font-bold text-[#1B1A18] block">Product Image Preview</label>
                {(formData.images || []).length === 0 ? (
                  <div className="rounded-xl border border-[#E7E1D7] bg-[#FAF8F3] p-6 text-center text-xs text-[#6F6A62]">
                    No images uploaded yet.
                  </div>
                ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

                        <div className="flex items-center gap-1">
                          <label
                            className="p-1 text-[#A67C32] hover:bg-[#FAF3E6] rounded-md transition-colors cursor-pointer"
                            title="Replace image"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <input
                              type="file"
                              accept="image/*"
                              disabled={isProcessingImages}
                              onChange={(e) => {
                                void handleReplaceImage(index, e.target.files);
                                e.currentTarget.value = '';
                              }}
                              className="sr-only"
                            />
                          </label>
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
                    </div>
                  ))}
                </div>
                )}
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
