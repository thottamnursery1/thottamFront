import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { nurseryAPI, productAPI } from '../services/api';
import ProductCard from '../components/ProductCard';

export default function NurseryDetailPage() {
  const { slug } = useParams();
  const [nursery, setNursery] = useState(null);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
    nurseryAPI.getOne(slug)
      .then((res) => {
        setNursery(res.data.nursery);
        return productAPI.getAll({ nursery: res.data.nursery.slug, limit: 24 });
      })
      .then((res) => setProducts(res.data.products))
      .catch(() => setError('This nursery is not available.'));
  }, [slug]);

  if (error) return <div className="container-custom py-20 text-center text-muted">{error}</div>;
  if (!nursery) return <div className="container-custom py-10"><div className="h-64 skeleton rounded-3xl" /></div>;

  return (
    <div>
      <div className="h-56 sm:h-72 bg-sage-100">
        {nursery.coverImage && <img src={nursery.coverImage} alt="" className="w-full h-full object-cover" />}
      </div>
      <div className="container-custom py-8">
        <h1 className="text-4xl sm:text-5xl">{nursery.name}</h1>
        <p className="text-muted mt-2">{nursery.city}, {nursery.state} · {nursery.productCount} plants</p>
        <p className="max-w-2xl mt-4 leading-relaxed">{nursery.description}</p>
        {nursery.isDemo && <p className="text-xs text-muted mt-3">Sample nursery for development.</p>}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {products.map((product) => <ProductCard key={product._id} product={product} />)}
        </div>
        {products.length === 0 && <p className="mt-8 text-muted">This nursery has no approved plants yet.</p>}
      </div>
    </div>
  );
}
