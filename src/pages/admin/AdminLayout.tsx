import React, { useState } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { navigateTo } from '../../utils/navigation';
import { roleCan } from '../../utils/permissions';
import {
  LayoutDashboard,
  Coins,
  Package,
  ShoppingBag,
  Users,
  FileText,
  Settings,
  LogOut,
  ChevronRight,
  Flame,
  Globe,
  Bell,
  Menu,
  X,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, activeTab }) => {
  const { adminUser, isAdminLoggedIn, logoutAdmin } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-[#1B1A18] text-[#FAF8F3] flex items-center justify-center p-4">
        <div className="bg-[#23211E] border border-[#A67C32]/40 rounded-3xl p-8 max-w-md w-full space-y-6 text-center shadow-2xl">
          <div className="w-12 h-12 bg-[#A67C32]/20 border border-[#A67C32] rounded-2xl flex items-center justify-center mx-auto text-[#D8C29D]">
            <Flame className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-white">Guru Diamonds Admin Portal</h2>
          <p className="text-xs text-[#A7A9AC]">Access restricted to authorized jewellery store managers and goldsmith admins.</p>
          <button
            onClick={() => navigateTo('/admin/login')}
            className="w-full py-3 bg-[#A67C32] hover:bg-[#8e6828] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all"
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
    { id: 'cms', label: 'CMS & Banners', icon: FileText, path: '/admin/cms', roles: ['CONTENT_MANAGER'] },
  ].filter((item) => roleCan(adminUser?.role, ...(item.roles as any)));

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#1B1A18] flex flex-col md:flex-row">
      {/* Mobile Top Nav */}
      <div className="md:hidden bg-[#1B1A18] text-white p-4 flex items-center justify-between border-b border-[#2D2A26]">
        <div className="flex items-center gap-2">
          <span className="font-logo font-bold text-[#D8C29D]">GURU DIAMONDS ADMIN</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-[#D8C29D]">
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Admin Sidebar */}
      <aside
        className={`${
          mobileMenuOpen ? 'block' : 'hidden md:flex'
        } w-full md:w-64 bg-[#1B1A18] text-[#FAF8F3] flex-col justify-between p-6 shrink-0 border-r border-[#2D2A26] min-h-screen`}
      >
        <div className="space-y-8">
          {/* Logo */}
          <div className="space-y-1">
            <span className="font-logo text-xl font-bold text-white block">GURU DIAMONDS</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#A67C32] block">
              Goldsmith CMS v2.4
            </span>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    navigateTo(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#A67C32] text-white shadow-md'
                      : 'text-[#A7A9AC] hover:bg-[#23211E] hover:text-white'
                  }`}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Admin User Info & Storefront Link */}
        <div className="space-y-4 pt-6 border-t border-[#2D2A26]">
          <button
            onClick={() => navigateTo('/')}
            className="w-full py-2.5 bg-[#23211E] hover:bg-[#2D2A26] border border-[#3D3A36] rounded-xl text-xs font-bold text-[#D8C29D] flex items-center justify-center gap-2 transition-colors"
          >
            <Globe className="w-4 h-4" /> View Live Storefront
          </button>

          <div className="flex items-center justify-between text-xs pt-2">
            <div>
              <p className="font-bold text-white">{adminUser?.name}</p>
              <p className="text-[10px] text-[#A7A9AC] uppercase">{adminUser?.role}</p>
            </div>
            <button
              onClick={() => {
                logoutAdmin();
                navigateTo('/admin/login');
              }}
              className="p-2 text-[#A7A9AC] hover:text-[#B43C3C] transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 p-4 sm:p-8 overflow-x-hidden space-y-6">{children}</main>
    </div>
  );
};
