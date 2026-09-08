import React, { useEffect, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { useOrderStore } from '../../stores/useOrderStore';
import { useProductStore } from '../../stores/useProductStore';
import { formatINR, formatDate } from '../../utils/formatters';
import { useToast } from '../../components/ui/Toast';
import { ImageWithFallback } from '../../components/ui/ImageWithFallback';
import {
  Search,
  Printer,
  Truck,
  CheckCircle2,
  Eye,
  FileText,
  ChevronDown,
  X,
  MapPin,
  User,
  Phone,
  Mail,
  Package,
  Calendar,
  CreditCard,
  ExternalLink,
  Edit3
} from 'lucide-react';
import { Order } from '../../types';

export const AdminOrdersPage: React.FC = () => {
  const { orders, updateOrderStatus, addTrackingInfo, hydrateOrders } = useOrderStore();
  const { products } = useProductStore();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingInput, setTrackingInput] = useState('');
  const [courierInput, setCourierInput] = useState('BlueDart Air Express');
  const [isUpdatingTracking, setIsUpdatingTracking] = useState(false);

  useEffect(() => {
    void hydrateOrders();
  }, [hydrateOrders]);

  useEffect(() => {
    if (selectedOrder) {
      setTrackingInput(selectedOrder.trackingNumber || '');
      setCourierInput(selectedOrder.courierPartner || 'BlueDart Air Express');
    }
  }, [selectedOrder]);

  const filteredOrders = orders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer.phone.includes(searchTerm)
  );

  const handleStatusChange = (orderId: string, newStatus: any) => {
    updateOrderStatus(orderId, newStatus, `Order status updated to ${newStatus} by Admin`);
    showToast('Order Status Updated', `Order #${orderId} marked as ${newStatus}`);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
    }
  };

  const handleSaveTracking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    if (!trackingInput.trim()) {
      showToast('Error', 'Please enter a valid tracking/AWB number.', 'error');
      return;
    }
    addTrackingInfo(selectedOrder.id, trackingInput.trim(), courierInput);
    showToast('Tracking Updated', `AWB ${trackingInput.trim()} assigned via ${courierInput}`);
    setSelectedOrder({
      ...selectedOrder,
      trackingNumber: trackingInput.trim(),
      courierPartner: courierInput,
      orderStatus: 'DISPATCHED'
    });
    setIsUpdatingTracking(false);
  };

  const handlePrintInvoice = () => {
    window.print();
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
                    <td className="p-3 font-semibold">{order.items?.length || 0} pcs</td>
                    <td className="p-3 font-bold text-[#1B1A18]">{formatINR(order.totalAmount)}</td>
                    <td className="p-3 font-mono text-[11px] text-[#6F6A62]">
                      {order.trackingNumber ? (
                        <span className="inline-flex items-center gap-1 text-[#2E7D5B] font-semibold">
                          <Truck className="w-3.5 h-3.5" />
                          {order.trackingNumber}
                        </span>
                      ) : (
                        <span className="text-[#A0702A] italic">Pending AWB</span>
                      )}
                    </td>
                    <td className="p-3">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="bg-[#FAF8F3] border border-[#E7E1D7] rounded-lg px-2.5 py-1 text-[11px] font-bold text-[#2E7D5B] focus:outline-none focus:border-[#A67C32] cursor-pointer"
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
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF0E1] border border-[#D8BE9B] text-[#9A622A] hover:bg-[#A67C32] hover:text-white font-bold text-xs shadow-2xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
                        title="View Full Order & Customer Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Order</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Comprehensive Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FAF8F3] border border-[#E7E1D7] rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6 text-[#1B1A18] relative my-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#E7E1D7] pb-4">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xl font-bold text-[#A67C32]">{selectedOrder.orderNumber}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FAF0E1] text-[#9A622A] border border-[#D8BE9B]">
                    {selectedOrder.orderStatus}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E6F4EA] text-[#2E7D5B] border border-[#2E7D5B]/30">
                    {selectedOrder.paymentStatus} ({selectedOrder.paymentMethod})
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-[#6F6A62] mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#A67C32]" />
                    Placed on {formatDate(selectedOrder.placedAt)}
                  </span>
                  {selectedOrder.gstInvoiceNumber && (
                    <span>&bull; GST Invoice: <strong>{selectedOrder.gstInvoiceNumber}</strong></span>
                  )}
                </div>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-full bg-white border border-[#E7E1D7] hover:bg-[#FAF0E1] text-[#1B1A18] transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2-Column: Customer & Delivery Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Customer Information Card */}
              <div className="bg-white border border-[#E7E1D7] rounded-2xl p-4 space-y-3 shadow-2xs">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9A622A] border-b border-[#F0E6D8] pb-2">
                  <User className="w-4 h-4 text-[#A67C32]" />
                  <span>Customer Information</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="font-bold text-sm text-[#1B1A18]">{selectedOrder.customer?.name}</div>
                  <div className="flex items-center gap-2 text-[#6F6A62]">
                    <Phone className="w-3.5 h-3.5 text-[#A67C32]" />
                    <span>{selectedOrder.customer?.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#6F6A62]">
                    <Mail className="w-3.5 h-3.5 text-[#A67C32]" />
                    <span>{selectedOrder.customer?.email || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address Card */}
              <div className="bg-white border border-[#E7E1D7] rounded-2xl p-4 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between border-b border-[#F0E6D8] pb-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9A622A]">
                    <MapPin className="w-4 h-4 text-[#A67C32]" />
                    <span>Shipping Delivery Address</span>
                  </div>
                  {selectedOrder.shippingAddress?.addressType && (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-[#FAF0E1] text-[#9A622A]">
                      {selectedOrder.shippingAddress.addressType}
                    </span>
                  )}
                </div>
                <div className="text-xs text-[#1B1A18] space-y-1">
                  <div className="font-bold">{selectedOrder.shippingAddress?.fullName || selectedOrder.customer?.name}</div>
                  <div className="text-[#6F6A62] leading-relaxed">
                    {selectedOrder.shippingAddress?.street && <span>{selectedOrder.shippingAddress.street}, </span>}
                    {selectedOrder.shippingAddress?.landmark && <span>Near {selectedOrder.shippingAddress.landmark}, </span>}
                    <br />
                    <span>{selectedOrder.shippingAddress?.city || 'City'}, {selectedOrder.shippingAddress?.state || 'State'} - <strong>{selectedOrder.shippingAddress?.pincode || 'PIN'}</strong></span>
                    <br />
                    <span>{selectedOrder.shippingAddress?.country || 'India'}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Ordered Products Section */}
            <div className="bg-white border border-[#E7E1D7] rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-[#F0E6D8] pb-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9A622A]">
                  <Package className="w-4 h-4 text-[#A67C32]" />
                  <span>Ordered Products ({selectedOrder.items?.length || 0} items)</span>
                </div>
              </div>

              {selectedOrder.items && selectedOrder.items.length > 0 ? (
                <div className="divide-y divide-[#F2E8DC]">
                  {selectedOrder.items.map((item, idx) => {
                    const matchedProduct = products.find((p) => p.id === item.productId);
                    const category = matchedProduct?.category || (item as any).category || 'Silver Jewellery';

                    return (
                      <div key={idx} className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#FAF8F3] border border-[#E7E1D7] shrink-0">
                            <ImageWithFallback
                              src={item.image || matchedProduct?.images?.[0] || '/products/Rings/1/image_1.png'}
                              fallbackSrc="/products/Rings/1/image_1.png"
                              alt={item.productName}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-[#1B1A18] leading-snug">{item.productName}</h4>
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#FAF0E1] text-[#9A622A] border border-[#D8BE9B]">
                                {category}
                              </span>
                            </div>

                            {/* SKU & Attributes */}
                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#6F6A62]">
                              {item.variantSku && <span>SKU: <strong className="font-mono">{item.variantSku}</strong></span>}
                              {item.variantDetails && Object.entries(item.variantDetails).map(([k, v]) => (
                                <span key={k} className="bg-[#FAF8F3] px-2 py-0.5 rounded border border-[#E7E1D7]">
                                  {k}: <strong>{v}</strong>
                                </span>
                              ))}
                            </div>

                            {/* Custom Engraving */}
                            {item.customEngraving && (
                              <div className="text-[11px] text-[#9A622A] font-semibold bg-[#FAF0E1]/80 px-2 py-0.5 rounded border border-[#D8BE9B] inline-block">
                                ✍️ Engraving: &ldquo;{item.customEngraving}&rdquo;
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Quantity and Price */}
                        <div className="text-right sm:shrink-0 pl-16 sm:pl-0">
                          <div className="text-xs text-[#6F6A62]">
                            {item.quantity} pcs &times; {formatINR(item.unitPrice)}
                          </div>
                          <div className="font-bold text-sm text-[#1B1A18]">
                            {formatINR(item.totalPrice || item.quantity * item.unitPrice)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-[#6F6A62]">
                  No items listed for this order.
                </div>
              )}
            </div>

            {/* Courier Dispatch & Tracking Updater */}
            <div className="bg-white border border-[#E7E1D7] rounded-2xl p-4 sm:p-5 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between border-b border-[#F0E6D8] pb-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9A622A]">
                  <Truck className="w-4 h-4 text-[#A67C32]" />
                  <span>BlueDart Insured Courier Tracking</span>
                </div>
                {!isUpdatingTracking && (
                  <button
                    onClick={() => setIsUpdatingTracking(true)}
                    className="text-xs font-bold text-[#A67C32] hover:underline flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{selectedOrder.trackingNumber ? 'Edit AWB' : 'Assign AWB'}</span>
                  </button>
                )}
              </div>

              {isUpdatingTracking ? (
                <form onSubmit={handleSaveTracking} className="flex flex-col sm:flex-row gap-3 items-center">
                  <div className="w-full sm:w-1/3">
                    <select
                      value={courierInput}
                      onChange={(e) => setCourierInput(e.target.value)}
                      className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs font-semibold text-[#1B1A18] focus:outline-none focus:border-[#A67C32]"
                    >
                      <option value="BlueDart Air Express">BlueDart Air Express</option>
                      <option value="DTDC Insured Priority">DTDC Insured Priority</option>
                      <option value="Delhivery Express">Delhivery Express</option>
                      <option value="Speed Post Insured">Speed Post Insured</option>
                    </select>
                  </div>
                  <div className="w-full sm:flex-1">
                    <input
                      type="text"
                      placeholder="Enter Courier AWB / Tracking No. (e.g. BLUEDART-891230491)"
                      value={trackingInput}
                      onChange={(e) => setTrackingInput(e.target.value)}
                      className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs font-mono text-[#1B1A18] focus:outline-none focus:border-[#A67C32]"
                    />
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#A67C32] text-white text-xs font-bold uppercase rounded-xl hover:bg-[#8e6828] transition-colors"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsUpdatingTracking(false)}
                      className="px-3 py-2 bg-gray-100 text-[#6F6A62] text-xs font-bold rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[#6F6A62]">Courier Partner: </span>
                    <strong>{selectedOrder.courierPartner || 'BlueDart Air Express'}</strong>
                  </div>
                  <div>
                    <span className="text-[#6F6A62]">Tracking AWB: </span>
                    {selectedOrder.trackingNumber ? (
                      <span className="font-mono font-bold text-[#2E7D5B] bg-[#E6F4EA] px-2.5 py-1 rounded-md border border-[#2E7D5B]/30">
                        {selectedOrder.trackingNumber}
                      </span>
                    ) : (
                      <span className="text-[#A0702A] italic">Not Assigned Yet</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Financial Summary */}
            <div className="bg-white border border-[#E7E1D7] rounded-2xl p-4 sm:p-5 space-y-2.5 text-xs shadow-2xs">
              <div className="flex justify-between text-[#6F6A62]">
                <span>Items Subtotal</span>
                <span className="font-semibold text-[#1B1A18]">{formatINR(selectedOrder.subtotal || selectedOrder.totalAmount)}</span>
              </div>
              {selectedOrder.discountAmount > 0 && (
                <div className="flex justify-between text-[#2E7D5B]">
                  <span>Discount Applied ({selectedOrder.couponCode || 'Promo'})</span>
                  <span>-{formatINR(selectedOrder.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#6F6A62]">
                <span>GST Tax (3% BIS Hallmarked)</span>
                <span>Included ({formatINR(selectedOrder.gstTotal || Math.round(selectedOrder.totalAmount * 0.03))})</span>
              </div>
              <div className="flex justify-between text-[#6F6A62]">
                <span>Insured Express Shipping</span>
                <span className="text-[#2E7D5B] font-bold">FREE (100% Insured Transit)</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#1B1A18] pt-2 border-t border-[#E7E1D7]">
                <span>Total Paid Amount</span>
                <span className="text-base text-[#A67C32]">{formatINR(selectedOrder.totalAmount)}</span>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-[#E7E1D7]">
              <button
                onClick={handlePrintInvoice}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#E7E1D7] text-[#1B1A18] hover:bg-[#FAF8F3] font-bold text-xs shadow-xs transition-all"
              >
                <Printer className="w-4 h-4 text-[#A67C32]" />
                <span>Print GST Tax Invoice</span>
              </button>

              <button
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2.5 bg-[#1B1A18] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#A67C32] transition-colors"
              >
                Close Window
              </button>
            </div>

          </div>
        </div>
      )}
    </AdminLayout>
  );
};
