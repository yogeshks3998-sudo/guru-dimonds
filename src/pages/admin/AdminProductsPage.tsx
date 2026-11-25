import React, { useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { useProductStore } from '../../stores/useProductStore';
import { useMetalRateStore } from '../../stores/useMetalRateStore';
import { calculateJewelleryPrice } from '../../utils/pricing';
import { formatINR } from '../../utils/formatters';
import { navigateTo } from '../../utils/navigation';
import { useToast } from '../../components/ui/Toast';
import { ImageWithFallback } from '../../components/ui/ImageWithFallback';
import { Search, Plus, Edit3, Trash2, Eye, Tag, X, Save, Calculator, Gem, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { roleCan } from '../../utils/permissions';
import { isProductActive } from '../../utils/productFilters';
import { Product, GemstoneInfo } from '../../types';

export const AdminProductsPage: React.FC = () => {
  const { products, deleteProduct, updateProduct } = useProductStore();
  const { getRate } = useMetalRateStore();
  const { adminUser } = useAuthStore();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [priceEditProduct, setPriceEditProduct] = useState<Product | null>(null);
  const [priceFormData, setPriceFormData] = useState<Partial<Product>>({});
  const [isSavingPrice, setIsSavingPrice] = useState(false);
  const canWrite = roleCan(adminUser?.role, 'PRODUCT_MANAGER');

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleStatus = async (product: Product) => {
    if (!canWrite) return;
    const currentActive = isProductActive(product);
    const nextStatus = currentActive ? 'HIDDEN' : 'ACTIVE';
    const nextEnabled = !currentActive;

    try {
      await updateProduct(product.id, {
        status: nextStatus,
        enabled: nextEnabled,
      });
      showToast(
        nextEnabled ? 'Product is ON (Active)' : 'Product is OFF (Hidden)',
        `${product.name} is now ${nextEnabled ? 'visible to customers' : 'hidden from storefront'}.`
      );
    } catch (error) {
      showToast('Update Failed', error instanceof Error ? error.message : 'Could not change product status', 'error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await deleteProduct(id);
        showToast('Product Removed', `${name} deleted from catalogue.`);
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Unable to delete product. Please try again.');
      }
    }
  };

  const handleOpenPriceModal = (product: Product) => {
    setPriceEditProduct(product);
    setPriceFormData({
      pricingMode: product.pricingMode || 'RATE_LINKED',
      fixedPrice: product.fixedPrice || 0,
      compareAtPrice: product.compareAtPrice,
      makingChargeType: product.makingChargeType || 'PER_GRAM',
      makingChargeValue: product.makingChargeValue || 0,
      wastagePercentage: product.wastagePercentage || 0,
      certificationCharge: product.certificationCharge || 0,
      packagingCharge: product.packagingCharge || 0,
      gstPercentage: product.gstPercentage ?? 3,
      gemstones: product.gemstones ? JSON.parse(JSON.stringify(product.gemstones)) : [],
    });
  };

  const handleSavePriceModal = async () => {
    if (!priceEditProduct) return;
    setIsSavingPrice(true);
    try {
      await updateProduct(priceEditProduct.id, {
        ...priceFormData,
      });
      showToast('Price Updated', `Commercial pricing for ${priceEditProduct.name} saved successfully.`);
      setPriceEditProduct(null);
    } catch (error) {
      showToast('Update Failed', error instanceof Error ? error.message : 'Could not save pricing.', 'error');
    } finally {
      setIsSavingPrice(false);
    }
  };

  const handleAddModalGemstone = () => {
    const newGem: GemstoneInfo = {
      type: 'Diamond',
      weightCaratOrGrams: 0.1,
      color: 'G-H',
      clarity: 'VS-SI',
      count: 1,
      totalPrice: 5000,
      certified: true,
    };
    setPriceFormData({
      ...priceFormData,
      gemstones: [...(priceFormData.gemstones || []), newGem],
    });
  };

  const handleUpdateModalGemstone = (index: number, updated: Partial<GemstoneInfo>) => {
    const list = [...(priceFormData.gemstones || [])];
    list[index] = { ...list[index], ...updated };
    setPriceFormData({ ...priceFormData, gemstones: list });
  };

  const handleRemoveModalGemstone = (index: number) => {
    const list = (priceFormData.gemstones || []).filter((_, i) => i !== index);
    setPriceFormData({ ...priceFormData, gemstones: list });
  };

  const modalActiveRate = priceEditProduct
    ? getRate(priceEditProduct.metalType, priceEditProduct.metalPurity)
    : 0;

  const modalPriceBreakdown = priceEditProduct
    ? calculateJewelleryPrice({
        pricingMode: priceFormData.pricingMode || 'RATE_LINKED',
        fixedPrice: priceFormData.fixedPrice,
        metalType: priceEditProduct.metalType,
        purity: priceEditProduct.metalPurity,
        netWeightGrams: priceEditProduct.netWeightGrams,
        ratePerGram: modalActiveRate,
        makingChargeType: priceFormData.makingChargeType || 'PER_GRAM',
        makingChargeValue: priceFormData.makingChargeValue || 0,
        wastagePercentage: priceFormData.wastagePercentage || 0,
        gemstones: priceFormData.gemstones || [],
        certificationCharge: priceFormData.certificationCharge || 0,
        packagingCharge: priceFormData.packagingCharge || 0,
        gstPercentage: priceFormData.gstPercentage || 3,
      })
    : null;

  return (
    <AdminLayout activeTab="products">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-[#1B1A18]">Product Catalogue</h1>
            <p className="text-[#6F6A62] text-sm mt-1">
              Manage inventory, live formula pricing, SKU details, and customer storefront visibility.
            </p>
          </div>
          {canWrite && (
            <button
              onClick={() => navigateTo('/admin/products/new')}
              className="bg-[#A67C32] hover:bg-[#8C682A] text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" /> Add New Product
            </button>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-[#E7E1D7] p-4 rounded-2xl shadow-sm">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6F6A62]" />
            <input
              type="text"
              placeholder="Search products by title, SKU, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl text-xs focus:outline-none focus:border-[#A67C32]"
            />
          </div>

          <span className="text-xs text-[#6F6A62]">
            Total Catalog Items: <strong>{filteredProducts.length}</strong>
          </span>
        </div>

        {/* Products Table */}
        <div className="bg-white border border-[#E7E1D7] rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#1B1A18]">
              <thead className="bg-[#FAF8F3] text-[#6F6A62] font-bold uppercase tracking-wider border-b border-[#E7E1D7]">
                <tr>
                  <th className="p-3">Product</th>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Metal & Purity</th>
                  <th className="p-3">Net Wt</th>
                  <th className="p-3">Retail Price</th>
                  <th className="p-3">Pricing Mode</th>
                  <th className="p-3">Stock Status</th>
                  <th className="p-3 text-center">Status / Live</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E1D7]">
                {filteredProducts.map((product) => {
                  const currentMetalRate = getRate(product.metalType, product.metalPurity);
                  const pricing = calculateJewelleryPrice({
                    pricingMode: product.pricingMode,
                    fixedPrice: product.fixedPrice,
                    metalType: product.metalType,
                    purity: product.metalPurity,
                    netWeightGrams: product.netWeightGrams,
                    ratePerGram: currentMetalRate,
                    makingChargeType: product.makingChargeType,
                    makingChargeValue: product.makingChargeValue,
                    wastagePercentage: product.wastagePercentage,
                    gemstones: product.gemstones,
                    certificationCharge: product.certificationCharge,
                    packagingCharge: product.packagingCharge,
                    gstPercentage: product.gstPercentage,
                  });
                  return (
                    <tr key={product.id} className="hover:bg-[#FAF8F3] transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <ImageWithFallback
                            src={product.images[0]}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-xl bg-[#FAF8F3] shrink-0"
                          />
                          <div>
                            <h5 className="font-product font-bold text-[#1B1A18] line-clamp-1">{product.name}</h5>
                            <span className="text-[10px] text-[#A67C32] uppercase font-semibold">
                              {product.collection}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-mono text-[#6F6A62]">{product.sku}</td>
                      <td className="p-3 font-semibold">{product.category}</td>
                      <td className="p-3">
                        {product.metalPurity} {product.metalType}
                      </td>
                      <td className="p-3 font-bold">{product.netWeightGrams}g</td>
                      <td className="p-3">
                        <div
                          onClick={() => canWrite && handleOpenPriceModal(product)}
                          className={`flex flex-col ${canWrite ? 'cursor-pointer group' : ''}`}
                          title={canWrite ? 'Click to edit detailed price' : undefined}
                        >
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-[#A67C32] font-mono text-sm group-hover:underline">
                              {formatINR(pricing.finalPrice)}
                            </span>
                            {canWrite && <Tag className="w-3 h-3 text-[#A67C32] opacity-0 group-hover:opacity-100 transition-opacity" />}
                          </div>
                          {product.compareAtPrice && product.compareAtPrice > pricing.finalPrice ? (
                            <span className="text-[10px] line-through text-[#6F6A62] font-mono">
                              {formatINR(product.compareAtPrice)}
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#FAF3E6] text-[#A67C32] border border-[#D8C29D]">
                          {product.pricingMode}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#E6F4EA] text-[#2E7D5B] border border-[#2E7D5B]">
                          {product.readyToShip ? 'READY TO SHIP' : 'MADE TO ORDER'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="inline-flex items-center justify-center gap-2">
                          <button
                            type="button"
                            disabled={!canWrite}
                            onClick={() => handleToggleStatus(product)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              isProductActive(product) ? 'bg-[#2E7D5B]' : 'bg-[#D1D5DB]'
                            } ${!canWrite ? 'opacity-60 cursor-not-allowed' : ''}`}
                            title={isProductActive(product) ? 'Product is ON (Click to turn OFF)' : 'Product is OFF (Click to turn ON)'}
                            aria-label={`Toggle ON/OFF for ${product.name}`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                isProductActive(product) ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                          <span className={`text-[10px] font-bold uppercase min-w-[28px] text-left ${isProductActive(product) ? 'text-[#2E7D5B]' : 'text-[#6F6A62]'}`}>
                            {isProductActive(product) ? 'ON' : 'OFF'}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {canWrite && (
                            <button
                              onClick={() => handleOpenPriceModal(product)}
                              className="p-1.5 text-[#6F6A62] hover:text-[#A67C32] hover:bg-[#FAF3E6] rounded-lg transition-colors"
                              title="Edit Detailed Pricing & Commercials"
                            >
                              <Tag className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => navigateTo(`/product/${product.slug}`)}
                            className="p-1.5 text-[#6F6A62] hover:text-[#A67C32]"
                            title="View on Storefront"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {canWrite && (
                            <>
                              <button
                                onClick={() => navigateTo(`/admin/products/edit/${product.id}`)}
                                className="p-1.5 text-[#6F6A62] hover:text-[#A67C32]"
                                title="Edit Complete Product"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(product.id, product.name)}
                                className="p-1.5 text-[#6F6A62] hover:text-[#B43C3C]"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Individual Product Pricing Edit Modal */}
        {priceEditProduct && modalPriceBreakdown && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl border border-[#E7E1D7] shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto space-y-6 p-6 my-8 animate-in fade-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-[#E7E1D7] pb-4">
                <div className="flex items-center gap-3">
                  <ImageWithFallback
                    src={priceEditProduct.images[0]}
                    alt={priceEditProduct.name}
                    className="w-14 h-14 object-cover rounded-xl bg-[#FAF8F3] border border-[#E7E1D7]"
                  />
                  <div>
                    <span className="text-[10px] font-bold text-[#A67C32] uppercase tracking-wider">
                      Product Pricing & Commercial Editor
                    </span>
                    <h2 className="font-serif text-xl font-bold text-[#1B1A18] line-clamp-1">
                      {priceEditProduct.name}
                    </h2>
                    <div className="flex items-center gap-3 text-xs text-[#6F6A62] mt-0.5">
                      <span>SKU: <strong className="font-mono text-[#1B1A18]">{priceEditProduct.sku}</strong></span>
                      <span>•</span>
                      <span>{priceEditProduct.metalPurity} {priceEditProduct.metalType} ({priceEditProduct.netWeightGrams}g)</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setPriceEditProduct(null)}
                  className="p-2 text-[#6F6A62] hover:text-[#1B1A18] hover:bg-[#FAF8F3] rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body: Two Columns */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form Controls (2 Columns) */}
                <div className="lg:col-span-2 space-y-5 text-xs">
                  {/* Primary Price & Mode */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#FAF8F3] p-4 rounded-xl border border-[#E7E1D7]">
                    <div>
                      <label className="font-bold text-[#1B1A18] block mb-1">
                        {priceFormData.pricingMode === 'FIXED' ? 'Fixed Selling Price (₹)' : 'Base Benchmark Price (₹)'}
                      </label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-2 text-[#6F6A62] font-bold">₹</span>
                        <input
                          type="number"
                          min="0"
                          value={priceFormData.fixedPrice ?? 0}
                          onChange={(e) => setPriceFormData({ ...priceFormData, fixedPrice: Number(e.target.value) })}
                          className="w-full bg-white border border-[#E7E1D7] rounded-xl pl-6 pr-2 py-1.5 font-bold font-mono text-[#A67C32]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-[#1B1A18] block mb-1">Original MRP / Compare (₹)</label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-2 text-[#6F6A62] font-bold">₹</span>
                        <input
                          type="number"
                          min="0"
                          value={priceFormData.compareAtPrice ?? ''}
                          onChange={(e) =>
                            setPriceFormData({
                              ...priceFormData,
                              compareAtPrice: e.target.value ? Number(e.target.value) : undefined,
                            })
                          }
                          placeholder="Optional MRP"
                          className="w-full bg-white border border-[#E7E1D7] rounded-xl pl-6 pr-2 py-1.5 font-mono text-[#6F6A62]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-[#1B1A18] block mb-1">Pricing Mode</label>
                      <select
                        value={priceFormData.pricingMode}
                        onChange={(e) => setPriceFormData({ ...priceFormData, pricingMode: e.target.value as any })}
                        className="w-full bg-white border border-[#E7E1D7] rounded-xl px-2.5 py-1.5 font-bold text-[#A67C32]"
                      >
                        <option value="RATE_LINKED">Rate-Linked (Live Spot)</option>
                        <option value="FIXED">Fixed Price (Override)</option>
                      </select>
                    </div>
                  </div>

                  {/* Making Charges & Wastage */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3 rounded-xl border border-[#E7E1D7]">
                    <div>
                      <label className="font-bold text-[#1B1A18] block mb-1">Making Charge</label>
                      <select
                        value={priceFormData.makingChargeType}
                        onChange={(e) => setPriceFormData({ ...priceFormData, makingChargeType: e.target.value as any })}
                        className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-lg px-2 py-1.5"
                      >
                        <option value="PER_GRAM">₹ / gram</option>
                        <option value="PERCENTAGE">% of metal</option>
                        <option value="FIXED">Flat ₹</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-[#1B1A18] block mb-1">Making Value</label>
                      <input
                        type="number"
                        min="0"
                        value={priceFormData.makingChargeValue ?? 0}
                        onChange={(e) => setPriceFormData({ ...priceFormData, makingChargeValue: Number(e.target.value) })}
                        className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-lg px-2 py-1.5 font-bold font-mono"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-[#1B1A18] block mb-1">Wastage / VA %</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={priceFormData.wastagePercentage ?? 0}
                        onChange={(e) => setPriceFormData({ ...priceFormData, wastagePercentage: Number(e.target.value) })}
                        className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-lg px-2 py-1.5 font-mono"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-[#1B1A18] block mb-1">GST %</label>
                      <input
                        type="number"
                        value={priceFormData.gstPercentage ?? 3}
                        onChange={(e) => setPriceFormData({ ...priceFormData, gstPercentage: Number(e.target.value) })}
                        className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-lg px-2 py-1.5 font-bold text-[#2E7D5B] font-mono"
                      />
                    </div>
                  </div>

                  {/* Surcharges */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-[#1B1A18] block mb-1">Certification Charge (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={priceFormData.certificationCharge ?? 0}
                        onChange={(e) => setPriceFormData({ ...priceFormData, certificationCharge: Number(e.target.value) })}
                        className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl px-3 py-1.5 font-mono"
                        placeholder="e.g. 500"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-[#1B1A18] block mb-1">Packaging Charge (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={priceFormData.packagingCharge ?? 0}
                        onChange={(e) => setPriceFormData({ ...priceFormData, packagingCharge: Number(e.target.value) })}
                        className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl px-3 py-1.5 font-mono"
                        placeholder="e.g. 250"
                      />
                    </div>
                  </div>

                  {/* Gemstones & Diamonds Section in Modal */}
                  <div className="space-y-3 pt-3 border-t border-[#E7E1D7]">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#1B1A18] text-xs flex items-center gap-1.5">
                        <Gem className="w-3.5 h-3.5 text-[#A67C32]" /> Diamonds & Gemstones ({(priceFormData.gemstones || []).length})
                      </span>
                      <button
                        type="button"
                        onClick={handleAddModalGemstone}
                        className="px-2.5 py-1 bg-[#FAF3E6] text-[#A67C32] border border-[#D8C29D] rounded-lg font-bold text-[10px] flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add Stone
                      </button>
                    </div>

                    {(priceFormData.gemstones || []).length > 0 && (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {priceFormData.gemstones?.map((gem, index) => (
                          <div key={index} className="bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl p-2.5 flex items-center gap-2">
                            <select
                              value={gem.type}
                              onChange={(e) => handleUpdateModalGemstone(index, { type: e.target.value })}
                              className="bg-white border border-[#E7E1D7] rounded-lg px-2 py-1 text-[11px] font-bold flex-1"
                            >
                              <option value="Diamond">Natural Diamond</option>
                              <option value="Solitaire">Solitaire Diamond</option>
                              <option value="Lab Grown Diamond">Lab Grown Diamond</option>
                              <option value="Emerald">Natural Emerald</option>
                              <option value="Ruby">Natural Ruby</option>
                              <option value="Blue Sapphire">Blue Sapphire</option>
                              <option value="Pearl">Natural Pearl</option>
                              <option value="Moissanite">Moissanite</option>
                              <option value="Polki">Polki</option>
                              <option value="Cubic Zirconia">Cubic Zirconia</option>
                              <option value="Other">Other</option>
                            </select>

                            <input
                              type="number"
                              step="0.01"
                              placeholder="Carat"
                              value={gem.weightCaratOrGrams}
                              onChange={(e) => handleUpdateModalGemstone(index, { weightCaratOrGrams: Number(e.target.value) })}
                              className="w-16 bg-white border border-[#E7E1D7] rounded-lg px-1.5 py-1 text-[11px] font-mono text-center"
                            />

                            <div className="relative w-24">
                              <span className="absolute left-1.5 top-1 text-[10px] text-[#6F6A62]">₹</span>
                              <input
                                type="number"
                                placeholder="Total ₹"
                                value={gem.totalPrice}
                                onChange={(e) => handleUpdateModalGemstone(index, { totalPrice: Number(e.target.value) })}
                                className="w-full bg-white border border-[#E7E1D7] rounded-lg pl-4 pr-1.5 py-1 text-[11px] font-bold font-mono text-[#A67C32]"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveModalGemstone(index)}
                              className="p-1 text-[#6F6A62] hover:text-[#B43C3C]"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Live Calculation Breakdown Card */}
                <div className="bg-[#FAF3E6] border border-[#D8C29D] rounded-xl p-4 space-y-3 flex flex-col justify-between text-xs">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-[#D8C29D] pb-2">
                      <span className="font-bold uppercase tracking-wider text-[#A67C32] flex items-center gap-1.5">
                        <Calculator className="w-4 h-4" /> Live Breakdown
                      </span>
                      <span className="text-[10px] font-bold bg-white text-[#A67C32] px-2 py-0.5 rounded-full border border-[#D8C29D]">
                        {priceFormData.pricingMode}
                      </span>
                    </div>

                    <div className="space-y-2 bg-white p-3 rounded-xl border border-[#D8C29D] text-[11px]">
                      <div className="flex justify-between text-[#6F6A62]">
                        <span>Spot Rate ({priceEditProduct.metalPurity}):</span>
                        <span className="font-mono font-bold text-[#1B1A18]">{formatINR(modalActiveRate)}/g</span>
                      </div>
                      <div className="flex justify-between text-[#6F6A62]">
                        <span>Metal Value:</span>
                        <span className="font-mono font-bold text-[#1B1A18]">{formatINR(modalPriceBreakdown.metalValue)}</span>
                      </div>
                      {modalPriceBreakdown.wastageValue > 0 && (
                        <div className="flex justify-between text-[#6F6A62]">
                          <span>Wastage ({priceFormData.wastagePercentage}%):</span>
                          <span className="font-mono text-[#1B1A18]">{formatINR(modalPriceBreakdown.wastageValue)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-[#6F6A62]">
                        <span>Making Charges:</span>
                        <span className="font-mono text-[#1B1A18]">{formatINR(modalPriceBreakdown.makingChargeTotal)}</span>
                      </div>
                      {modalPriceBreakdown.gemstoneValue > 0 && (
                        <div className="flex justify-between text-[#6F6A62]">
                          <span>Diamonds / Gems:</span>
                          <span className="font-mono font-bold text-[#A67C32]">{formatINR(modalPriceBreakdown.gemstoneValue)}</span>
                        </div>
                      )}
                      {(priceFormData.certificationCharge || 0) > 0 && (
                        <div className="flex justify-between text-[#6F6A62]">
                          <span>Certification:</span>
                          <span className="font-mono text-[#1B1A18]">{formatINR(priceFormData.certificationCharge || 0)}</span>
                        </div>
                      )}
                      {(priceFormData.packagingCharge || 0) > 0 && (
                        <div className="flex justify-between text-[#6F6A62]">
                          <span>Packaging:</span>
                          <span className="font-mono text-[#1B1A18]">{formatINR(priceFormData.packagingCharge || 0)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-[#6F6A62] pt-1.5 border-t border-dashed border-[#E7E1D7]">
                        <span>Subtotal:</span>
                        <span className="font-mono font-bold text-[#1B1A18]">{formatINR(modalPriceBreakdown.discountedSubtotal)}</span>
                      </div>
                      <div className="flex justify-between text-[#6F6A62]">
                        <span>GST ({priceFormData.gstPercentage || 3}%):</span>
                        <span className="font-mono text-[#2E7D5B] font-semibold">{formatINR(modalPriceBreakdown.gstAmount)}</span>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-[#D8C29D] font-bold text-sm">
                        <span className="text-[#1B1A18]">Final Price:</span>
                        <span className="text-[#A67C32] font-mono text-base">{formatINR(modalPriceBreakdown.finalPrice)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-2">
                    <button
                      type="button"
                      disabled={isSavingPrice}
                      onClick={handleSavePriceModal}
                      className="w-full py-2.5 bg-[#A67C32] hover:bg-[#8e6828] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                    >
                      <Save className="w-4 h-4" /> {isSavingPrice ? 'Saving...' : 'Save Product Price'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPriceEditProduct(null)}
                      className="w-full py-2 bg-white hover:bg-[#FAF8F3] text-[#6F6A62] font-bold text-xs rounded-xl border border-[#D8C29D] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
