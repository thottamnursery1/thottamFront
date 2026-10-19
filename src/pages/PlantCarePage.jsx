import { Link } from 'react-router-dom';

const GUIDES = [
  { title: 'Indoor foliage', to: '/products?category=indoor-plants', body: 'Most houseplants want bright, indirect light and a pot with a drainage hole. Water when the top of the mix is dry.' },
  { title: 'Outdoor beds', to: '/products?category=outdoor-plants', body: 'Harden plants for a few days before full sun. Water deeply in the morning rather than misting at night.' },
  { title: 'Succulents', to: '/products?category=succulents', body: 'Use a gritty mix and a pot that dries quickly. If leaves wrinkle, water. If they turn translucent, you watered too soon.' },
];

export default function PlantCarePage() {
  return (
    <div className="container-custom py-12 max-w-3xl">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">Guides</p>
      <h1 className="text-5xl mt-2">Plant care</h1>
      <p className="mt-4 text-lg text-muted">Each product page carries the nursery’s own notes for light, water, soil, and maintenance. These are the habits that prevent most losses.</p>
      <div className="mt-8 space-y-4">
        {GUIDES.map((guide) => (
          <article key={guide.title} className="bg-white border border-line rounded-3xl p-6">
            <h2 className="text-2xl">{guide.title}</h2>
            <p className="mt-2 text-sm leading-relaxed">{guide.body}</p>
            <Link to={guide.to} className="inline-block mt-4 text-sm font-semibold text-primary-700">Shop this group</Link>
          </article>
        ))}
      </div>
    </div>
  );
}
