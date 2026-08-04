import React, { useState } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { useOrderStore } from '../stores/useOrderStore';
import { formatINR, formatDate } from '../utils/formatters';
import { navigateTo } from '../utils/navigation';
import { ImageWithFallback } from '../components/ui/ImageWithFallback';
import { User, Package, MapPin, Heart, LogOut, ShieldCheck, Clock } from 'lucide-react';

export const CustomerAccountPage: React.FC = () => {
  const { customer, isCustomerLoggedIn, logoutCustomer } = useAuthStore();
  const { orders } = useOrderStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses'>('orders');

  if (!isCustomerLoggedIn || !customer) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-[#1B1A18]">Please Log In</h2>
        <p className="text-xs text-[#6F6A62]">Sign in to access your order history, saved addresses, and profile.</p>
        <button
          onClick={() => navigateTo('/login')}
          className="px-6 py-2.5 bg-[#A67C32] text-white text-xs font-bold uppercase rounded-xl"
        >
          Customer Login
        </button>
      </div>
    );
  }

  const customerOrders = orders.filter((o) => o.customer.email.toLowerCase() === customer.email.toLowerCase());

  return (
    <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Account Profile Header */}
      <div className="bg-white border border-[#E7E1D7] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#FAF3E6] border-2 border-[#A67C32] flex items-center justify-center font-serif text-2xl font-bold text-[#A67C32]">
            {customer.name.charAt(0)}
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#1B1A18]">{customer.name}</h1>
            <p className="text-xs text-[#6F6A62]">{customer.email} | {customer.phone}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold uppercase bg-[#FAF3E6] text-[#A67C32] border border-[#D8C29D] px-2 py-0.5 rounded-full">
                VIP Patron
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            logoutCustomer();
            navigateTo('/');
          }}
          className="px-4 py-2 border border-[#B43C3C] text-[#B43C3C] hover:bg-[#FFF5F5] rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E7E1D7] space-x-8 text-xs font-serif font-bold uppercase tracking-wider">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 flex items-center gap-2 ${
            activeTab === 'orders' ? 'text-[#A67C32] border-b-2 border-[#A67C32]' : 'text-[#6F6A62]'
          }`}
        >
          <Package className="w-4 h-4" /> Order History ({customerOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('addresses')}
          className={`pb-3 flex items-center gap-2 ${
            activeTab === 'addresses' ? 'text-[#A67C32] border-b-2 border-[#A67C32]' : 'text-[#6F6A62]'
          }`}
        >
          <MapPin className="w-4 h-4" /> Saved Addresses
        </button>
      </div>

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {customerOrders.length === 0 ? (
            <div className="bg-white border border-[#E7E1D7] rounded-2xl p-8 text-center text-xs text-[#6F6A62]">
              No past orders found.
            </div>
          ) : (
            customerOrders.map((order) => (
              <div key={order.id} className="bg-white border border-[#E7E1D7] rounded-2xl p-6 space-y-4 shadow-sm">
                <div className="flex flex-wrap justify-between items-center border-b border-[#E7E1D7] pb-3 text-xs">
                  <div>
                    <span className="font-bold text-[#1B1A18] block">Order #{order.orderNumber}</span>
                    <span className="text-[#6F6A62]">Placed on {formatDate(order.placedAt)}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-serif font-bold text-base text-[#A67C32] block">
                      {formatINR(order.totalAmount)}
                    </span>
                    <span className="text-[10px] font-bold text-[#2E7D5B] uppercase bg-[#E6F4EA] border border-[#2E7D5B] px-2 py-0.5 rounded-full">
                      {order.orderStatus}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs">
                      <ImageWithFallback src={item.image} alt={item.productName} className="w-10 h-10 object-cover rounded-lg bg-[#FAF8F3]" />
                      <div className="flex-1">
                        <p className="font-bold text-[#1B1A18] line-clamp-1">{item.productName}</p>
                        <p className="text-[10px] text-[#6F6A62]">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-bold">{formatINR(item.totalPrice)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Addresses Tab */}
      {activeTab === 'addresses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {customer.addresses.map((addr) => (
            <div key={addr.id} className="bg-white border border-[#E7E1D7] rounded-2xl p-5 space-y-2 text-xs">
              <div className="flex justify-between font-bold text-[#1B1A18]">
                <span>{addr.fullName} ({addr.addressType})</span>
                {addr.isDefault && <span className="text-[#A67C32]">DEFAULT</span>}
              </div>
              <p className="text-[#6F6A62]">{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
              <p className="text-[#6F6A62]">Phone: {addr.phone}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
