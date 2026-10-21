import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { communityAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import StarRating from '../components/StarRating';
import { PageSpinner } from '../components/Spinner';

const TYPE_LABEL = {
  home_gardener: 'Home gardener',
  plant_enthusiast: 'Plant enthusiast',
  small_grower: 'Small plant grower',
};

export default function CommunitySellerPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    communityAPI.seller(id).then((res) => setData(res.data)).catch(() => setMissing(true));
  }, [id]);

  if (missing) return <div className="container-custom py-16">This community seller is not available.</div>;
  if (!data) return <PageSpinner />;
  const seller = data.seller;

  return (
    <div className="container-custom py-10">
      <p className="text-sm uppercase tracking-[0.16em] text-primary-700">Community Seller</p>
      <h1 className="text-3xl font-display mt-2">{seller.displayName}</h1>
      <p className="text-muted mt-1">{TYPE_LABEL[seller.sellerType]}{seller.pickupAddress?.city ? ` · ${seller.pickupAddress.city}` : ''}</p>
      {seller.ratings?.count > 0 && <div className="mt-3"><StarRating rating={seller.ratings.average} count={seller.ratings.count} showCount /></div>}
      {seller.bio && <p className="max-w-2xl mt-4">{seller.bio}</p>}
      <h2 className="text-xl font-semibold mt-10 mb-4">Plants from this seller</h2>
      {data.products.length === 0 && <p className="text-muted">No active listings.</p>}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {data.products.map((product) => (
          <ProductCard key={product._id} product={{ ...product, listingSource: 'community', communitySeller: seller }} />
        ))}
      </div>
      <Link to="/products?sellerType=community" className="inline-block mt-8 text-primary-700">Browse all community plants</Link>
    </div>
  );
}
