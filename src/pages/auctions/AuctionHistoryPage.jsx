import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { auctionAPI } from '../../services/api';
import { formatPrice } from '../../utils/helpers';

function Row({ auction, action }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium text-ink">{auction.name}</p>
        <p className="text-sm capitalize text-muted">{auction.status.replace('_', ' ')} · {auction.bidCount} bids · {formatPrice(auction.winningAmount || auction.highestBid || auction.startingBid)}</p>
      </div>
      {action}
    </div>
  );
}

export default function AuctionHistoryPage() {
  const [data, setData] = useState(null);
  useEffect(() => { auctionAPI.mine().then((res) => setData(res.data)).catch(() => setData({ listed: [], won: [], payments: [] })); }, []);
  if (!data) return <div className="container-custom py-10"><div className="h-40 skeleton rounded-[1.4rem]" /></div>;

  return (
    <div className="container-custom space-y-8 py-6 sm:py-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-700">Auction records</p>
        <h1 className="mt-1 font-display text-3xl text-primary-900">Your auctions</h1>
        <p className="mt-1 text-sm text-muted">{data.razorpayAccountId ? `Route account ${data.razorpayAccountId} is linked.` : 'No Razorpay Route account is linked yet. Donor shares stay in the settlement record until one is added.'}</p>
      </div>
      <section className="space-y-3">
        <h2 className="font-display text-2xl text-primary-900">Plants you listed</h2>
        {data.listed.length === 0 && <p className="text-sm text-muted">You have not listed an auction.</p>}
        {data.listed.map((auction) => <Row key={auction._id} auction={auction} action={<Link className="btn-outline h-10 whitespace-nowrap px-3" to={`/auctions/${auction._id}`}>Open</Link>} />)}
      </section>
      <section className="space-y-3">
        <h2 className="font-display text-2xl text-primary-900">Auctions you won</h2>
        {data.won.length === 0 && <p className="text-sm text-muted">You have not won an auction.</p>}
        {data.won.map((auction) => (
          <Row
            key={auction._id}
            auction={auction}
            action={auction.status === 'awaiting_payment' ? <Link className="btn-primary h-10 whitespace-nowrap px-3" to={`/auctions/${auction._id}/pay`}>Pay</Link> : <Link className="btn-outline h-10 whitespace-nowrap px-3" to={`/auctions/${auction._id}`}>Open</Link>}
          />
        ))}
      </section>
      <section className="space-y-3">
        <h2 className="font-display text-2xl text-primary-900">Payment history</h2>
        {data.payments.length === 0 && <p className="text-sm text-muted">Paid auctions will keep a record of both shares here.</p>}
        {data.payments.map((payment) => (
          <div key={payment._id} className="rounded-2xl bg-white p-4 shadow-card">
            <p className="font-medium text-ink">{payment.auctionName}</p>
            <p className="mt-1 text-sm text-muted capitalize">{payment.role} · {payment.status} · {payment.transferStatus.replaceAll('_', ' ')}</p>
            <p className="mt-2 text-sm">Winning bid {formatPrice(payment.amount)} · Donor {formatPrice(payment.donorShare)} · Thottam {formatPrice(payment.platformShare)}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
