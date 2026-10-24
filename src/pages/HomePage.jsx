import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productAPI, categoryAPI, nurseryAPI, reviewAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import toast from 'react-hot-toast';

const FALLBACK_CATEGORIES = [
  { name: 'Indoor Plants', slug: 'indoor-plants', image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=900&q=80' },
  { name: 'Outdoor Plants', slug: 'outdoor-plants', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=900&q=80' },
  { name: 'Flowering Plants', slug: 'flowering-plants', image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=900&q=80' },
  { name: 'Succulents', slug: 'succulents', image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&w=900&q=80' },
  { name: 'Herbs', slug: 'herbs', image: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=900&q=80' },
  { name: 'Trees', slug: 'trees', image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=900&q=80' },
  { name: 'Pots & Planters', slug: 'pots-planters', image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=900&q=80' },
  { name: 'Soil & Fertilizers', slug: 'soil-fertilizers', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=900&q=80' },
  { name: 'Accessories', slug: 'gardening-accessories', image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=900&q=80' },
];

const TIPS = [
  { title: 'Water the soil, not the calendar', body: 'Push a finger into the mix. If it is dry to the first knuckle, water until it drains, then empty the saucer.' },
  { title: 'Match the window', body: 'Bright indirect light suits most foliage. Flowering plants and succulents want the strongest light you can give them.' },
  { title: 'Repot when roots circle', body: 'Move up one pot size in spring. A nursery can pot the plant for you before it ships.' },
];

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => <div key={i} className="aspect-[4/5] rounded-2xl skeleton" />)}
    </div>
  );
}

function Rail({ title, kicker, to, products, loading }) {
  return (
    <section className="container-custom">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted">{kicker}</p>
          <h2 className="text-3xl sm:text-4xl text-ink mt-1">{title}</h2>
        </div>
        <Link to={to} className="text-sm font-semibold text-primary-700">View all</Link>
      </div>
      {loading ? <SkeletonGrid /> : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {products.slice(0, 4).map((product) => <ProductCard key={product._id} product={product} />)}
        </div>
      )}
    </section>
  );
}

export default function HomePage() {
  const [featured, setFeatured] = useState({ featured: [], bestSellers: [], newArrivals: [], beginners: [] });
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [nurseries, setNurseries] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [seasonal, setSeasonal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [joining, setJoining] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    Promise.all([
      productAPI.getFeatured(),
      categoryAPI.getAll(),
      nurseryAPI.list(),
      nurseryAPI.publicSettings(),
      reviewAPI.getRecent(),
      productAPI.getAll({ seasonal: 'Monsoon', limit: 4 }),
    ]).then(([products, cats, nurs, settings, reviewRes, season]) => {
      setFeatured(products.data);
      const apiCats = cats.data.categories || [];
      if (apiCats.length) {
        setCategories(FALLBACK_CATEGORIES.map((item) => {
          const match = apiCats.find((cat) => cat.slug === item.slug);
          return match ? { ...item, ...match, image: match.image || item.image } : item;
        }));
      }
      setNurseries(nurs.data.nurseries || []);
      setDemoMode(Boolean(settings.data.settings?.demoMode));
      setReviews(reviewRes.data.reviews || []);
      setSeasonal(season.data.products || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const subscribe = async (event) => {
    event.preventDefault();
    setJoining(true);
    try {
      const res = await nurseryAPI.subscribe(email);
      toast.success(res.data.message);
      setEmail('');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="pb-8">
      <section className="container-custom pt-6 lg:pt-10">
        <div className="relative overflow-hidden rounded-[2.2rem] min-h-[32rem] bg-primary-800">
          <img src="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1800&q=80" alt="" className="absolute inset-0 w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/80 via-primary-800/45 to-transparent" />
          <div className="relative grid lg:grid-cols-12 gap-8 p-6 sm:p-10 lg:p-14 items-end min-h-[32rem]">
            <div className="lg:col-span-6 text-white animate-fade-in-up">
              <p className="text-xs uppercase tracking-[0.28em] text-mint mb-4">A botanical marketplace</p>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl leading-[0.95] text-white">Bring the nursery home.</h1>
              <p className="mt-5 text-base sm:text-lg text-mint/90 max-w-md leading-relaxed">
                Plants, pots, and soil from independent growers. Each listing carries the nursery that raised it.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/products" className="btn-primary bg-white text-primary-800 hover:bg-mint">Explore plants</Link>
                <Link to="/nurseries" className="btn-outline border-white text-white hover:bg-white hover:text-primary-800">Meet the nurseries</Link>
              </div>
              {demoMode && <p className="mt-6 text-xs text-mint/80">Development catalog. Sample nurseries are hidden in production.</p>}
            </div>
            <div className="hidden lg:flex lg:col-span-5 lg:col-start-8">
              <div className="glass-panel rounded-[1.8rem] p-4 text-ink w-full">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">This season</p>
                <p className="font-display text-3xl mt-1">Soft light, steady water.</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <img src="https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=600&q=80" alt="Leafy indoor plant" className="h-36 w-full object-cover rounded-2xl" />
                  <img src="https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&w=600&q=80" alt="Succulent rosette" className="h-36 w-full object-cover rounded-2xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-custom mt-16 lg:mt-24">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-3xl sm:text-4xl">Shop by category</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {categories.map((category) => (
            <Link key={category.slug} to={`/products?category=${category.slug}`} className="group relative overflow-hidden rounded-[1.6rem] aspect-[4/5] bg-sage-100">
              <img src={category.image} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <span className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-ink/70 to-transparent text-white font-medium">{category.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-16 lg:mt-24 space-y-16 lg:space-y-24">
        <Rail title="Featured this week" kicker="From the floor" to="/products?isFeatured=true" products={featured.featured?.length ? featured.featured : featured.bestSellers || []} loading={loading} />
        <Rail title="Bestsellers" kicker="Most loved" to="/products?isBestSeller=true" products={featured.bestSellers || []} loading={loading} />
        <Rail title="New arrivals" kicker="Just potted" to="/products?isNewArrival=true" products={featured.newArrivals || []} loading={loading} />
        <Rail title="Plants for beginners" kicker="Easy care" to="/products?beginner=true" products={featured.beginners || []} loading={loading} />
      </div>

      <section className="container-custom mt-16 lg:mt-24">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Seasonal</p>
            <h2 className="text-3xl sm:text-4xl mt-1">Monsoon collection</h2>
          </div>
          <Link to="/products?seasonal=Monsoon" className="text-sm font-semibold text-primary-700">View collection</Link>
        </div>
        {seasonal.length === 0 && !loading ? (
          <p className="text-muted">Seasonal plants will appear here when nurseries tag a collection.</p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {seasonal.map((product) => <ProductCard key={product._id} product={product} />)}
          </div>
        )}
      </section>

      <section className="container-custom mt-16 lg:mt-24">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Trusted growers</p>
            <h2 className="text-3xl sm:text-4xl mt-1">Nurseries on Thottam</h2>
          </div>
          <Link to="/nurseries" className="text-sm font-semibold text-primary-700">All nurseries</Link>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {nurseries.length === 0 && !loading && <p className="text-muted">Approved nurseries will appear after the first seller is accepted.</p>}
          {nurseries.map((nursery) => (
            <article key={nursery._id} className="glass-panel rounded-[1.8rem] overflow-hidden grid sm:grid-cols-[180px_1fr]">
              <img src={nursery.coverImage || nursery.logo || FALLBACK_CATEGORIES[0].image} alt="" className="h-40 sm:h-full w-full object-cover" />
              <div className="p-6">
                <h3 className="text-2xl">{nursery.name}</h3>
                <p className="text-sm text-muted mt-1">{nursery.city}{nursery.state ? `, ${nursery.state}` : ''}</p>
                <p className="text-sm mt-3 text-ink/80 line-clamp-2">{nursery.description}</p>
                <p className="text-xs text-muted mt-3">{nursery.productCount} plants</p>
                <Link to={`/nurseries/${nursery.slug}`} className="btn-outline mt-4 px-4 py-2 text-sm min-h-0">View nursery</Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="container-custom mt-16 lg:mt-24 grid lg:grid-cols-3 gap-4">
        {TIPS.map((tip) => (
          <article key={tip.title} className="glass-panel rounded-[1.8rem] p-6">
            <h3 className="text-2xl">{tip.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-ink/80">{tip.body}</p>
          </article>
        ))}
      </section>

      <section className="container-custom mt-16 lg:mt-24">
        <h2 className="text-3xl sm:text-4xl mb-6">From customers</h2>
        {reviews.length === 0 ? (
          <p className="text-muted">Reviews from verified orders will appear here. Be the first to share how a plant settled in.</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {reviews.slice(0, 3).map((review) => (
              <blockquote key={review._id} className="glass-panel rounded-[1.8rem] p-6">
                <p className="text-ink leading-relaxed">“{review.comment}”</p>
                <footer className="mt-4 text-sm text-muted">{review.user?.name} · {review.product?.name}</footer>
              </blockquote>
            ))}
          </div>
        )}
      </section>

      <section className="container-custom mt-16">
        <div className="bg-primary-800 text-white rounded-[2rem] px-6 py-10 sm:px-12 sm:flex items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl sm:text-4xl text-white">Notes for the growing season</h2>
            <p className="mt-2 text-sage-100 max-w-md">A short letter when new nurseries join or a collection changes. No weekly noise.</p>
          </div>
          <form onSubmit={subscribe} className="mt-6 sm:mt-0 flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <label htmlFor="newsletter" className="sr-only">Email</label>
            <input id="newsletter" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className="input sm:w-72 text-ink" />
            <button className="btn-primary bg-white text-primary-800 hover:bg-sage-100" disabled={joining}>{joining ? 'Joining…' : 'Subscribe'}</button>
          </form>
        </div>
      </section>
    </div>
  );
}
