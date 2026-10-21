import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { communityAPI } from '../../services/api';
import { formatPrice } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function CommunityProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    communityAPI.products().then((res) => setProducts(res.data.products || [])).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const pause = async (product) => {
    await communityAPI.updateProduct(product._id, { ...product, imageUrls: (product.images || []).map((img) => img.url).join('\n'), paused: !product.paused, careInstructions: product.plantInfo?.careInstructions });
    toast.success(product.paused ? 'Listing resumed.' : 'Listing paused.');
    load();
  };

  const remove = async (product) => {
    if (!window.confirm(`Remove ${product.name} from the marketplace?`)) return;
    await communityAPI.deleteProduct(product._id);
    toast.success('Listing removed.');
    load();
  };

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Your listings</h1>
          <p className="page-subtitle">Approved sellers can publish without waiting for each edit, unless a listing is flagged.</p>
        </div>
        <Link to="/community/products/new" className="btn-primary">Add plant</Link>
      </div>
      {loading && <div className="h-32 skeleton rounded-2xl" />}
      {!loading && products.length === 0 && (
        <div className="card p-8 text-center">
          <p className="font-medium">No community listings yet</p>
          <p className="text-sm text-muted mt-1">List herbs, seedlings, cuttings, or indoor plants with a real photo.</p>
        </div>
      )}
      <div className="grid md:grid-cols-2 gap-4">
        {products.map((product) => (
          <article key={product._id} className="card p-4 flex gap-4">
            <img src={product.images?.[0]?.url} alt="" className="w-20 h-20 rounded-xl object-cover bg-sage-100" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap gap-2 mb-1">
                <span className="badge bg-sage-100 text-primary-800">Community Seller</span>
                <span className="badge bg-white border border-line">{product.paused ? 'Paused' : product.listingStatus}</span>
              </div>
              <h2 className="font-medium truncate">{product.name}</h2>
              <p className="text-sm text-muted">{formatPrice(product.price)} · {product.stock} in stock</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Link to={`/community/products/${product._id}/edit`} className="btn-outline text-sm">Edit</Link>
                <button type="button" className="btn-outline text-sm" onClick={() => pause(product)}>{product.paused ? 'Resume' : 'Pause'}</button>
                <button type="button" className="text-sm text-red-600 px-2" onClick={() => remove(product)}>Delete</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
