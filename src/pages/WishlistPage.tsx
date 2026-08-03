import React from 'react';
import { useWishlistStore } from '../stores/useWishlistStore';
import { useProductStore } from '../stores/useProductStore';
import { ProductCard } from '../components/storefront/ProductCard';
import { navigateTo } from '../utils/navigation';
import { Heart, Trash2 } from 'lucide-react';

export const WishlistPage: React.FC = () => {
  const { wishlistIds, clearWishlist } = useWishlistStore();
  const { products } = useProductStore();

  const wishlistedProducts = products.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between border-b border-[#E7E1D7] pb-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#1B1A18]">Saved Creations</h1>
          <p className="text-xs text-[#6F6A62]">Your personal vault of favorited jewellery pieces.</p>
        </div>

        {wishlistedProducts.length > 0 && (
          <button
            onClick={clearWishlist}
            className="text-xs font-bold text-[#B43C3C] hover:underline flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear All Saved
          </button>
        )}
      </div>

      {wishlistedProducts.length === 0 ? (
        <div className="bg-white border border-[#E7E1D7] rounded-2xl p-12 text-center space-y-4">
          <Heart className="w-12 h-12 text-[#A67C32] mx-auto opacity-50" />
          <h3 className="font-serif font-bold text-xl text-[#1B1A18]">Your Wishlist is Empty</h3>
          <p className="text-xs text-[#6F6A62]">Click the heart icon on any product card to save it for later.</p>
          <button
            onClick={() => navigateTo('/shop')}
            className="px-6 py-2.5 bg-[#A67C32] text-white text-xs font-bold uppercase tracking-wider rounded-xl"
          >
            Browse Catalogue
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlistedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
