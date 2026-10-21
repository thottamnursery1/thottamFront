import { useEffect, useState } from 'react';
import { Link, Navigate, Outlet } from 'react-router-dom';
import { communityAPI } from '../services/api';
import { PageSpinner } from './Spinner';

export default function CommunityRoute() {
  const [profile, setProfile] = useState(undefined);

  useEffect(() => {
    communityAPI.me().then((res) => setProfile(res.data.profile)).catch(() => setProfile(null));
  }, []);

  if (profile === undefined) return <PageSpinner />;
  if (!profile || profile.status !== 'approved') return <Navigate to="/community/apply" replace />;
  return <Outlet />;
}
