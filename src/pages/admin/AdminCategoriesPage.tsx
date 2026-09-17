import React, { useState, useMemo } from 'react';
import { AdminLayout } from './AdminLayout';
import { useCategoryStore } from '../../stores/useCategoryStore';
import { useProductStore } from '../../stores/useProductStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { roleCan } from '../../utils/permissions';
import { useToast } from '../../components/ui/Toast';
import { ImageWithFallback } from '../../components/ui/ImageWithFallback';
import { productMatchesCategory } from '../../utils/productFilters';
import { Category } from '../../types';
import {
  Layers,
  Plus,
  Search,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  Upload,
  Image as ImageIcon,
  Tag,
  Star,
  AlertTriangle,
  X,
  Package,
} from 'lucide-react';

export const AdminCategoriesPage: React.FC = () => {
  const { categories, toggleCategoryStatus, addCategory, updateCategory, deleteCategory } = useCategoryStore();
  const { products } = useProductStore();
  const { adminUser } = useAuthStore();
  const { showToast } = useToast();

  const canManage = roleCan(adminUser?.role, 'PRODUCT_MANAGER', 'CONTENT_MANAGER');

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteConfirmCat, setDeleteConfirmCat] = useState<Category | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formFeatured, setFormFeatured] = useState(false);
  const [formEnabled, setFormEnabled] = useState(true);
  const [subcatInput, setSubcatInput] = useState('');
  const [subcategories, setSubcategories] = useState<string[]>([]);

  // Count products per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    categories.forEach((cat) => {
      counts[cat.id] = products.filter((p) => productMatchesCategory(p, cat.name)).length;
    });
    return counts;
  }, [categories, products]);

  const activeCount = categories.filter((c) => c.enabled !== false).length;
  const inactiveCount = categories.length - activeCount;
  const totalProductsLinked = Object.values(categoryCounts).reduce<number>((a, b) => a + Number(b), 0);

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const matchesSearch =
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cat.subcategories || []).some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;

      if (filterStatus === 'ACTIVE') return cat.enabled !== false;
      if (filterStatus === 'INACTIVE') return cat.enabled === false;
      return true;
    });
  }, [categories, searchTerm, filterStatus]);

  const openAddModal = () => {
    setEditingCategory(null);
    setFormName('');
    setFormSlug('');
    setFormDescription('');
    setFormImage('/categories/Pendants.png');
    setFormFeatured(false);
    setFormEnabled(true);
    setSubcategories([]);
    setSubcatInput('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormDescription(cat.description || '');
    setFormImage(cat.image || '');
    setFormFeatured(Boolean(cat.featured));
    setFormEnabled(cat.enabled !== false);
    setSubcategories(Array.isArray(cat.subcategories) ? [...cat.subcategories] : []);
    setSubcatInput('');
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setFormName(val);
    if (!editingCategory) {
      // Auto-generate slug when creating new category
      const autoSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setFormSlug(autoSlug);
    }
  };

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setFormImage(String(event.target.result));
        showToast('Image Loaded', 'Local category image prepared.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddSubcategory = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const clean = subcatInput.trim();
    if (clean && !subcategories.includes(clean)) {
      setSubcategories([...subcategories, clean]);
      setSubcatInput('');
    }
  };

  const handleRemoveSubcategory = (tagToRemove: string) => {
    setSubcategories(subcategories.filter((s) => s !== tagToRemove));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Category Name is required.');
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, {
          name: formName.trim(),
          slug: formSlug.trim() || formName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: formDescription.trim(),
          image: formImage.trim() || '/categories/Pendants.png',
          featured: formFeatured,
          enabled: formEnabled,
          subcategories,
        });
        showToast('Category Updated', `"${formName}" details updated successfully.`);
      } else {
        await addCategory({
          name: formName.trim(),
          slug: formSlug.trim() || formName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: formDescription.trim(),
          image: formImage.trim() || '/categories/Pendants.png',
          featured: formFeatured,
          enabled: formEnabled,
          subcategories,
        });
        showToast('Category Created', `New category "${formName}" created and ready.`);
      }
      setIsModalOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save category.');
    }
  };

  const handleToggle = async (cat: Category) => {
    try {
      await toggleCategoryStatus(cat.id);
      const nextState = cat.enabled === false ? 'enabled (ON)' : 'disabled (OFF)';
      showToast('Category Status', `"${cat.name}" is now ${nextState}.`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Unable to toggle status.');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmCat) return;
    try {
      await deleteCategory(deleteConfirmCat.id);
      showToast('Category Deleted', `"${deleteConfirmCat.name}" removed from catalog.`);
      setDeleteConfirmCat(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Unable to delete category.');
    }
  };

  return (
    <AdminLayout activeTab="categories">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E7E1D7] pb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-3xl font-bold text-[#1B1A18]">Category & Catalog Management</h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FAF3E6] text-[#A67C32] border border-[#D8C29D]">
                {categories.length} Total
              </span>
            </div>
            <p className="text-xs text-[#6F6A62] mt-1">
              Add new categories for fresh product launches, turn categories ON/OFF in the shop, and organize subcategory filters.
            </p>
          </div>

          {canManage && (
            <button
              onClick={openAddModal}
              className="px-6 py-3 bg-[#A67C32] hover:bg-[#8e6828] text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-lg flex items-center gap-2 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" /> Add New Category
            </button>
          )}
        </div>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-[#E7E1D7] rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-bold text-[#6F6A62] uppercase tracking-wider block">Total Categories</span>
            <span className="font-serif text-2xl font-bold text-[#1B1A18] mt-1 block">{categories.length}</span>
          </div>

          <div className="bg-white border border-[#E7E1D7] rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-bold text-[#2E7D5B] uppercase tracking-wider block">Active in Shop (ON)</span>
            <span className="font-serif text-2xl font-bold text-[#2E7D5B] mt-1 block">{activeCount}</span>
          </div>

          <div className="bg-white border border-[#E7E1D7] rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-bold text-[#B43C3C] uppercase tracking-wider block">Hidden in Shop (OFF)</span>
            <span className="font-serif text-2xl font-bold text-[#B43C3C] mt-1 block">{inactiveCount}</span>
          </div>

          <div className="bg-white border border-[#E7E1D7] rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-bold text-[#A67C32] uppercase tracking-wider block">Linked Store Products</span>
            <span className="font-serif text-2xl font-bold text-[#1B1A18] mt-1 block">{totalProductsLinked}</span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white border border-[#E7E1D7] rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#6F6A62] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search category name, slug, subcategories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl pl-9 pr-3 py-2 text-xs text-[#1B1A18] focus:outline-none focus:border-[#A67C32]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-[#6F6A62]">Status:</span>
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                filterStatus === 'ALL' ? 'bg-[#A67C32] text-white' : 'bg-[#FAF8F3] text-[#6F6A62] hover:bg-[#FAF3E6]'
              }`}
            >
              All ({categories.length})
            </button>
            <button
              onClick={() => setFilterStatus('ACTIVE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                filterStatus === 'ACTIVE' ? 'bg-[#2E7D5B] text-white' : 'bg-[#FAF8F3] text-[#6F6A62] hover:bg-[#FAF3E6]'
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => setFilterStatus('INACTIVE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                filterStatus === 'INACTIVE' ? 'bg-[#B43C3C] text-white' : 'bg-[#FAF8F3] text-[#6F6A62] hover:bg-[#FAF3E6]'
              }`}
            >
              Inactive ({inactiveCount})
            </button>
          </div>
        </div>

        {/* Categories List / Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredCategories.map((cat) => {
            const count = categoryCounts[cat.id] || 0;
            const isEnabled = cat.enabled !== false;

            return (
              <div
                key={cat.id}
                className={`bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                  isEnabled ? 'border-[#E7E1D7]' : 'border-[#E7E1D7] opacity-75 bg-[#FCFBF8]'
                }`}
              >
                <div className="space-y-4">
                  {/* Card Header: Image, Title, Status */}
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-[#FAF8F3] border border-[#E7E1D7] overflow-hidden shrink-0 flex items-center justify-center">
                      <ImageWithFallback
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-serif font-bold text-base text-[#1B1A18] truncate">{cat.name}</h3>
                        {cat.featured && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#A67C32] bg-[#FAF3E6] border border-[#D8C29D] px-2 py-0.5 rounded-full">
                            <Star className="w-3 h-3 fill-[#A67C32]" /> Featured
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] font-mono text-[#6F6A62] truncate">/{cat.slug}</p>

                      <div className="mt-2 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1B1A18] bg-[#FAF8F3] border border-[#E7E1D7] px-2.5 py-0.5 rounded-lg">
                          <Package className="w-3 h-3 text-[#A67C32]" />
                          {count} Products
                        </span>

                        {isEnabled ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2E7D5B] bg-[#E6F4EA] px-2 py-0.5 rounded-lg">
                            <CheckCircle2 className="w-3 h-3" /> Visible in Shop
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#B43C3C] bg-[#FCE8E6] px-2 py-0.5 rounded-lg">
                            <XCircle className="w-3 h-3" /> Hidden
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {cat.description && (
                    <p className="text-xs text-[#5A524C] line-clamp-2 leading-relaxed">
                      {cat.description}
                    </p>
                  )}

                  {/* Subcategories Tags */}
                  {cat.subcategories && cat.subcategories.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-[#F2EFE9]">
                      <span className="text-[10px] font-bold text-[#6F6A62] uppercase tracking-wider block">
                        Subcategories ({cat.subcategories.length}):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {cat.subcategories.slice(0, 4).map((sub, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-medium bg-[#FAF8F3] border border-[#E7E1D7] px-2 py-0.5 rounded-md text-[#5A524C]"
                          >
                            {sub}
                          </span>
                        ))}
                        {cat.subcategories.length > 4 && (
                          <span className="text-[10px] text-[#A67C32] font-bold px-1.5 py-0.5">
                            +{cat.subcategories.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="pt-4 mt-4 border-t border-[#E7E1D7] flex items-center justify-between gap-2">
                  {/* ON / OFF Switch */}
                  <button
                    type="button"
                    onClick={() => handleToggle(cat)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isEnabled
                        ? 'bg-[#E6F4EA] hover:bg-[#d4edd9] text-[#2E7D5B] border border-[#2E7D5B]/30'
                        : 'bg-[#FCE8E6] hover:bg-[#f8d4d1] text-[#B43C3C] border border-[#B43C3C]/30'
                    }`}
                    title={isEnabled ? 'Click to hide this category from storefront' : 'Click to enable in storefront'}
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded-full inline-block ${
                        isEnabled ? 'bg-[#2E7D5B]' : 'bg-[#B43C3C]'
                      }`}
                    />
                    {isEnabled ? 'Turn OFF' : 'Turn ON'}
                  </button>

                  <div className="flex items-center gap-1.5">
                    {canManage && (
                      <button
                        onClick={() => openEditModal(cat)}
                        className="p-2 text-[#6F6A62] hover:text-[#A67C32] hover:bg-[#FAF3E6] rounded-xl transition-colors"
                        title="Edit Category"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}

                    {canManage && (
                      <button
                        onClick={() => setDeleteConfirmCat(cat)}
                        className="p-2 text-[#6F6A62] hover:text-[#B43C3C] hover:bg-[#FCE8E6] rounded-xl transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredCategories.length === 0 && (
          <div className="bg-white border border-[#E7E1D7] rounded-2xl p-12 text-center space-y-3">
            <Layers className="w-10 h-10 text-[#D8C29D] mx-auto" />
            <h3 className="font-serif font-bold text-lg text-[#1B1A18]">No categories found</h3>
            <p className="text-xs text-[#6F6A62]">
              Try adjusting your search query or filter selection.
            </p>
          </div>
        )}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#D8C29D] rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#E7E1D7] pb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#A67C32]" />
                <h3 className="font-serif font-bold text-xl text-[#1B1A18]">
                  {editingCategory ? 'Edit Category' : 'Create New Category'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-[#6F6A62] hover:text-[#1B1A18] hover:bg-[#FAF8F3] rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#1B1A18] block mb-1">
                    Category Name <span className="text-[#B43C3C]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mangalsutra, Bridal Sets"
                    value={formName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs text-[#1B1A18] focus:outline-none focus:border-[#A67C32]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#1B1A18] block mb-1">URL Slug</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. mangalsutra"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs font-mono text-[#1B1A18] focus:outline-none focus:border-[#A67C32]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#1B1A18] block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Short description highlighting purity, design, or spiritual significance..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl p-3 text-xs text-[#1B1A18] focus:outline-none focus:border-[#A67C32]"
                />
              </div>

              {/* Category Image with local file upload */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1B1A18] block">Category Image</label>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-[#FAF8F3] border border-[#E7E1D7] overflow-hidden shrink-0 flex items-center justify-center">
                    <ImageWithFallback
                      src={formImage || '/categories/Pendants.png'}
                      alt="Category Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#FAF8F3] hover:bg-[#FAF3E6] border border-[#D8C29D] text-[#1B1A18] text-xs font-bold rounded-xl cursor-pointer transition-colors shadow-2xs">
                      <Upload className="w-3.5 h-3.5 text-[#A67C32]" />
                      <span>Upload from device</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFile}
                        className="hidden"
                      />
                    </label>
                    <input
                      type="text"
                      placeholder="Or enter image URL (e.g. /categories/Rings.png)"
                      value={formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl px-3 py-1.5 text-xs text-[#1B1A18] focus:outline-none focus:border-[#A67C32]"
                    />
                  </div>
                </div>
              </div>

              {/* Subcategories tag manager */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1B1A18] block">Subcategories & Tags</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Type subcategory and click Add (e.g. Daily Wear, Heavy Choker)"
                    value={subcatInput}
                    onChange={(e) => setSubcatInput(e.target.value)}
                    onKeyDown={handleAddSubcategory}
                    className="flex-1 bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs text-[#1B1A18] focus:outline-none focus:border-[#A67C32]"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubcategory}
                    className="px-4 py-2 bg-[#FAF3E6] hover:bg-[#F2E8D5] text-[#A67C32] border border-[#D8C29D] rounded-xl text-xs font-bold transition-colors"
                  >
                    Add
                  </button>
                </div>

                {subcategories.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {subcategories.map((sub, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 bg-[#FAF3E6] border border-[#D8C29D] px-2.5 py-1 rounded-lg text-xs font-semibold text-[#1B1A18]"
                      >
                        <Tag className="w-3 h-3 text-[#A67C32]" />
                        {sub}
                        <button
                          type="button"
                          onClick={() => handleRemoveSubcategory(sub)}
                          className="text-[#6F6A62] hover:text-[#B43C3C] ml-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Toggles: Enabled & Featured */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#E7E1D7]">
                <label className="flex items-center gap-2.5 cursor-pointer bg-[#FAF8F3] p-3 rounded-xl border border-[#E7E1D7]">
                  <input
                    type="checkbox"
                    checked={formEnabled}
                    onChange={(e) => setFormEnabled(e.target.checked)}
                    className="w-4 h-4 text-[#A67C32] rounded focus:ring-0"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#1B1A18] block">Visible in Store (ON)</span>
                    <span className="text-[10px] text-[#6F6A62] block">Customers see this in shop filters</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer bg-[#FAF8F3] p-3 rounded-xl border border-[#E7E1D7]">
                  <input
                    type="checkbox"
                    checked={formFeatured}
                    onChange={(e) => setFormFeatured(e.target.checked)}
                    className="w-4 h-4 text-[#A67C32] rounded focus:ring-0"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#1B1A18] block">Featured Category</span>
                    <span className="text-[10px] text-[#6F6A62] block">Highlight in home showcase</span>
                  </div>
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E7E1D7]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#E7E1D7] text-xs font-bold text-[#6F6A62] hover:bg-[#FAF8F3]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#A67C32] hover:bg-[#8e6828] text-white text-xs font-bold uppercase tracking-wider shadow-md"
                >
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmCat && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#B43C3C]/30 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-[#FCE8E6] text-[#B43C3C] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-serif font-bold text-xl text-[#1B1A18]">Delete Category</h3>
              <p className="text-xs text-[#6F6A62]">
                Are you sure you want to delete <strong className="text-[#1B1A18]">"{deleteConfirmCat.name}"</strong>?
              </p>
            </div>

            {(categoryCounts[deleteConfirmCat.id] || 0) > 0 && (
              <div className="p-3 bg-[#FAF3E6] border border-[#D8C29D] rounded-xl text-xs text-[#A67C32]">
                <strong>Warning:</strong> There are currently{' '}
                <strong>{categoryCounts[deleteConfirmCat.id]} products</strong> assigned to this category. Deleting it will leave those products categorized as "{deleteConfirmCat.name}" without an active category filter. Consider turning it <strong>OFF</strong> instead.
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmCat(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#E7E1D7] text-xs font-bold text-[#6F6A62] hover:bg-[#FAF8F3]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl bg-[#B43C3C] hover:bg-[#900] text-white text-xs font-bold transition-all shadow-md"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
export default AdminCategoriesPage;
