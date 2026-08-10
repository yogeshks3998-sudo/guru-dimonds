import React, { useState } from 'react';
import { navigateTo } from '../../utils/navigation';
import { useCartStore } from '../../stores/useCartStore';
import { useWishlistStore } from '../../stores/useWishlistStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { useCMSStore } from '../../stores/useCMSStore';
import { useProductStore } from '../../stores/useProductStore';
import { GlobalSearchOverlay } from './GlobalSearchOverlay';
import { InlineSearchInput } from './InlineSearchInput';
import { MegaMenu } from './MegaMenu';
import guruDiamondsLogo from '../../../assets/gurudimondslogo.png';
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  ChevronDown,
  PhoneCall,
  LogOut,
} from 'lucide-react';

interface StorefrontHeaderProps {
  onOpenCartDrawer: () => void;
}

export const StorefrontHeader: React.FC<StorefrontHeaderProps> = ({ onOpenCartDrawer }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);

  const { items } = useCartStore();
  const { wishlistIds } = useWishlistStore();
  const { customer, isCustomerLoggedIn, logoutCustomer, adminUser, isAdminLoggedIn, logoutAdmin } = useAuthStore();
  const { cms } = useCMSStore();
  const { setSelectedCategory, setSelectedGender, setSelectedCollection } = useProductStore();

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlistIds.length;
  const accountLabel =
    isCustomerLoggedIn && customer
      ? customer.name.split(' ')[0]
      : isAdminLoggedIn && adminUser
        ? adminUser.name.split(' ')[0]
        : 'Login';

  const navCategories = [
    { name: 'New Arrivals', action: () => navigateTo('/shop') },
    {
      name: 'Rings',
      action: () => {
        setSelectedCategory('Rings');
        navigateTo('/shop');
      },
    },
    {
      name: 'Earrings',
      action: () => {
        setSelectedCategory('Earrings');
        navigateTo('/shop');
      },
    },
    {
      name: 'Neck Jewellery',
      action: () => {
        setSelectedCategory('Neck Jewellery');
        navigateTo('/shop');
      },
    },
    {
      name: 'Pendants',
      action: () => {
        setSelectedCategory('Pendants');
        navigateTo('/shop');
      },
    },
    {
      name: 'Bracelets & Bangles',
      action: () => {
        setSelectedCategory('Bracelets & Bangles');
        navigateTo('/shop');
      },
    },
    {
      name: 'Gemstones',
      hasMega: 'Gemstones',
      action: () => {
        setSelectedCategory('Gemstones');
        navigateTo('/shop');
      },
    },
    {
      name: 'Spiritual Maalas',
      action: () => {
        setSelectedCategory('Spiritual Maalas');
        navigateTo('/shop');
      },
    },
    {
      name: 'Rudraksha',
      action: () => {
        setSelectedCategory('Rudraksha (1 to 24 Mukhi)');
        navigateTo('/shop');
      },
    },
    {
      name: 'God Small Statues',
      action: () => {
        setSelectedCategory('God Small Statues');
        navigateTo('/shop');
      },
    },
  ];

  return (
    <>
    <header className="sticky top-0 z-40 w-full max-w-full overflow-x-clip bg-[#FFF9F0]/95 backdrop-blur-md border-b border-[#E9D9C5] transition-all shadow-xs">
      {/* Main Navigation Header */}
      <div className="relative w-full max-w-[1536px] mx-auto px-2.5 min-[390px]:px-3 sm:px-6 lg:px-8 py-3 sm:py-3.5 flex items-center justify-between gap-1.5 min-[390px]:gap-2 sm:gap-4">
        {/* Left: Mobile menu toggle */}
        <div className="flex shrink-0 items-center gap-1 lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-1 min-[360px]:p-1.5 min-[390px]:p-2 text-[#281C18] hover:text-[#7A1822] hover:bg-[#E9D9C5]/50 rounded-xl transition-colors"
            aria-label="Open Mobile Navigation"
          >
            <Menu className="w-5 h-5 min-[390px]:w-6 min-[390px]:h-6" />
          </button>
          <button
            onClick={() => setSearchOverlayOpen(true)}
            className="p-1 min-[360px]:p-1.5 min-[390px]:p-2 text-[#281C18] hover:text-[#7A1822] hover:bg-[#E9D9C5]/50 rounded-xl transition-colors"
            aria-label="Open Search"
          >
            <Search className="w-4.5 h-4.5 min-[390px]:w-5 min-[390px]:h-5" />
          </button>
        </div>

        {/* Center/Left: Brand Logo */}
        <div className="flex min-w-0 flex-1 items-center justify-center gap-8 lg:flex-none lg:justify-start">
          <button onClick={() => navigateTo('/')} className="group flex items-center" aria-label="Guru Diamonds home">
            <img
              src={guruDiamondsLogo}
              alt="Guru Diamonds"
              className="h-10 w-auto max-w-[104px] object-contain transition-transform group-hover:scale-[1.02] min-[360px]:h-11 min-[360px]:max-w-[118px] min-[390px]:h-[53px] min-[390px]:max-w-[150px] sm:h-[62px] sm:max-w-[286px]"
            />
          </button>

          {/* Desktop Direct Search Input & Dropdown */}
          <div className="hidden lg:flex items-center absolute left-1/2 top-1/2 w-[min(460px,32vw)] -translate-x-1/2 -translate-y-1/2 z-30">
            <InlineSearchInput />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex shrink-0 items-center justify-end gap-0.5 min-[390px]:gap-1 sm:gap-5">
          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-1.5 p-1 min-[360px]:p-1.5 min-[390px]:p-2 text-[#281C18] hover:text-[#7A1822] transition-colors"
            >
              <User className="w-4.5 h-4.5 min-[390px]:w-5 min-[390px]:h-5 text-[#7A1822]" />
              <span className="hidden md:inline text-xs font-semibold">
                {accountLabel}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#796A65] hidden md:inline" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-[#FFFFFF] border border-[#E9D9C5] rounded-2xl shadow-xl py-2 z-50 text-xs divide-y divide-[#E9D9C5]">
                {isCustomerLoggedIn ? (
                  <>
                    <div className="px-4 py-2 bg-[#FFF9F0]">
                      <p className="font-bold text-[#281C18]">{customer?.name}</p>
                      <p className="text-[10px] text-[#796A65]">{customer?.email}</p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          navigateTo('/account');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-[#281C18] hover:bg-[#F4E4C8] hover:text-[#7A1822] transition-colors"
                      >
                        Patron Portal & Orders
                      </button>
                      <button
                        onClick={() => {
                          navigateTo('/wishlist');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-[#281C18] hover:bg-[#F4E4C8] hover:text-[#7A1822] transition-colors"
                      >
                        Saved Creations ({wishlistCount})
                      </button>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          logoutCustomer();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-[#7A1822] font-semibold hover:bg-[#F3DDD7] transition-colors flex items-center gap-1.5"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                      </button>
                    </div>
                  </>
                ) : isAdminLoggedIn ? (
                  <>
                    <div className="px-4 py-2 bg-[#FFF9F0]">
                      <p className="font-bold text-[#281C18]">{adminUser?.name}</p>
                      <p className="text-[10px] text-[#796A65]">{adminUser?.email}</p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          navigateTo('/admin');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-[#281C18] hover:bg-[#F4E4C8] hover:text-[#7A1822] transition-colors"
                      >
                        Admin Dashboard
                      </button>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          logoutAdmin();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-[#7A1822] font-semibold hover:bg-[#F3DDD7] transition-colors flex items-center gap-1.5"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="py-1">
                    <button
                      onClick={() => {
                        navigateTo('/login');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-[#281C18] font-bold hover:bg-[#F4E4C8] hover:text-[#7A1822] transition-colors"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => {
                        navigateTo('/admin/login');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-[#796A65] hover:bg-[#FFF9F0] hover:text-[#281C18] transition-colors"
                    >
                      Admin / Manager Portal
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Wishlist Link */}
          <button
            onClick={() => navigateTo('/wishlist')}
            className="relative hidden min-[340px]:inline-flex p-1 min-[360px]:p-1.5 min-[390px]:p-2 text-[#281C18] hover:text-[#7A1822] transition-colors"
            aria-label="Wishlist"
          >
            <Heart className="w-4.5 h-4.5 min-[390px]:w-5 min-[390px]:h-5 text-[#7A1822]" />
            {wishlistCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#7A1822] text-[#FFF9F0] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-[#FFF9F0]">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart Drawer Button */}
          <button
            onClick={onOpenCartDrawer}
            className="flex items-center gap-1 min-[390px]:gap-1.5 sm:gap-2 bg-[#7A1822] hover:bg-[#4D1017] text-[#FFF9F0] px-2 min-[390px]:px-3 sm:px-4 py-2 rounded-full transition-all shadow-md group"
          >
            <ShoppingBag className="w-4 h-4 text-[#B8893D] group-hover:scale-110 transition-transform" />
            <span className="hidden min-[390px]:inline text-xs font-bold tracking-wider uppercase">Bag</span>
            <span className="bg-[#B8893D] text-[#281C18] text-[10px] font-extrabold px-1.5 py-0.5 rounded-full min-[390px]:ml-1">
              {cartCount}
            </span>
          </button>
        </div>
      </div>

      {/* Category Navigation Bar */}
      <div
        className="hidden lg:block border-t border-[#E9D9C5] bg-[#FFF9F0] relative"
        onMouseLeave={() => setActiveMegaMenu(null)}
      >
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex items-center justify-between text-xs font-medium text-[#281C18] py-2.5">
            {navCategories.map((cat, idx) => (
              <li key={idx}>
                <button
                  onClick={cat.action}
                  onMouseEnter={() => {
                    if (cat.hasMega) setActiveMegaMenu(cat.hasMega);
                    else setActiveMegaMenu(null);
                  }}
                  className="hover:text-[#7A1822] transition-colors uppercase tracking-widest text-[11px] font-semibold hover:border-b-2 hover:border-[#7A1822] pb-1"
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Mega Menu Dropdown */}
        <MegaMenu activeMenu={activeMegaMenu} onClose={() => setActiveMegaMenu(null)} />
      </div>

    </header>

      {/* Global Search Overlay */}
      <GlobalSearchOverlay isOpen={searchOverlayOpen} onClose={() => setSearchOverlayOpen(false)} />

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex lg:hidden">
          <div className="w-[86vw] max-w-sm bg-[#FFF9F0] h-dvh shadow-2xl flex flex-col p-5 overflow-y-auto border-r border-[#E9D9C5]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E9D9C5]">
              <img src={guruDiamondsLogo} alt="Guru Diamonds" className="h-12 w-auto max-w-[220px] object-contain" />
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-[#796A65]">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="py-4 space-y-3 font-medium text-sm text-[#281C18]">
              {navCategories.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    item.action();
                  }}
                  className="block w-full text-left py-2 border-b border-[#E9D9C5]/50 hover:text-[#7A1822] uppercase tracking-wider text-xs font-semibold"
                >
                  {item.name}
                </button>
              ))}

              {isAdminLoggedIn && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigateTo('/admin');
                  }}
                  className="w-full mt-4 text-left p-3 bg-[#F4E4C8] border border-[#B8893D]/40 text-[#7A1822] rounded-xl font-bold text-xs uppercase tracking-wider"
                >
                  Admin Dashboard
                </button>
              )}
            </div>

            <div className="mt-auto pt-6 border-t border-[#E9D9C5] text-xs text-[#796A65] space-y-2">
              <p className="flex items-center gap-2 font-medium">
                <PhoneCall className="w-4 h-4 text-[#B8893D]" /> Customer Assistance: +91 78991 25449
              </p>
              <p>100% genuine products | Premium certified gemstones</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
