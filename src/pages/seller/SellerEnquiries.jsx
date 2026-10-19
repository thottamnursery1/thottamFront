import { useEffect, useState } from 'react';
import { sellerAPI } from '../../services/api';
import { ChatBubbleLeftRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const STATUS_BADGE = {
  open:   'bg-blue-100 text-blue-700',
  closed: 'bg-gray-100 text-gray-500',
};

export default function SellerEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [replies,   setReplies]   = useState({});

  const load = () => {
    setLoading(true);
    sellerAPI.enquiries()
      .then((res) => setEnquiries(res.data.enquiries || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const reply = async (id) => {
    const text = (replies[id] || '').trim();
    if (!text) return;
    await sellerAPI.replyEnquiry(id, { reply: text });
    toast.success('Reply saved.');
    setReplies((prev) => ({ ...prev, [id]: '' }));
    load();
  };

  const close = async (id) => {
    await sellerAPI.replyEnquiry(id, { status: 'closed' });
    toast.success('Enquiry closed.');
    load();
  };

  return (
    <div className="space-y-5 animate-fade-in">

      <div className="page-header">
        <div>
          <h1 className="page-title">Enquiries</h1>
          <p className="page-subtitle">Customer questions from your product pages</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-32 skeleton rounded-[14px]" />)}
        </div>
      ) : enquiries.length === 0 ? (
        <div className="card">
          <div className="empty-state py-16">
            <ChatBubbleLeftRightIcon className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-sm font-semibold text-gray-600 mb-1">No enquiries yet</p>
            <p className="text-xs text-gray-400">Customer questions from your product pages will appear here.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {enquiries.map((item) => (
            <div key={item._id} className="card p-5 space-y-3">
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {item.email}{item.phone ? ` · ${item.phone}` : ''}
                  </p>
                </div>
                <span className={`badge text-xs ${STATUS_BADGE[item.status] || 'bg-gray-100 text-gray-500'} capitalize`}>
                  {item.status}
                </span>
              </div>

              {/* Product tag */}
              {item.product?.name && (
                <p className="text-xs font-medium text-primary-600 bg-primary-50 inline-block px-2.5 py-1 rounded-lg">
                  Re: {item.product.name}
                </p>
              )}

              {/* Message */}
              <p className="text-sm text-gray-700 leading-relaxed">{item.message}</p>

              {/* Existing reply */}
              {item.reply && (
                <div className="bg-primary-50 border border-primary-100 rounded-xl px-4 py-3">
                  <p className="text-xs font-semibold text-primary-600 mb-1">Your reply</p>
                  <p className="text-sm text-gray-700">{item.reply}</p>
                </div>
              )}

              {/* Reply form */}
              {item.status !== 'closed' && (
                <div className="flex gap-2 pt-1">
                  <input
                    className="input flex-1 text-sm"
                    placeholder="Write a reply…"
                    value={replies[item._id] || ''}
                    onChange={(e) => setReplies((prev) => ({ ...prev, [item._id]: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); reply(item._id); } }}
                  />
                  <button
                    type="button"
                    onClick={() => reply(item._id)}
                    disabled={!(replies[item._id] || '').trim()}
                    className="btn-primary text-sm px-4 disabled:opacity-40"
                  >
                    Reply
                  </button>
                  <button
                    type="button"
                    onClick={() => close(item._id)}
                    className="btn-icon text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
                    title="Mark as closed"
                  >
                    <CheckCircleIcon className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
