import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { auctionAPI } from '../../services/api';
import { formatPrice } from '../../utils/helpers';

function endsLabel(value) {
  return new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function AuctionsPage() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    auctionAPI.list({ status: 'live' })
      .then((res) => setAuctions(res.data.auctions || []))
      .catch(() => setAuctions([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container-custom py-6 sm:py-10">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-700">Plant auctions</p>
          <h1 className="mt-1 font-display text-3xl text-primary-900">Bid on a plant</h1>
          <p className="mt-1 max-w-xl text-sm text-muted">These auctions are separate from the nursery shop. The highest bid at the end wins, and the payment is split 80% to the donor and 20% to Thottam.</p>
        </div>
        <Link to="/auctions/new" className="btn-primary h-11 w-full justify-center whitespace-nowrap sm:w-auto">List a plant for auction</Link>
      </div>
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => <div key={item} className="h-64 skeleton rounded-[1.4rem]" />)}
        </div>
      ) : auctions.length === 0 ? (
        <div className="rounded-[1.4rem] bg-white px-6 py-14 text-center shadow-card">
          <p className="font-display text-2xl text-primary-900">No live auctions</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted">When a customer lists a plant, it will appear here for bidding.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {auctions.map((auction) => (
            <Link key={auction._id} to={`/auctions/${auction._id}`} className="overflow-hidden rounded-[1.4rem] bg-white shadow-card">
              <img src={auction.images?.[0]?.url} alt="" className="h-48 w-full object-cover" />
              <div className="p-4">
                <p className="font-medium text-ink">{auction.name}</p>
                <p className="mt-1 text-sm text-muted">Listed by {auction.donorName}</p>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted">{auction.bidCount ? 'Highest bid' : 'Starting bid'}</p>
                    <p className="font-display text-2xl text-primary-800">{formatPrice(auction.bidCount ? auction.highestBid : auction.startingBid)}</p>
                  </div>
                  <p className="text-right text-xs text-muted">Ends {endsLabel(auction.endsAt)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
