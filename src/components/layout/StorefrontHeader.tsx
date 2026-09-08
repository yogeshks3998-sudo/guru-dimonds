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
  Sparkles,
  MapPin,
  ShieldCheck,
  ChevronRight,
  Gem,
  Package,
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
  const { setSelectedCategory, resetFilters, setSortBy } = useProductStore();

  const navCategories = [
    {
      name: 'Home',
      action: () => {
        navigateTo('/');
      },
    },
    {
      name: 'About Us',
      action: () => {
        navigateTo('/about');
      },
    },
    {
      name: 'Shop',
      action: () => {
        resetFilters();
        navigateTo('/shop');
      },
    },
    {
      name: 'New Arrivals',
      isNew: true,
      action: () => {
        resetFilters();
        setSortBy('NEWEST');
        navigateTo('/shop');
      },
    },
    {
      name: 'Rings',
      action: () => {
        resetFilters();
        setSelectedCategory('Rings');
        navigateTo('/shop');
      },
    },
    {
      name: 'Earrings',
      action: () => {
        resetFilters();
        setSelectedCategory('Earrings');
        navigateTo('/shop');
      },
    },
    {
      name: 'Neck Jewellery',
      action: () => {
        resetFilters();
        setSelectedCategory('Neck Jewellery');
        navigateTo('/shop');
      },
    },
    {
      name: 'Pendants',
      action: () => {
        resetFilters();
        setSelectedCategory('Pendants');
        navigateTo('/shop');
      },
    },
    {
      name: 'Bracelets & Bangles',
      action: () => {
        resetFilters();
        setSelectedCategory('Bracelets & Bangles');
        navigateTo('/shop');
      },
    },
    {
      name: 'Gemstones',
      action: () => {
        resetFilters();
        setSelectedCategory('Gemstones');
        navigateTo('/shop');
      },
    },
    {
      name: 'Spiritual Maalas',
      action: () => {
        resetFilters();
        setSelectedCategory('Spiritual Maalas');
        navigateTo('/shop');
      },
    },
    {
      name: 'Rudraksha',
      action: () => {
        resetFilters();
        setSelectedCategory('Rudraksha (1 to 24 Mukhi)');
        navigateTo('/shop');
      },
    },
    {
      name: 'God Small Statues',
      action: () => {
        resetFilters();
        setSelectedCategory('God Small Statues');
        navigateTo('/shop');
      },
    },
    {
      name: 'Contact Us',
      action: () => {
        navigateTo('/contact');
      },
    },
  ];

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlistIds.length;
  const accountLabel =
    isCustomerLoggedIn && customer
      ? customer.name.split(' ')[0]
      : isAdminLoggedIn && adminUser
        ? adminUser.name.split(' ')[0]
        : 'Sign In';

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-[#2D080C] text-[#FFF9F0] text-[10px] sm:text-[11px] py-1.5 px-3 border-b border-[#B8893D]/30 relative z-50">
        <div className="max-w-[1536px] mx-auto flex items-center justify-between">
          <div className="hidden md:flex items-center gap-2 text-[#D4AF37]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% BIS Hallmarked & Certified Diamonds</span>
          </div>

          <div className="w-full md:w-auto text-center font-medium tracking-wide">
            {cms?.announcementBar?.enabled && cms?.announcementBar?.text ? (
              <span>{cms.announcementBar.text}</span>
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#D4AF37]" /> Free Insured Express Delivery Across India
              </span>
            )}
          </div>

          <div className="hidden lg:flex items-center gap-4 text-[#F7E7CE]">
            <a
              href="https://wa.me/917899125449"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#D4AF37] transition-colors flex items-center gap-1"
            >
              <PhoneCall className="w-3 h-3 text-[#D4AF37]" />
              <span>Assistance: +91 78991 25449</span>
            </a>
            <button onClick={() => navigateTo('/about')} className="hover:text-[#D4AF37] transition-colors">
              About Us
            </button>
            <button onClick={() => navigateTo('/track-order')} className="hover:text-[#D4AF37] transition-colors">
              Track Order
            </button>
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-40 w-full bg-[#FFF9F0]/95 backdrop-blur-md border-b border-[#E9D9C5] shadow-xs">
        <div className="max-w-[1536px] mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            
            {/* 1. Mobile Menu & Search Trigger (Mobile only) */}
            <div className="flex items-center gap-1 lg:hidden shrink-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="w-9 h-9 flex items-center justify-center text-[#1B1A18] hover:text-[#7A1822] hover:bg-[#E9D9C5]/40 rounded-xl transition-colors active:scale-95"
                aria-label="Open Mobile Navigation"
              >
                <Menu className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setSearchOverlayOpen(true)}
                className="w-9 h-9 flex items-center justify-center text-[#1B1A18] hover:text-[#7A1822] hover:bg-[#E9D9C5]/40 rounded-xl transition-colors active:scale-95"
                aria-label="Search Catalog"
              >
                <Search className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* 2. Brand Logo (Mobile Centered / Desktop Left) */}
            <div className="flex items-center justify-center lg:justify-start shrink-0 min-w-0">
              <button
                type="button"
                onClick={() => navigateTo('/')}
                className="group flex items-center focus:outline-none"
                aria-label="Guru Diamonds Home"
              >
                <img
                  src={guruDiamondsLogo}
                  alt="Guru Diamonds"
                  className="h-11 min-[360px]:h-12 sm:h-16 lg:h-[4.25rem] w-auto max-w-[170px] min-[360px]:max-w-[195px] sm:max-w-[300px] object-contain transition-transform group-hover:scale-[1.02]"
                />
              </button>
            </div>

            {/* 3. Desktop Search Input (Desktop only) */}
            <div className="hidden lg:flex flex-1 max-w-md mx-6">
              <InlineSearchInput />
            </div>

            {/* 4. Right Actions Bar */}
            <div className="flex items-center justify-end gap-1 sm:gap-3 shrink-0">
              {/* Contact Us (Desktop) */}
              <button
                type="button"
                onClick={() => navigateTo('/contact')}
                className="hidden xl:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#1B1A18] hover:text-[#7A1822] hover:bg-[#E9D9C5]/40 rounded-xl transition-colors"
                title="Boutique Support"
              >
                <PhoneCall className="w-4 h-4 text-[#A67C32]" />
                <span>Contact</span>
              </button>

              {/* User Account Button & Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    if (isCustomerLoggedIn || isAdminLoggedIn) {
                      setUserDropdownOpen(!userDropdownOpen);
                    } else {
                      navigateTo('/login');
                    }
                  }}
                  className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-2 text-[#1B1A18] hover:text-[#7A1822] hover:bg-[#E9D9C5]/40 rounded-xl transition-colors text-xs font-semibold"
                  aria-label="Account Menu"
                >
                  <User className="w-4.5 h-4.5 text-[#7A1822]" />
                  <span className="hidden md:inline">{accountLabel}</span>
                  {(isCustomerLoggedIn || isAdminLoggedIn) && (
                    <ChevronDown className="w-3.5 h-3.5 text-[#796A65] hidden md:inline" />
                  )}
                </button>

                {/* Account Dropdown Menu */}
                {userDropdownOpen && (isCustomerLoggedIn || isAdminLoggedIn) && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E9D9C5] rounded-2xl shadow-xl py-2 z-50 text-xs divide-y divide-[#E9D9C5] animate-fadeIn">
                    {isCustomerLoggedIn ? (
                      <>
                        <div className="px-4 py-2.5 bg-[#FFF9F0]">
                          <p className="font-bold text-[#1B1A18] truncate">{customer?.name}</p>
                          <p className="text-[10px] text-[#796A65] truncate">{customer?.email}</p>
                        </div>
                        <div className="py-1">
                          <button
                            type="button"
                            onClick={() => {
                              navigateTo('/account');
                              setUserDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-[#1B1A18] hover:bg-[#FAF3E6] hover:text-[#7A1822] transition-colors font-medium flex items-center justify-between"
                          >
                            <span>Patron Account & Orders</span>
                            <ChevronRight className="w-3 h-3 text-[#A67C32]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              navigateTo('/wishlist');
                              setUserDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-[#1B1A18] hover:bg-[#FAF3E6] hover:text-[#7A1822] transition-colors font-medium flex items-center justify-between"
                          >
                            <span>Saved Wishlist</span>
                            <span className="text-[10px] font-bold text-[#A67C32] bg-[#FAF3E6] px-1.5 py-0.5 rounded-full">
                              {wishlistCount}
                            </span>
                          </button>
                        </div>
                        <div className="py-1">
                          <button
                            type="button"
                            onClick={() => {
                              logoutCustomer();
                              setUserDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-[#C62828] font-semibold hover:bg-[#FFEBEE] transition-colors flex items-center gap-1.5"
                          >
                            <LogOut className="w-3.5 h-3.5" /> Sign Out
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="px-4 py-2.5 bg-[#FFF9F0]">
                          <p className="font-bold text-[#1B1A18] truncate">{adminUser?.name}</p>
                          <p className="text-[10px] text-[#796A65] truncate">{adminUser?.email}</p>
                        </div>
                        <div className="py-1">
                          <button
                            type="button"
                            onClick={() => {
                              navigateTo('/admin');
                              setUserDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-[#1B1A18] hover:bg-[#FAF3E6] hover:text-[#7A1822] transition-colors font-medium flex items-center justify-between"
                          >
                            <span>Admin Portal</span>
                            <ChevronRight className="w-3 h-3 text-[#A67C32]" />
                          </button>
                        </div>
                        <div className="py-1">
                          <button
                            type="button"
                            onClick={() => {
                              logoutAdmin();
                              setUserDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-[#C62828] font-semibold hover:bg-[#FFEBEE] transition-colors flex items-center gap-1.5"
                          >
                            <LogOut className="w-3.5 h-3.5" /> Sign Out
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={() => navigateTo('/wishlist')}
                className="relative p-1.5 sm:p-2 text-[#1B1A18] hover:text-[#7A1822] hover:bg-[#E9D9C5]/40 rounded-xl transition-colors"
                aria-label="Wishlist"
                title="View Saved Wishlist"
              >
                <Heart className="w-4.5 h-4.5 text-[#7A1822]" />
                {wishlistCount > 0 && (
                  <span className="absolute 0 top-0.5 right-0.5 bg-[#7A1822] text-[#FFF9F0] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-[#FFF9F0]">
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* Shopping Bag Button */}
              <button
                type="button"
                onClick={onOpenCartDrawer}
                className="flex items-center gap-1.5 bg-[#7A1822] hover:bg-[#4D1017] text-[#FFF9F0] px-2.5 sm:px-4 py-2 rounded-full transition-all shadow-sm active:scale-95 group"
                aria-label="Shopping Bag"
              >
                <ShoppingBag className="w-4 h-4 text-[#D4AF37] group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider">Bag</span>
                <span className="bg-[#D4AF37] text-[#2D080C] text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                  {cartCount}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Category Navigation Bar */}
        <div
          className="hidden lg:block border-t border-[#E9D9C5] bg-[#FFF9F0] relative"
          onMouseLeave={() => setActiveMegaMenu(null)}
        >
          <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
            <ul className="flex items-center justify-between text-xs font-medium text-[#1B1A18] py-2.5 overflow-x-auto no-scrollbar gap-2 sm:gap-2.5 xl:gap-3 2xl:gap-4 whitespace-nowrap">
              {navCategories.map((cat, idx) => (
                <li key={idx}>
                  <button
                    type="button"
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

          {/* Desktop Mega Menu Dropdown */}
          <MegaMenu activeMenu={activeMegaMenu} onClose={() => setActiveMegaMenu(null)} />
        </div>
      </header>

      {/* Global Search Overlay */}
      <GlobalSearchOverlay isOpen={searchOverlayOpen} onClose={() => setSearchOverlayOpen(false)} />

      {/* Full Ultra-Responsive Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex lg:hidden">
          <div className="w-[88vw] max-w-xs bg-[#FFF9F0] h-dvh shadow-2xl flex flex-col overflow-y-auto border-r border-[#E9D9C5] animate-slideInLeft">
            
            {/* Drawer Top Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#E9D9C5] bg-white sticky top-0 z-10">
              <img src={guruDiamondsLogo} alt="Guru Diamonds" className="h-12 w-auto max-w-[210px] object-contain" />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-[#FAF8F3] border border-[#E9D9C5] flex items-center justify-center text-[#1B1A18] hover:bg-[#E9D9C5]"
                aria-label="Close Navigation"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Quick Search Button in Drawer */}
            <div className="p-4 border-b border-[#E9D9C5]">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSearchOverlayOpen(true);
                }}
                className="w-full flex items-center gap-2.5 bg-white border border-[#E9D9C5] rounded-xl px-3 py-2.5 text-xs text-[#796A65] hover:border-[#A67C32] transition-colors"
              >
                <Search className="w-4 h-4 text-[#A67C32]" />
                <span>Search diamonds, rings, maalas...</span>
              </button>
            </div>

            {/* Navigation Category List */}
            <div className="p-4 space-y-1 divide-y divide-[#E9D9C5]/40 text-xs font-semibold text-[#1B1A18]">
              {navCategories.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    item.action();
                  }}
                  className="w-full flex items-center justify-between py-3 hover:text-[#7A1822] uppercase tracking-wider text-[11px] transition-colors"
                >
                  <span>{item.name}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#A67C32]" />
                </button>
              ))}
            </div>

            {/* Quick Account Links in Drawer */}
            <div className="p-4 border-t border-[#E9D9C5] space-y-2 bg-white/50 text-xs">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigateTo(isCustomerLoggedIn ? '/account' : '/login');
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8F3] border border-[#E9D9C5] font-semibold text-[#1B1A18]"
              >
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#7A1822]" />
                  {isCustomerLoggedIn ? 'My Patron Account' : 'Sign In / Register'}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-[#796A65]" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigateTo('/track-order');
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8F3] border border-[#E9D9C5] font-semibold text-[#1B1A18]"
              >
                <span className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#A67C32]" />
                  Track Live Shipment
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-[#796A65]" />
              </button>

              {isAdminLoggedIn && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigateTo('/admin');
                  }}
                  className="w-full p-2.5 rounded-xl bg-[#2D080C] text-[#FFF9F0] font-bold text-center block uppercase tracking-wider"
                >
                  Admin Portal
                </button>
              )}
            </div>

            {/* Bottom VIP Assistance */}
            <div className="mt-auto p-4 border-t border-[#E9D9C5] bg-white text-xs space-y-3">
              <a
                href="https://wa.me/917899125449"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#25D366] text-white rounded-xl font-bold shadow-sm"
              >
                <span>WhatsApp Diamond Expert</span>
              </a>

              <a
                href="tel:+917899125449"
                className="flex items-center justify-center gap-2 w-full py-2 bg-[#FAF8F3] border border-[#E9D9C5] text-[#1B1A18] rounded-xl font-semibold"
              >
                <PhoneCall className="w-3.5 h-3.5 text-[#7A1822]" />
                <span>Call +91 78991 25449</span>
              </a>

              <p className="text-[10px] text-center text-[#796A65]">
                100% Certified Diamonds &bull; BIS Hallmarked
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StorefrontHeader;
