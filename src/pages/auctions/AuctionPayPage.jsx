import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { auctionAPI } from '../../services/api';
import { formatPrice } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function AuctionPayPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    auctionAPI.checkout(id).then((res) => setPayload(res.data)).catch(() => setPayload(null));
  }, [id]);

  const pay = async () => {
    setLoading(true);
    try {
      const ready = await loadRazorpayScript();
      if (!ready) { toast.error('Could not load Razorpay.'); return; }
      const res = await auctionAPI.pay(id);
      const { razorpayOrder, keyId } = res.data;
      const rzp = new window.Razorpay({
        key: keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Thottam',
        description: payload.auction.name,
        order_id: razorpayOrder.id,
        prefill: { name: user?.name, email: user?.email, contact: user?.phone },
        theme: { color: '#173F35' },
        handler: async (response) => {
          try {
            await auctionAPI.verify(id, response);
            toast.success('Payment received. The 80/20 split is recorded.');
            navigate('/account/auctions');
          } catch {
            toast.error('Payment verification failed. If money was taken, it will be reconciled from the Razorpay webhook.');
          }
        },
        modal: { ondismiss: () => toast('Payment was not completed.', { icon: 'ℹ️' }) },
      });
      rzp.on('payment.failed', (response) => toast.error(response.error?.description || 'Payment failed.'));
      rzp.open();
    } finally {
      setLoading(false);
    }
  };

  if (!payload) return <div className="container-custom py-10"><div className="h-64 skeleton rounded-[1.4rem]" /></div>;
  const { auction, quote } = payload;

  return (
    <div className="container-custom max-w-xl py-6 sm:py-10">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-700">Auction checkout</p>
      <h1 className="mt-1 font-display text-3xl text-primary-900">{auction.name}</h1>
      <div className="mt-5 space-y-3 rounded-[1.4rem] bg-white p-5 shadow-card">
        <div className="flex justify-between text-sm"><span>Winning bid</span><span>{formatPrice(quote.totalAmount)}</span></div>
        <div className="flex justify-between text-sm"><span>Donor, 80%</span><span>{formatPrice(quote.donorShare)}</span></div>
        <div className="flex justify-between text-sm"><span>Thottam, 20%</span><span>{formatPrice(quote.platformShare)}</span></div>
        <div className="flex justify-between border-t border-gray-100 pt-3 font-semibold"><span>You pay</span><span>{formatPrice(quote.totalAmount)}</span></div>
        <p className="text-xs leading-relaxed text-muted">{quote.routeNote}</p>
        <button type="button" className="btn-primary h-11 w-full justify-center" onClick={pay} disabled={loading}>
          {loading ? 'Opening Razorpay…' : `Pay ${formatPrice(quote.totalAmount)}`}
        </button>
        <p className="text-center text-xs text-muted">Secured by Razorpay. The split is calculated on the server.</p>
      </div>
    </div>
  );
}
