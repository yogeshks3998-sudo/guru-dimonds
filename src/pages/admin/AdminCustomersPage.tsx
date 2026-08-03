import React, { useEffect, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { INITIAL_CUSTOMERS } from '../../data/mockData';
import { customerApi } from '../../services/customerApi';
import { Customer } from '../../types';
import { formatINR } from '../../utils/formatters';
import { Users, Mail, Phone, MapPin, Award } from 'lucide-react';

export const AdminCustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);

  useEffect(() => {
    let mounted = true;
    void customerApi
      .listCustomers()
      .then((apiCustomers) => {
        if (mounted) setCustomers(apiCustomers);
      })
      .catch(() => {
        if (mounted) setCustomers(INITIAL_CUSTOMERS);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <AdminLayout activeTab="customers">
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-[#E7E1D7] pb-6">
          <h1 className="font-serif text-3xl font-bold text-[#1B1A18]">VIP Patrons & Client Directory</h1>
          <p className="text-xs text-[#6F6A62]">
            Directory of registered fine jewellery patrons, total lifetime valuation, and delivery addresses.
          </p>
        </div>

        {/* Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {customers.map((cust) => (
            <div key={cust.id} className="bg-white border border-[#E7E1D7] rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#E7E1D7] pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#FAF3E6] border border-[#A67C32] flex items-center justify-center font-serif font-bold text-lg text-[#A67C32]">
                    {cust.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-base text-[#1B1A18]">{cust.name}</h4>
                    <span className="text-[10px] font-bold uppercase bg-[#FAF3E6] text-[#A67C32] border border-[#D8C29D] px-2 py-0.5 rounded-full">
                      {cust.tags[0] || 'VIP Patron'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-[#6F6A62] block">Total Lifetime Spent</span>
                  <span className="font-serif font-bold text-base text-[#A67C32]">
                    {formatINR(cust.totalSpent)}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-[#6F6A62]">
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#A67C32]" /> {cust.email}
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#A67C32]" /> {cust.phone}
                </p>
                {cust.addresses[0] && (
                  <p className="flex items-start gap-2 pt-1 border-t border-[#E7E1D7]/60">
                    <MapPin className="w-3.5 h-3.5 text-[#A67C32] shrink-0 mt-0.5" />
                    <span>
                      {cust.addresses[0].street}, {cust.addresses[0].city}, {cust.addresses[0].state} - {cust.addresses[0].pincode}
                    </span>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};
