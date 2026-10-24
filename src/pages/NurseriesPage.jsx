import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { nurseryAPI } from '../services/api';

export default function NurseriesPage() {
  const [nurseries, setNurseries] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { nurseryAPI.list().then((res) => setNurseries(res.data.nurseries)).finally(() => setLoading(false)); }, []);

  return (
    <div className="container-custom py-10">
      <h1 className="text-4xl sm:text-5xl">Nurseries</h1>
      <p className="text-muted mt-3 max-w-xl">Every plant on Thottam is sold by an approved nursery. Open a grower to see only their plants.</p>
      {loading ? <div className="h-48 skeleton rounded-3xl mt-8" /> : (
        <div className="grid md:grid-cols-2 gap-4 mt-8">
          {nurseries.length === 0 && <p>No approved nurseries yet.</p>}
          {nurseries.map((nursery) => (
            <article key={nursery._id} className="bg-white border border-line rounded-3xl overflow-hidden">
              <img src={nursery.coverImage || nursery.logo} alt="" className="h-48 w-full object-cover bg-sage-100" />
              <div className="p-5">
                <h2 className="text-2xl">{nursery.name}</h2>
                <p className="text-sm text-muted">{nursery.city}, {nursery.state} · {nursery.productCount} plants</p>
                <p className="text-sm mt-2 line-clamp-2">{nursery.description}</p>
                <Link to={`/nurseries/${nursery.slug}`} className="btn-outline mt-4 py-2 text-sm">View nursery</Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
