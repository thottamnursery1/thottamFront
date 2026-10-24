import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { auctionAPI } from '../../services/api';
import { formatPrice } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';

export default function AuctionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => auctionAPI.get(id).then((res) => {
    setAuction(res.data.auction);
    setBids(res.data.bids || []);
    setAmount(String(res.data.auction.nextBid || ''));
  }).catch(() => setAuction(null));

  useEffect(() => { load(); }, [id]);

  const placeBid = async (event) => {
    event.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/auctions/${id}` } } });
      return;
    }
    setBusy(true);
    try {
      await auctionAPI.bid(id, { amount: Number(amount) });
      toast.success('Your bid is in.');
      load();
    } finally {
      setBusy(false);
    }
  };

  if (!auction) return <div className="container-custom py-10"><div className="h-64 skeleton rounded-[1.4rem]" /></div>;
  const current = auction.bidCount ? auction.highestBid : auction.startingBid;

  return (
    <div className="container-custom grid gap-6 py-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] sm:py-10">
      <div>
        <img src={auction.images?.[0]?.url} alt="" className="h-72 w-full rounded-[1.4rem] object-cover sm:h-96" />
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {auction.images?.slice(1).map((image) => (
            <img key={image.url} src={image.url} alt="" className="h-20 w-20 shrink-0 rounded-xl object-cover" />
          ))}
        </div>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-primary-700">Listed by {auction.donorName}</p>
        <h1 className="mt-1 font-display text-3xl text-primary-900">{auction.name}</h1>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink/80">{auction.description}</p>
      </div>
      <aside className="h-fit rounded-[1.4rem] bg-white p-5 shadow-card">
        <p className="text-xs uppercase tracking-wide text-muted">{auction.bidCount ? 'Current highest bid' : 'Starting bid'}</p>
        <p className="font-display text-4xl text-primary-800">{formatPrice(current)}</p>
        <p className="mt-2 text-sm text-muted">{auction.bidCount} bid{auction.bidCount === 1 ? '' : 's'} · raises by {formatPrice(auction.minIncrement)}</p>
        <p className="mt-1 text-sm text-muted">Ends {new Date(auction.endsAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
        {auction.status === 'live' && !auction.isDonor && (
          <form onSubmit={placeBid} className="mt-5 space-y-3">
            <label className="block">
              <span className="label">Your bid (₹)</span>
              <input className="input" type="number" min={auction.nextBid || 1} step="1" value={amount} onChange={(e) => setAmount(e.target.value)} required />
            </label>
            <button className="btn-primary h-11 w-full justify-center" disabled={busy}>{busy ? 'Placing bid…' : `Bid ${formatPrice(Number(amount) || auction.nextBid || 0)}`}</button>
          </form>
        )}
        {auction.isDonor && <p className="mt-5 text-sm text-muted">This is your auction. Bids from other customers appear below.</p>}
        {auction.canPay && <Link to={`/auctions/${auction._id}/pay`} className="btn-primary mt-5 h-11 w-full justify-center">Pay the winning bid</Link>}
        {auction.status === 'paid' && <p className="mt-5 text-sm text-primary-700">This auction is paid. The 80/20 split is recorded.</p>}
        <div className="mt-6 space-y-2 border-t border-gray-100 pt-4">
          <p className="text-sm font-semibold text-ink">Recent bids</p>
          {bids.length === 0 && <p className="text-sm text-muted">No bids yet.</p>}
          {bids.map((bid) => (
            <div key={bid._id} className="flex items-center justify-between text-sm">
              <span className="text-ink/80">{bid.mine ? 'You' : bid.bidderName} {bid.status === 'outbid' ? '· outbid' : ''}</span>
              <span className="font-medium">{formatPrice(bid.amount)}</span>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
