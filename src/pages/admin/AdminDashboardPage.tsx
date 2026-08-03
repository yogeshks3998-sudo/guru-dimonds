import React from 'react';
import { AdminLayout } from './AdminLayout';
import { useOrderStore } from '../../stores/useOrderStore';
import { useProductStore } from '../../stores/useProductStore';
import { useMetalRateStore } from '../../stores/useMetalRateStore';
import { formatINR, formatDate } from '../../utils/formatters';
import { navigateTo } from '../../utils/navigation';
import {
  IndianRupee,
  ShoppingBag,
  Package,
  TrendingUp,
  Coins,
  ArrowRight,
  AlertCircle,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export const AdminDashboardPage: React.FC = () => {
  const { orders } = useOrderStore();
  const { products } = useProductStore();
  const { rates } = useMetalRateStore();

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.orderStatus === 'PROCESSING' || o.orderStatus === 'CONFIRMED').length;

  const gold22kRate = rates.find((r) => r.metal === 'GOLD' && r.purity === '22K')?.ratePerGram || 6830;
  const silver925Rate = rates.find((r) => r.metal === 'SILVER' && r.purity === '925')?.ratePerGram || 82;

  // Sales Chart Mock Data
  const chartData = [
    { day: 'Mon', sales: 240000 },
    { day: 'Tue', sales: 380000 },
    { day: 'Wed', sales: 310000 },
    { day: 'Thu', sales: 490000 },
    { day: 'Fri', sales: 580000 },
    { day: 'Sat', sales: 720000 },
    { day: 'Sun', sales: 650000 },
  ];

  return (
    <AdminLayout activeTab="dashboard">
      <div className="space-y-8">
        {/* Top Header & Quick Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E7E1D7] pb-6">
          <div>
            <h1 className="font-serif text-3xl font-bold text-[#1B1A18]">Executive Dashboard</h1>
            <p className="text-xs text-[#6F6A62]">
              Real-time bullion price impact, sales analytics, and order fulfillment controls.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigateTo('/admin/metal-rates')}
              className="px-4 py-2.5 bg-[#FAF3E6] hover:bg-[#FAF0DC] border border-[#D8C29D] text-[#A67C32] text-xs font-bold uppercase rounded-xl flex items-center gap-2 transition-colors"
            >
              <Coins className="w-4 h-4" /> Live Bullion Rates
            </button>

            <button
              onClick={() => navigateTo('/admin/products/new')}
              className="px-4 py-2.5 bg-[#A67C32] hover:bg-[#8e6828] text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-md transition-colors"
            >
              <Plus className="w-4 h-4" /> Add New Creation
            </button>
          </div>
        </div>

        {/* 4 Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-[#E7E1D7] rounded-2xl p-5 space-y-3 shadow-sm">
            <div className="flex justify-between items-center text-[#6F6A62]">
              <span className="text-xs font-bold uppercase tracking-wider">Gross Sales</span>
              <IndianRupee className="w-5 h-5 text-[#A67C32]" />
            </div>
            <div className="text-2xl font-serif font-bold text-[#1B1A18]">{formatINR(totalRevenue)}</div>
            <p className="text-[11px] text-[#2E7D5B] font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +14.2% vs last week
            </p>
          </div>

          <div className="bg-white border border-[#E7E1D7] rounded-2xl p-5 space-y-3 shadow-sm">
            <div className="flex justify-between items-center text-[#6F6A62]">
              <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
              <ShoppingBag className="w-5 h-5 text-[#A67C32]" />
            </div>
            <div className="text-2xl font-serif font-bold text-[#1B1A18]">{totalOrders} Orders</div>
            <p className="text-[11px] text-[#A67C32] font-semibold">{pendingOrders} Pending Dispatch</p>
          </div>

          <div className="bg-white border border-[#E7E1D7] rounded-2xl p-5 space-y-3 shadow-sm">
            <div className="flex justify-between items-center text-[#6F6A62]">
              <span className="text-xs font-bold uppercase tracking-wider">Active 22K Rate</span>
              <Coins className="w-5 h-5 text-[#A67C32]" />
            </div>
            <div className="text-2xl font-serif font-bold text-[#1B1A18]">{formatINR(gold22kRate)}/g</div>
            <p className="text-[11px] text-[#6F6A62]">Silver 925: {formatINR(silver925Rate)}/g</p>
          </div>

          <div className="bg-white border border-[#E7E1D7] rounded-2xl p-5 space-y-3 shadow-sm">
            <div className="flex justify-between items-center text-[#6F6A62]">
              <span className="text-xs font-bold uppercase tracking-wider">Catalog Vault</span>
              <Package className="w-5 h-5 text-[#A67C32]" />
            </div>
            <div className="text-2xl font-serif font-bold text-[#1B1A18]">{products.length} Products</div>
            <p className="text-[11px] text-[#2E7D5B] font-semibold">100% Rate-Formula Linked</p>
          </div>
        </div>

        {/* Sales Chart & Live Bullion Impact */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white border border-[#E7E1D7] rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-serif font-bold text-base text-[#1B1A18]">Weekly Revenue Analytics</h3>
                <p className="text-xs text-[#6F6A62]">Sales performance across all jewellery categories</p>
              </div>
              <span className="text-xs text-[#A67C32] font-bold">This Week</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#A67C32" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#A67C32" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#6F6A62" fontSize={11} />
                  <YAxis stroke="#6F6A62" fontSize={11} tickFormatter={(val) => `₹${val / 1000}k`} />
                  <Tooltip formatter={(val: any) => formatINR(Number(val))} />
                  <Area type="monotone" dataKey="sales" stroke="#A67C32" strokeWidth={2} fill="url(#goldGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Live Bullion Status Panel */}
          <div className="bg-[#FAF3E6] border border-[#D8C29D] rounded-2xl p-6 space-y-4 flex flex-col justify-between shadow-sm">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#A67C32] flex items-center gap-1">
                <Coins className="w-4 h-4" /> Formula Price Auto-Sync
              </span>
              <h3 className="font-serif font-bold text-xl text-[#1B1A18]">Live MCX Spot Index</h3>
              <p className="text-xs text-[#6F6A62] leading-relaxed">
                When you update rates in the rate manager, all formula-priced products update instantly across the entire storefront.
              </p>
            </div>

            <div className="space-y-3 bg-white p-4 rounded-xl border border-[#D8C29D]">
              <div className="flex justify-between text-xs">
                <span className="text-[#6F6A62]">24K Pure Gold (999)</span>
                <span className="font-bold text-[#1B1A18]">
                  {formatINR(rates.find((r) => r.metal === 'GOLD' && r.purity === '24K')?.ratePerGram || 7450)}/g
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#6F6A62]">22K Standard Gold (916)</span>
                <span className="font-bold text-[#A67C32]">{formatINR(gold22kRate)}/g</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#6F6A62]">925 Sterling Silver</span>
                <span className="font-bold text-[#1B1A18]">{formatINR(silver925Rate)}/g</span>
              </div>
            </div>

            <button
              onClick={() => navigateTo('/admin/metal-rates')}
              className="w-full py-3 bg-[#A67C32] hover:bg-[#8e6828] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-md"
            >
              Manage Metal Rates
            </button>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white border border-[#E7E1D7] rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex justify-between items-center pb-3 border-b border-[#E7E1D7]">
            <h3 className="font-serif font-bold text-lg text-[#1B1A18]">Recent Customer Orders</h3>
            <button
              onClick={() => navigateTo('/admin/orders')}
              className="text-xs font-bold text-[#A67C32] hover:underline flex items-center gap-1"
            >
              View All Orders <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#1B1A18]">
              <thead className="bg-[#FAF8F3] text-[#6F6A62] font-bold uppercase tracking-wider border-b border-[#E7E1D7]">
                <tr>
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Client Name</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3">Fulfillment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E1D7]">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-[#FAF8F3] transition-colors">
                    <td className="p-3 font-mono font-bold text-[#A67C32]">{order.orderNumber}</td>
                    <td className="p-3 font-semibold">{order.customer.name}</td>
                    <td className="p-3 text-[#6F6A62]">{formatDate(order.placedAt)}</td>
                    <td className="p-3 font-bold">{formatINR(order.totalAmount)}</td>
                    <td className="p-3 uppercase text-[10px] font-bold">{order.paymentMethod}</td>
                    <td className="p-3">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#E6F4EA] text-[#2E7D5B] border border-[#2E7D5B]">
                        {order.orderStatus}
                      </span>
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
