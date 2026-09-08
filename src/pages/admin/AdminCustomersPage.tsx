import React, { useEffect, useMemo, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { INITIAL_CUSTOMERS } from '../../data/mockData';
import { customerApi } from '../../services/customerApi';
import { Customer } from '../../types';
import { formatINR } from '../../utils/formatters';
import {
  Users,
  Mail,
  Phone,
  MapPin,
  Search,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  ExternalLink,
  Shield,
  Clock,
  Sparkles,
  LayoutGrid,
  ListFilter,
  RefreshCw,
} from 'lucide-react';

export const AdminCustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [activeCustomerModal, setActiveCustomerModal] = useState<Customer | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const apiCustomers = await customerApi.listCustomers({
        search: searchQuery,
        status: selectedStatus,
      });
      setCustomers(apiCustomers && apiCustomers.length > 0 ? apiCustomers : INITIAL_CUSTOMERS);
    } catch {
      setCustomers(INITIAL_CUSTOMERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchCustomers();
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedStatus]);

  const filteredCustomers = useMemo(() => {
    return customers.filter((cust) => {
      const matchesSearch =
        !searchQuery ||
        cust.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cust.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cust.phone.includes(searchQuery);

      const matchesStatus =
        selectedStatus === 'ALL' ||
        (selectedStatus === 'VIP' ? cust.tags?.some((t) => t.toLowerCase().includes('vip')) : cust.status === selectedStatus);

      return matchesSearch && matchesStatus;
    });
  }, [customers, searchQuery, selectedStatus]);

  // Analytics Metrics
  const totalCustomersCount = customers.length;
  const activeCount = customers.filter((c) => c.status === 'ACTIVE').length;
  const totalLifetimeRevenue = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
  const avgLifetimeSpend = totalCustomersCount > 0 ? totalLifetimeRevenue / totalCustomersCount : 0;

  const handleToggleStatus = async (cust: Customer) => {
    const nextStatus = cust.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const updated = await customerApi.updateCustomerStatus(cust.id, nextStatus);
      setCustomers((prev) => prev.map((c) => (c.id === cust.id ? updated : c)));
      if (activeCustomerModal?.id === cust.id) {
        setActiveCustomerModal(updated);
      }
    } catch {
      // Optimistic update fallback for demo
      setCustomers((prev) =>
        prev.map((c) => (c.id === cust.id ? { ...c, status: nextStatus } : c))
      );
    }
  };

  return (
    <AdminLayout activeTab="customers">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E7E1D7] pb-6">
          <div>
            <h1 className="font-serif text-3xl font-bold text-[#1B1A18] flex items-center gap-3">
              <Users className="w-8 h-8 text-[#A67C32]" />
              VIP Patrons & Client Directory
            </h1>
            <p className="text-xs text-[#6F6A62] mt-1">
              Complete customer database, lifetime purchase valuation, delivery locations & verification status.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchCustomers}
            disabled={loading}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 bg-white border border-[#E7E1D7] rounded-xl text-xs font-bold text-[#1B1A18] hover:bg-[#FAF8F3] transition-colors shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#A67C32] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Database</span>
          </button>
        </div>

        {/* KPI Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-[#E7E1D7] rounded-2xl p-4 shadow-sm">
            <span className="text-xs text-[#6F6A62] block">Total Registered</span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-serif text-2xl font-bold text-[#1B1A18]">{totalCustomersCount}</span>
              <div className="w-8 h-8 rounded-full bg-[#FAF3E6] flex items-center justify-center">
                <Users className="w-4 h-4 text-[#A67C32]" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E7E1D7] rounded-2xl p-4 shadow-sm">
            <span className="text-xs text-[#6F6A62] block">Active Patrons</span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-serif text-2xl font-bold text-[#2E7D32]">{activeCount}</span>
              <div className="w-8 h-8 rounded-full bg-[#E8F5E9] flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E7E1D7] rounded-2xl p-4 shadow-sm">
            <span className="text-xs text-[#6F6A62] block">Patron Lifetime Spend</span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-serif text-2xl font-bold text-[#A67C32]">{formatINR(totalLifetimeRevenue)}</span>
              <div className="w-8 h-8 rounded-full bg-[#FAF3E6] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#A67C32]" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E7E1D7] rounded-2xl p-4 shadow-sm">
            <span className="text-xs text-[#6F6A62] block">Avg Lifetime Value</span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-serif text-2xl font-bold text-[#1B1A18]">{formatINR(avgLifetimeSpend)}</span>
              <div className="w-8 h-8 rounded-full bg-[#FAF3E6] flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-[#A67C32]" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Search Controls */}
        <div className="bg-white border border-[#E7E1D7] rounded-2xl p-4 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-[#A67C32] absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by client name, email, or mobile..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#1B1A18] focus:outline-none focus:border-[#A67C32] focus:bg-white transition-all"
              />
            </div>

            {/* Status Filter Tabs & Layout Toggle */}
            <div className="flex items-center justify-between w-full md:w-auto gap-3">
              <div className="flex bg-[#FAF8F3] border border-[#E7E1D7] p-1 rounded-xl text-xs">
                {['ALL', 'ACTIVE', 'VIP', 'INACTIVE'].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setSelectedStatus(tab)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      selectedStatus === tab
                        ? 'bg-[#2D080C] text-[#FFF9F0] shadow-sm'
                        : 'text-[#6F6A62] hover:text-[#1B1A18]'
                    }`}
                  >
                    {tab === 'VIP' ? 'VIP Only' : tab.charAt(0) + tab.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>

              <div className="flex bg-[#FAF8F3] border border-[#E7E1D7] p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg transition-all ${
                    viewMode === 'table' ? 'bg-white shadow text-[#A67C32]' : 'text-[#6F6A62]'
                  }`}
                  title="Table View"
                >
                  <ListFilter className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-all ${
                    viewMode === 'grid' ? 'bg-white shadow text-[#A67C32]' : 'text-[#6F6A62]'
                  }`}
                  title="Card View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Customers Listing */}
        {filteredCustomers.length === 0 ? (
          <div className="bg-white border border-[#E7E1D7] rounded-2xl p-12 text-center space-y-3">
            <Users className="w-12 h-12 text-[#A67C32]/40 mx-auto" />
            <h3 className="font-serif text-lg font-bold text-[#1B1A18]">No Customers Found</h3>
            <p className="text-xs text-[#6F6A62]">
              {searchQuery ? `No matching patrons for "${searchQuery}"` : 'No customers match the current filter.'}
            </p>
          </div>
        ) : viewMode === 'table' ? (
          /* Table View */
          <div className="bg-white border border-[#E7E1D7] rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F3] border-b border-[#E7E1D7] text-[#6F6A62] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">Client / Patron</th>
                    <th className="py-3.5 px-4">Contact Details</th>
                    <th className="py-3.5 px-4">Orders & Spend</th>
                    <th className="py-3.5 px-4">Location</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E1D7]/70">
                  {filteredCustomers.map((cust) => (
                    <tr key={cust.id} className="hover:bg-[#FAF8F3]/50 transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#FAF3E6] border border-[#A67C32]/50 flex items-center justify-center font-serif font-bold text-sm text-[#A67C32]">
                            {cust.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-[#1B1A18] block">{cust.name}</span>
                            <span className="text-[10px] text-[#8C827A]">
                              Joined {new Date(cust.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4 space-y-0.5">
                        <a href={`mailto:${cust.email}`} className="text-[#1B1A18] hover:text-[#A67C32] flex items-center gap-1.5 font-medium">
                          <Mail className="w-3 h-3 text-[#A67C32]" />
                          {cust.email}
                        </a>
                        <a href={`tel:${cust.phone}`} className="text-[#6F6A62] hover:text-[#1B1A18] flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-[#A67C32]" />
                          {cust.phone}
                        </a>
                      </td>

                      {/* Orders & Spend */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-[#A67C32] font-serif text-sm block">
                          {formatINR(cust.totalSpent || 0)}
                        </span>
                        <span className="text-[10px] text-[#6F6A62]">{cust.totalOrders || 0} Orders placed</span>
                      </td>

                      {/* Address */}
                      <td className="py-3.5 px-4 max-w-[200px] truncate text-[#6F6A62]">
                        {cust.addresses && cust.addresses[0] ? (
                          <span title={`${cust.addresses[0].city}, ${cust.addresses[0].state}`}>
                            {cust.addresses[0].city}, {cust.addresses[0].state}
                          </span>
                        ) : (
                          <span className="text-[#8C827A] italic">No saved address</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(cust)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all ${
                            cust.status === 'ACTIVE'
                              ? 'bg-[#E8F5E9] text-[#2E7D32] border-[#A5D6A7] hover:bg-[#C8E6C9]'
                              : 'bg-[#FFEBEE] text-[#C62828] border-[#EF9A9A] hover:bg-[#FFCDD2]'
                          }`}
                        >
                          {cust.status === 'ACTIVE' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" /> Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" /> Inactive
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setActiveCustomerModal(cust)}
                          className="px-3 py-1.5 bg-[#FAF8F3] hover:bg-[#2D080C] text-[#1B1A18] hover:text-[#FFF9F0] border border-[#E7E1D7] rounded-xl font-bold text-xs transition-colors"
                        >
                          View Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Grid Card View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCustomers.map((cust) => (
              <div key={cust.id} className="bg-white border border-[#E7E1D7] rounded-2xl p-5 space-y-4 shadow-sm hover:border-[#A67C32]/50 transition-colors">
                <div className="flex items-center justify-between border-b border-[#E7E1D7] pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-[#FAF3E6] border border-[#A67C32] flex items-center justify-center font-serif font-bold text-base text-[#A67C32]">
                      {cust.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-sm text-[#1B1A18]">{cust.name}</h4>
                      <span className="text-[10px] font-bold uppercase bg-[#FAF3E6] text-[#A67C32] border border-[#D8C29D] px-2 py-0.5 rounded-full">
                        {cust.tags[0] || 'VIP Patron'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-[#6F6A62] block">Total Spent</span>
                    <span className="font-serif font-bold text-sm text-[#A67C32]">
                      {formatINR(cust.totalSpent || 0)}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-[#6F6A62]">
                  <p className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-[#A67C32] shrink-0" /> {cust.email}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#A67C32] shrink-0" /> {cust.phone}
                  </p>
                  {cust.addresses && cust.addresses[0] && (
                    <p className="flex items-start gap-2 pt-1 border-t border-[#E7E1D7]/60 text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-[#A67C32] shrink-0 mt-0.5" />
                      <span className="truncate">
                        {cust.addresses[0].city}, {cust.addresses[0].state} - {cust.addresses[0].pincode}
                      </span>
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#E7E1D7] text-xs">
                  <span className="text-[10px] text-[#8C827A]">{cust.totalOrders || 0} Orders placed</span>
                  <button
                    type="button"
                    onClick={() => setActiveCustomerModal(cust)}
                    className="font-bold text-[#A67C32] hover:underline text-xs"
                  >
                    View Details &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Customer Detailed Profile Modal */}
        {activeCustomerModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-[#E7E1D7] rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-[#E7E1D7] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#FAF3E6] border border-[#A67C32] flex items-center justify-center font-serif font-bold text-lg text-[#A67C32]">
                    {activeCustomerModal.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-[#1B1A18]">{activeCustomerModal.name}</h3>
                    <p className="text-xs text-[#6F6A62]">Client ID: {activeCustomerModal.id}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveCustomerModal(null)}
                  className="text-[#6F6A62] hover:text-[#1B1A18] font-bold text-lg p-2"
                >
                  &times;
                </button>
              </div>

              {/* Account Quick Metrics */}
              <div className="grid grid-cols-3 gap-3 bg-[#FAF8F3] border border-[#E7E1D7] p-3 rounded-2xl text-center">
                <div>
                  <span className="text-[10px] text-[#6F6A62] block">Total Orders</span>
                  <span className="font-bold text-base text-[#1B1A18]">{activeCustomerModal.totalOrders || 0}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#6F6A62] block">Total Spent</span>
                  <span className="font-serif font-bold text-base text-[#A67C32]">{formatINR(activeCustomerModal.totalSpent || 0)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#6F6A62] block">Status</span>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mt-0.5 ${
                    activeCustomerModal.status === 'ACTIVE' ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#FFEBEE] text-[#C62828]'
                  }`}>
                    {activeCustomerModal.status}
                  </span>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-[#1B1A18] uppercase tracking-wider text-[11px] border-b border-[#E7E1D7] pb-1">
                  Contact Information
                </h4>
                <p className="flex items-center justify-between text-[#6F6A62]">
                  <span>Email:</span>
                  <strong className="text-[#1B1A18]">{activeCustomerModal.email}</strong>
                </p>
                <p className="flex items-center justify-between text-[#6F6A62]">
                  <span>Phone:</span>
                  <strong className="text-[#1B1A18]">{activeCustomerModal.phone}</strong>
                </p>
                <p className="flex items-center justify-between text-[#6F6A62]">
                  <span>Member Since:</span>
                  <strong className="text-[#1B1A18]">{new Date(activeCustomerModal.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                </p>
              </div>

              {/* Saved Addresses */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-[#1B1A18] uppercase tracking-wider text-[11px] border-b border-[#E7E1D7] pb-1">
                  Delivery Addresses ({activeCustomerModal.addresses?.length || 0})
                </h4>
                {activeCustomerModal.addresses && activeCustomerModal.addresses.length > 0 ? (
                  activeCustomerModal.addresses.map((addr) => (
                    <div key={addr.id} className="bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl p-3 text-[#6F6A62] space-y-1">
                      <p className="font-bold text-[#1B1A18]">{addr.fullName} &bull; {addr.phone}</p>
                      <p>{addr.street}{addr.landmark ? `, ${addr.landmark}` : ''}</p>
                      <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-[#8C827A] italic">No saved delivery address yet.</p>
                )}
              </div>

              {/* Toggle Status Action */}
              <div className="pt-4 border-t border-[#E7E1D7] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleToggleStatus(activeCustomerModal)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                    activeCustomerModal.status === 'ACTIVE'
                      ? 'bg-[#FFEBEE] text-[#C62828] hover:bg-[#FFCDD2]'
                      : 'bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#C8E6C9]'
                  }`}
                >
                  {activeCustomerModal.status === 'ACTIVE' ? 'Deactivate Customer' : 'Activate Customer'}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveCustomerModal(null)}
                  className="px-5 py-2 bg-[#2D080C] text-[#FFF9F0] font-bold text-xs rounded-xl hover:bg-[#3D0B10]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCustomersPage;
