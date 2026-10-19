import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="bg-primary-800 text-primary-50 mt-16">
      <div className="container-custom py-14 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo light />
          <p className="mt-4 text-sm text-sage-200 leading-relaxed max-w-xs">
            A marketplace of independent nurseries. Plants are grown, packed, and sent by the seller you choose.
          </p>
        </div>
        <div>
          <h2 className="text-white text-lg mb-3">Shop</h2>
          <ul className="space-y-2 text-sm text-sage-200">
            <li><Link to="/products" className="hover:text-white">All plants</Link></li>
            <li><Link to="/products?category=indoor-plants">Indoor</Link></li>
            <li><Link to="/products?category=outdoor-plants">Outdoor</Link></li>
            <li><Link to="/products?category=succulents">Succulents</Link></li>
            <li><Link to="/products?category=herbs">Herbs</Link></li>
            <li><Link to="/products?category=trees">Trees</Link></li>
            <li><Link to="/products?category=soil-fertilizers">Soil</Link></li>
            <li><Link to="/products?category=gardening-accessories">Accessories</Link></li>
            <li><Link to="/nurseries">Nurseries</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="text-white text-lg mb-3">Support</h2>
          <ul className="space-y-2 text-sm text-sage-200">
            <li><Link to="/plant-care">Plant care</Link></li>
            <li><Link to="/policies/shipping">Delivery</Link></li>
            <li><Link to="/policies/returns">Returns & cancellation</Link></li>
            <li><a href="mailto:hello@rootandbloom.test">hello@rootandbloom.test</a></li>
          </ul>
        </div>
        <div>
          <h2 className="text-white text-lg mb-3">Sell</h2>
          <p className="text-sm text-sage-200 mb-4">List your nursery after a short approval review.</p>
          <Link to="/sell" className="inline-flex rounded-full bg-white text-primary-800 px-4 py-2 text-sm font-semibold">Register your nursery</Link>
          <div className="flex gap-4 mt-5 text-sm">
            <a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a>
            <a href="https://pinterest.com" target="_blank" rel="noreferrer">Pinterest</a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-custom py-4 text-xs text-sage-300 flex flex-col sm:flex-row gap-2 sm:justify-between">
          <span>© {new Date().getFullYear()} Root & Bloom</span>
          <span>Demo catalog is labeled in the shop. Payments require Razorpay test keys.</span>
        </div>
      </div>
    </footer>
  );
}
