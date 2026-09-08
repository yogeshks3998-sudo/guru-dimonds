import React, { useState } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useInquiryStore } from '../../stores/useInquiryStore';
import { navigateTo } from '../../utils/navigation';
import { roleCan } from '../../utils/permissions';
import { AdminRole } from '../../types';
import {
  LayoutDashboard,
  Coins,
  Package,
  ShoppingBag,
  Users,
  FileText,
  MessageSquare,
  LogOut,
  ChevronRight,
  Flame,
  Globe,
  Menu,
  X,
  UserCheck,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
}

const ROLE_LABELS: Record<AdminRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  OWNER: 'Store Owner',
  PRODUCT_MANAGER: 'Product Manager',
  INVENTORY_MANAGER: 'Inventory Manager',
  ORDER_MANAGER: 'Order Manager',
  CONTENT_MANAGER: 'Content Manager',
  FINANCE: 'Finance Head',
  STAFF: 'Store Staff',
};

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, activeTab }) => {
  const { adminUser, isAdminLoggedIn, logoutAdmin } = useAuthStore();
  const { inquiries } = useInquiryStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const newInquiriesCount = inquiries.filter((i) => i.status === 'NEW').length;

  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-[#1B1A18] text-[#FAF8F3] flex items-center justify-center p-4">
        <div className="bg-[#23211E] border border-[#A67C32]/40 rounded-3xl p-8 max-w-md w-full space-y-6 text-center shadow-2xl">
          <div className="w-12 h-12 bg-[#A67C32]/20 border border-[#A67C32] rounded-2xl flex items-center justify-center mx-auto text-[#D8C29D]">
            <Flame className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-white">Guru Diamonds Admin Portal</h2>
          <p className="text-xs text-[#A7A9AC]">Access restricted to authorized jewellery store managers and staff.</p>
          <button
            onClick={() => navigateTo('/adminlogin')}
            className="w-full py-3 bg-[#A67C32] hover:bg-[#8e6828] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md"
          >
            Admin Sign In
          </button>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard, path: '/admin', roles: ['STAFF', 'PRODUCT_MANAGER', 'ORDER_MANAGER', 'CONTENT_MANAGER', 'FINANCE'] },
    { id: 'rates', label: 'Live Metal Rates', icon: Coins, path: '/admin/metal-rates', roles: ['FINANCE'] },
    { id: 'products', label: 'Jewellery Products', icon: Package, path: '/admin/products', roles: ['PRODUCT_MANAGER'] },
    { id: 'orders', label: 'Customer Orders', icon: ShoppingBag, path: '/admin/orders', roles: ['ORDER_MANAGER', 'FINANCE'] },
    { id: 'customers', label: 'Patrons & Clients', icon: Users, path: '/admin/customers', roles: ['ORDER_MANAGER'] },
    {
      id: 'inquiries',
      label: 'Contact Inquiries',
      icon: MessageSquare,
      path: '/admin/inquiries',
      roles: ['STAFF', 'PRODUCT_MANAGER', 'ORDER_MANAGER', 'CONTENT_MANAGER', 'FINANCE'],
      badge: newInquiriesCount > 0 ? newInquiriesCount : undefined,
    },
    { id: 'cms', label: 'CMS & Banners', icon: FileText, path: '/admin/cms', roles: ['CONTENT_MANAGER'] },
  ].filter((item) => roleCan(adminUser?.role, ...(item.roles as any)));

  const handleLogout = () => {
    logoutAdmin();
    navigateTo('/adminlogin');
  };

  const userRole = adminUser?.role || 'STAFF';
  const roleLabel = ROLE_LABELS[userRole] || userRole;

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#1B1A18] flex flex-col md:flex-row antialiased">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex w-64 bg-[#1B1A18] text-[#FAF8F3] flex-col justify-between p-5 shrink-0 border-r border-[#2D2A26] sticky top-0 h-screen overflow-y-auto">
        <div className="space-y-6">
          {/* Header Branding */}
          <div className="flex items-center gap-3 border-b border-[#2D2A26] pb-5">
            <img
              src="/logo.png"
              alt="Guru Diamonds"
              className="h-10 w-auto max-w-[140px] object-contain rounded-lg bg-white/95 p-1 shrink-0"
            />
            <div className="min-w-0">
              <span className="font-logo text-xs font-bold text-white block tracking-wider truncate">GURU DIAMONDS</span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#A67C32]">
                CMS Portal
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#A7A9AC]/70 px-3 mb-2">
              Main Menu
            </div>
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const isActive = activeTab === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigateTo(item.path)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#A67C32] text-white font-bold shadow-md'
                        : 'text-[#A7A9AC] hover:bg-[#23211E] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#A67C32]'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.badge !== undefined && (
                        <span className="bg-[#D4AF37] text-[#2D080C] text-[10px] font-extrabold px-1.5 py-0.2 rounded-full shadow-2xs">
                          {item.badge}
                        </span>
                      )}
                      {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom Sidebar User & Storefront Link */}
        <div className="space-y-4 pt-4 border-t border-[#2D2A26]">
          <button
            onClick={() => navigateTo('/')}
            className="w-full py-2.5 px-3 bg-[#23211E] hover:bg-[#2D2A26] border border-[#3D3A36] rounded-xl text-xs font-semibold text-[#D8C29D] flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            <Globe className="w-4 h-4 text-[#A67C32]" />
            <span>View Live Storefront</span>
          </button>

          {/* User Profile Card */}
          <div className="p-3.5 bg-[#23211E] border border-[#3D3A36] rounded-2xl space-y-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#A67C32] text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
                {adminUser?.name?.charAt(0) || 'A'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-xs text-white truncate">{adminUser?.name || 'Administrator'}</p>
                <span className="inline-block px-2 py-0.5 rounded bg-[#A67C32]/20 border border-[#A67C32]/40 text-[9px] font-bold uppercase tracking-wider text-[#D8C29D] mt-0.5">
                  {roleLabel}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#33181A] hover:bg-[#4A1D20] text-red-300 hover:text-red-200 rounded-xl text-xs font-bold transition-colors border border-red-900/40"
            >
              <LogOut className="w-3.5 h-3.5 text-red-400" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-[#E7E1D7] px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-[#1B1A18] hover:bg-[#FAF8F3] rounded-xl border border-[#E7E1D7]"
              aria-label="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold uppercase tracking-widest text-[#A67C32]">Admin</span>
              <span className="text-[#6F6A62]">/</span>
              <span className="font-bold text-[#1B1A18] capitalize">{activeTab.replace('-', ' ')}</span>
            </div>
          </div>

          {/* User Profile Bar Right */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2.5 bg-[#FAF8F3] border border-[#E7E1D7] px-3.5 py-1.5 rounded-full">
              <UserCheck className="w-4 h-4 text-[#A67C32]" />
              <span className="text-xs font-bold text-[#1B1A18]">{adminUser?.name || 'Admin'}</span>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#2D080C] text-[#FFF9F0]">
                {roleLabel}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2D080C] text-[#FFF9F0] hover:bg-[#3D0B10] text-xs font-bold transition-colors shadow-xs"
              title="Sign Out of Admin Portal"
            >
              <LogOut className="w-3.5 h-3.5 text-[#B8893D]" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8 overflow-x-hidden space-y-6">{children}</main>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm flex md:hidden">
          <div className="w-[82vw] max-w-xs bg-[#1B1A18] text-[#FAF8F3] h-full shadow-2xl flex flex-col justify-between p-5 border-r border-[#2D2A26]">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#2D2A26] pb-4">
                <div>
                  <span className="font-logo text-sm font-bold text-white block">GURU DIAMONDS</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#A67C32]">Admin</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-[#A7A9AC]">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const isActive = activeTab === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        navigateTo(item.path);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-medium ${
                        isActive ? 'bg-[#A67C32] text-white font-bold' : 'text-[#A7A9AC] hover:bg-[#23211E]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-[#A67C32]" />
                        <span>{item.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {item.badge !== undefined && (
                          <span className="bg-[#D4AF37] text-[#2D080C] text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                            {item.badge}
                          </span>
                        )}
                        {isActive && <ChevronRight className="w-3.5 h-3.5" />}
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="space-y-4 pt-4 border-t border-[#2D2A26]">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigateTo('/');
                }}
                className="w-full py-2.5 bg-[#23211E] text-xs font-semibold text-[#D8C29D] flex items-center justify-center gap-2 rounded-xl"
              >
                <Globe className="w-4 h-4 text-[#A67C32]" /> View Live Storefront
              </button>

              <div className="p-3 bg-[#23211E] border border-[#3D3A36] rounded-xl space-y-2">
                <p className="font-bold text-xs text-white">{adminUser?.name}</p>
                <span className="inline-block text-[10px] text-[#D8C29D] bg-[#A67C32]/20 px-2 py-0.5 rounded border border-[#A67C32]/40 font-bold uppercase">
                  {roleLabel}
                </span>
                <button
                  onClick={handleLogout}
                  className="w-full py-2 bg-[#33181A] hover:bg-[#4A1D20] text-red-300 rounded-lg text-xs font-bold flex items-center justify-center gap-2 mt-2"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-400" /> Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;
