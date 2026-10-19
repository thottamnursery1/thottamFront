import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { nurseryAPI } from '../services/api';

export default function PolicyPage() {
  const { topic } = useParams();
  const [settings, setSettings] = useState(null);
  useEffect(() => { nurseryAPI.publicSettings().then((res) => setSettings(res.data.settings)); }, []);
  const isShipping = topic === 'shipping';
  return (
    <div className="container-custom py-12 max-w-2xl">
      <h1 className="text-4xl">{isShipping ? 'Delivery' : 'Returns and cancellation'}</h1>
      {!settings ? <div className="h-24 skeleton rounded-2xl mt-6" /> : (
        <div className="mt-6 space-y-4 text-ink/90 leading-relaxed">
          {isShipping ? (
            <>
              <p>Delivery is ₹{settings.deliveryCharge} and becomes free above ₹{settings.freeDeliveryThreshold}. The charge is calculated on the server from your cart, not from the page total.</p>
              <p>Each nursery only ships to the PIN codes it has listed. Check a PIN on the product page before you pay.</p>
              <p>{settings.settlementNote}</p>
            </>
          ) : (
            <>
              <p>{settings.cancellationPolicy}</p>
              <p>{settings.returnPolicy}</p>
              <p>Support: {settings.supportEmail} · {settings.supportPhone}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
