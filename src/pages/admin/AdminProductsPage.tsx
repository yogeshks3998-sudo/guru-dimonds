import React, { useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { useProductStore } from '../../stores/useProductStore';
import { formatINR } from '../../utils/formatters';
import { navigateTo } from '../../utils/navigation';
import { useToast } from '../../components/ui/Toast';
import { ImageWithFallback } from '../../components/ui/ImageWithFallback';
import { Search, Plus, Edit3, Trash2, Eye, BadgeAlert, Sparkles, Layers, ToggleLeft, ToggleRight } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { roleCan } from '../../utils/permissions';
import { isProductActive } from '../../utils/productFilters';
import { Product } from '../../types';

export const AdminProductsPage: React.FC = () => {
  const { products, deleteProduct, updateProduct } = useProductStore();
  const { adminUser } = useAuthStore();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
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

  return (
    <AdminLayout activeTab="products">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E7E1D7] pb-6">
          <div>
            <h1 className="font-serif text-3xl font-bold text-[#1B1A18]">Jewellery Product Catalog</h1>
            <p className="text-xs text-[#6F6A62]">
              Manage 100% hallmarked gold, silver, gemstone creations and formula pricing configurations.
            </p>
          </div>

          {canWrite && (
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigateTo('/admin/categories')}
                className="px-4 py-3 bg-[#FAF3E6] hover:bg-[#F2E8D5] text-[#A67C32] border border-[#D8C29D] text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all shadow-xs"
              >
                <Layers className="w-4 h-4" /> Manage Categories
              </button>
              <button
                onClick={() => navigateTo('/admin/products/new')}
                className="px-6 py-3 bg-[#A67C32] hover:bg-[#8e6828] text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-lg flex items-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" /> Add New Product
              </button>
            </div>
          )}
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white border border-[#E7E1D7] rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#6F6A62] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by SKU, name, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl pl-9 pr-3 py-2 text-xs text-[#1B1A18] focus:outline-none focus:border-[#A67C32]"
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
                  <th className="p-3">Pricing Mode</th>
                  <th className="p-3">Stock Status</th>
                  <th className="p-3 text-center">Status / Live</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E1D7]">
                {filteredProducts.map((product) => (
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
                              title="Edit Product"
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
