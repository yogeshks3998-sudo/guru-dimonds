import React, { useEffect, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { useInquiryStore, ContactInquiry } from '../../stores/useInquiryStore';
import { formatDate } from '../../utils/formatters';
import { useToast } from '../../components/ui/Toast';
import {
  Search,
  MessageSquare,
  Mail,
  Phone,
  Clock,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Filter,
  Eye,
  X,
  Send,
  Sparkles,
  Archive,
  User,
  Tag
} from 'lucide-react';

export const AdminInquiriesPage: React.FC = () => {
  const { inquiries, hydrateInquiries, updateInquiryStatus, deleteInquiry } = useInquiryStore();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'NEW' | 'RESPONDED' | 'ARCHIVED'>('ALL');
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');

  useEffect(() => {
    hydrateInquiries();
  }, [hydrateInquiries]);

  useEffect(() => {
    if (selectedInquiry) {
      setAdminNoteInput(selectedInquiry.adminNotes || '');
    }
  }, [selectedInquiry]);

  const filteredInquiries = inquiries.filter((inq) => {
    const matchesSearch =
      inq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.contactNumber.includes(searchTerm) ||
      inq.gmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.requirement.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || inq.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const newCount = inquiries.filter((i) => i.status === 'NEW').length;
  const respondedCount = inquiries.filter((i) => i.status === 'RESPONDED').length;

  const handleStatusChange = (id: string, status: ContactInquiry['status']) => {
    updateInquiryStatus(id, status);
    showToast('Inquiry Updated', `Marked as ${status}`);
    if (selectedInquiry && selectedInquiry.id === id) {
      setSelectedInquiry({ ...selectedInquiry, status });
    }
  };

  const handleSaveNotes = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiry) return;
    updateInquiryStatus(selectedInquiry.id, selectedInquiry.status, adminNoteInput.trim());
    showToast('Notes Saved', 'Admin notes updated successfully');
    setSelectedInquiry({ ...selectedInquiry, adminNotes: adminNoteInput.trim() });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this contact inquiry?')) {
      deleteInquiry(id);
      showToast('Deleted', 'Inquiry removed from system');
      if (selectedInquiry?.id === id) {
        setSelectedInquiry(null);
      }
    }
  };

  return (
    <AdminLayout activeTab="inquiries">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E7E1D7] pb-6">
          <div>
            <h1 className="font-serif text-3xl font-bold text-[#1B1A18] flex items-center gap-3">
              <span>Customer Inquiries & Messages</span>
              {newCount > 0 && (
                <span className="bg-[#A67C32] text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {newCount} New
                </span>
              )}
            </h1>
            <p className="text-xs text-[#6F6A62]">
              Review and manage inquiries, custom bespoke commissions, and product questions submitted via the Contact Us page.
            </p>
          </div>
        </div>

        {/* Quick Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-[#E7E1D7] rounded-2xl p-4 flex items-center justify-between shadow-2xs">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#6F6A62]">Total Submissions</div>
              <div className="text-2xl font-serif font-bold text-[#1B1A18] mt-0.5">{inquiries.length}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#FAF8F3] border border-[#E7E1D7] flex items-center justify-center text-[#A67C32]">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-[#E7E1D7] rounded-2xl p-4 flex items-center justify-between shadow-2xs">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#9A622A]">New / Unanswered</div>
              <div className="text-2xl font-serif font-bold text-[#9A622A] mt-0.5">{newCount}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#FAF0E1] border border-[#D8BE9B] flex items-center justify-center text-[#9A622A]">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-[#E7E1D7] rounded-2xl p-4 flex items-center justify-between shadow-2xs">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#2E7D5B]">Responded / Closed</div>
              <div className="text-2xl font-serif font-bold text-[#2E7D5B] mt-0.5">{respondedCount}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#E6F4EA] border border-[#2E7D5B]/30 flex items-center justify-center text-[#2E7D5B]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Controls: Search & Status Tabs */}
        <div className="bg-white border border-[#E7E1D7] rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#6F6A62] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Patron, Phone, Gmail or Keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#FAF8F3] border border-[#E7E1D7] rounded-xl pl-9 pr-3 py-2 text-xs text-[#1B1A18] focus:outline-none focus:border-[#A67C32]"
            />
          </div>

          {/* Filter Status Tabs */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            {(['ALL', 'NEW', 'RESPONDED', 'ARCHIVED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  statusFilter === status
                    ? 'bg-[#A67C32] text-white shadow-xs'
                    : 'bg-[#FAF8F3] text-[#6F6A62] hover:bg-[#FAF0E1] hover:text-[#9A622A]'
                }`}
              >
                {status === 'ALL' ? 'All Inquiries' : status}
              </button>
            ))}
          </div>
        </div>

        {/* Inquiries Table */}
        <div className="bg-white border border-[#E7E1D7] rounded-2xl p-6 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#1B1A18]">
              <thead className="bg-[#FAF8F3] text-[#6F6A62] font-bold uppercase tracking-wider border-b border-[#E7E1D7]">
                <tr>
                  <th className="p-3">Patron Name</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Requirement</th>
                  <th className="p-3">Date Submitted</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E1D7]">
                {filteredInquiries.length > 0 ? (
                  filteredInquiries.map((inq) => {
                    const cleanPhone = inq.contactNumber.replace(/[^0-9]/g, '');

                    return (
                      <tr key={inq.id} className="hover:bg-[#FAF8F3] transition-colors">
                        <td className="p-3">
                          <div className="font-bold text-sm text-[#1B1A18]">{inq.name}</div>
                          <div className="text-[10px] font-mono text-[#A67C32]">{inq.id}</div>
                        </td>

                        <td className="p-3 space-y-0.5">
                          <div className="flex items-center gap-1 text-[#1B1A18]">
                            <Phone className="w-3 h-3 text-[#A67C32]" />
                            <span>{inq.contactNumber}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[#6F6A62] text-[11px]">
                            <Mail className="w-3 h-3 text-[#A67C32]" />
                            <span className="truncate max-w-[180px]">{inq.gmail}</span>
                          </div>
                        </td>

                        <td className="p-3">
                          <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FAF0E1] text-[#9A622A] border border-[#D8BE9B]">
                            {inq.requirement}
                          </span>
                        </td>

                        <td className="p-3 text-[#6F6A62]">
                          {formatDate(inq.createdAt)}
                        </td>

                        <td className="p-3">
                          <select
                            value={inq.status}
                            onChange={(e) => handleStatusChange(inq.id, e.target.value as any)}
                            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold border focus:outline-none cursor-pointer ${
                              inq.status === 'NEW'
                                ? 'bg-[#FAF0E1] text-[#9A622A] border-[#D8BE9B]'
                                : inq.status === 'RESPONDED'
                                ? 'bg-[#E6F4EA] text-[#2E7D5B] border-[#2E7D5B]/30'
                                : 'bg-gray-100 text-gray-700 border-gray-300'
                            }`}
                          >
                            <option value="NEW">NEW</option>
                            <option value="RESPONDED">RESPONDED</option>
                            <option value="ARCHIVED">ARCHIVED</option>
                          </select>
                        </td>

                        <td className="p-3 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => setSelectedInquiry(inq)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#FAF0E1] border border-[#D8BE9B] text-[#9A622A] hover:bg-[#A67C32] hover:text-white font-bold text-xs shadow-2xs transition-all cursor-pointer"
                              title="View Full Message & Notes"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View</span>
                            </button>

                            <a
                              href={`https://wa.me/${cleanPhone}?text=Namaste%20${encodeURIComponent(
                                inq.name
                              )},%20thank%20you%20for%20contacting%20Guru%20Diamonds%20regarding%20${encodeURIComponent(
                                inq.requirement
                              )}.`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-xl bg-[#E6F4EA] text-[#2E7D5B] hover:bg-[#25D366] hover:text-white border border-[#2E7D5B]/30 transition-colors"
                              title="Chat on WhatsApp"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </a>

                            <button
                              onClick={() => handleDelete(inq.id)}
                              className="p-1.5 rounded-xl bg-gray-100 text-gray-500 hover:bg-[#B43C3C] hover:text-white transition-colors"
                              title="Delete Inquiry"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-[#6F6A62] text-xs">
                      No customer inquiries found matching the selected criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* View & Manage Inquiry Details Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FAF8F3] border border-[#E7E1D7] rounded-3xl max-w-2xl w-full shadow-2xl p-6 sm:p-8 space-y-6 text-[#1B1A18] relative my-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#E7E1D7] pb-4">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xl font-bold text-[#A67C32]">{selectedInquiry.id}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                      selectedInquiry.status === 'NEW'
                        ? 'bg-[#FAF0E1] text-[#9A622A] border-[#D8BE9B]'
                        : selectedInquiry.status === 'RESPONDED'
                        ? 'bg-[#E6F4EA] text-[#2E7D5B] border-[#2E7D5B]/30'
                        : 'bg-gray-100 text-gray-700 border-gray-300'
                    }`}
                  >
                    {selectedInquiry.status}
                  </span>
                </div>
                <p className="text-xs text-[#6F6A62] mt-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#A67C32]" />
                  Received on {formatDate(selectedInquiry.createdAt)}
                </p>
              </div>

              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-2 rounded-full bg-white border border-[#E7E1D7] hover:bg-[#FAF0E1] text-[#1B1A18] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Patron Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white border border-[#E7E1D7] rounded-2xl p-4 space-y-1.5 shadow-2xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#A67C32] flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  <span>Patron Name & Contact</span>
                </div>
                <div className="font-bold text-sm text-[#1B1A18]">{selectedInquiry.name}</div>
                <div className="text-xs text-[#6F6A62]">{selectedInquiry.contactNumber}</div>
                <div className="text-xs text-[#6F6A62]">{selectedInquiry.gmail}</div>
              </div>

              <div className="bg-white border border-[#E7E1D7] rounded-2xl p-4 space-y-1.5 shadow-2xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#A67C32] flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Requirement Category</span>
                </div>
                <div className="font-bold text-sm text-[#9A622A]">{selectedInquiry.requirement}</div>
                <div className="text-[11px] text-[#6F6A62]">Submitted via Online Consultation Form</div>
              </div>
            </div>

            {/* Customer Message Card */}
            <div className="bg-white border border-[#E7E1D7] rounded-2xl p-5 space-y-2 shadow-2xs">
              <div className="text-xs font-bold uppercase tracking-wider text-[#9A622A]">
                Customer Message:
              </div>
              <p className="text-xs sm:text-sm text-[#1B1A18] leading-relaxed whitespace-pre-line bg-[#FAF8F3] p-4 rounded-xl border border-[#E7E1D7]">
                &ldquo;{selectedInquiry.message}&rdquo;
              </p>
            </div>

            {/* Admin Response & Notes Form */}
            <form onSubmit={handleSaveNotes} className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1B1A18]">
                Admin Internal Notes / Response Log:
              </label>
              <textarea
                rows={2}
                value={adminNoteInput}
                onChange={(e) => setAdminNoteInput(e.target.value)}
                placeholder="Add notes e.g., 'Called customer on phone, provided emerald prices...'"
                className="w-full bg-white border border-[#E7E1D7] rounded-xl p-3 text-xs text-[#1B1A18] focus:outline-none focus:border-[#A67C32]"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#A67C32] text-white text-xs font-bold rounded-xl hover:bg-[#8e6828] transition-colors"
                >
                  Save Internal Notes
                </button>
              </div>
            </form>

            {/* Modal Actions Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#E7E1D7]">
              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/${selectedInquiry.contactNumber.replace(/[^0-9]/g, '')}?text=Namaste%20${encodeURIComponent(
                    selectedInquiry.name
                  )},%20thank%20you%20for%20contacting%20Guru%20Diamonds%20regarding%20${encodeURIComponent(
                    selectedInquiry.requirement
                  )}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#25D366] text-white text-xs font-bold shadow-xs hover:bg-[#1EBE5D] transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>WhatsApp Patron</span>
                </a>

                <a
                  href={`mailto:${selectedInquiry.gmail}?subject=Guru%20Diamonds%20-%20Inquiry%20regarding%20${encodeURIComponent(
                    selectedInquiry.requirement
                  )}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-[#E7E1D7] text-[#1B1A18] text-xs font-bold hover:bg-[#FAF8F3] transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-[#A67C32]" />
                  <span>Email Patron</span>
                </a>
              </div>

              <div className="flex items-center gap-2">
                {selectedInquiry.status === 'NEW' && (
                  <button
                    onClick={() => handleStatusChange(selectedInquiry.id, 'RESPONDED')}
                    className="px-4 py-2.5 bg-[#2E7D5B] text-white text-xs font-bold rounded-xl hover:bg-[#256a4d] transition-colors"
                  >
                    Mark as Responded
                  </button>
                )}
                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="px-5 py-2.5 bg-[#1B1A18] text-white text-xs font-bold rounded-xl hover:bg-[#A67C32] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </AdminLayout>
  );
};
