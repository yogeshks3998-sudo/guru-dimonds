import React, { useEffect, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { useOrderStore } from '../../stores/useOrderStore';
import { formatINR, formatDate } from '../../utils/formatters';
import { useToast } from '../../components/ui/Toast';
import { Search, Printer, Truck, CheckCircle2, Eye, FileText, ChevronDown } from 'lucide-react';

export const AdminOrdersPage: React.FC = () => {
  const { orders, updateOrderStatus, addTrackingInfo, hydrateOrders } = useOrderStore();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  useEffect(() => {
    void hydrateOrders();
  }, [hydrateOrders]);

  const filteredOrders = orders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer.phone.includes(searchTerm)
  );

  const handleStatusChange = (orderId: string, newStatus: any) => {
    updateOrderStatus(orderId, newStatus, `Order status updated to ${newStatus} by Admin`);
    showToast('Order Status Updated', `Order #${orderId} marked as ${newStatus}`);
  };

  return (
    <AdminLayout activeTab="orders">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E7E1D7] pb-6">
          <div>
            <h1 className="font-serif text-3xl font-bold text-[#1B1A18]">Customer Order Fulfillment</h1>
            <p className="text-xs text-[#6F6A62]">
              Track BlueDart insured courier dispatch, print GST tax invoices, and update delivery timelines.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white border border-[#E7E1D7] rounded-2xl p-4 flex justify-between items-center shadow-sm">
          <div className="relative w-80">
            <Search className="w-4 h-4 text-[#6F6A62] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Order ID or Patron Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl pl-9 pr-3 py-2 text-xs text-[#1B1A18] focus:outline-none focus:border-[#A67C32]"
            />
          </div>

          <span className="text-xs text-[#6F6A62]">
            Total Orders: <strong>{filteredOrders.length}</strong>
          </span>
        </div>

        {/* Orders Table */}
        <div className="bg-white border border-[#E7E1D7] rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#1B1A18]">
              <thead className="bg-[#FAF8F3] text-[#6F6A62] font-bold uppercase tracking-wider border-b border-[#E7E1D7]">
                <tr>
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Client</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Items</th>
                  <th className="p-3">Total Paid</th>
                  <th className="p-3">Courier AWB</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E1D7]">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#FAF8F3] transition-colors">
                    <td className="p-3 font-mono font-bold text-[#A67C32]">{order.orderNumber}</td>
                    <td className="p-3">
                      <div className="font-bold">{order.customer.name}</div>
                      <div className="text-[10px] text-[#6F6A62]">{order.customer.phone}</div>
                    </td>
                    <td className="p-3 text-[#6F6A62]">{formatDate(order.placedAt)}</td>
                    <td className="p-3 font-semibold">{order.items.length} pcs</td>
                    <td className="p-3 font-bold text-[#1B1A18]">{formatINR(order.totalAmount)}</td>
                    <td className="p-3 font-mono text-[11px] text-[#6F6A62]">
                      {order.trackingNumber || 'Pending AWB'}
                    </td>
                    <td className="p-3">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="bg-[#FAF8F3] border border-[#E7E1D7] rounded-lg px-2 py-1 text-[11px] font-bold text-[#2E7D5B] focus:outline-none focus:border-[#A67C32]"
                      >
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="DISPATCHED">DISPATCHED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-1.5 text-[#6F6A62] hover:text-[#A67C32]"
                        title="View Order Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
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
