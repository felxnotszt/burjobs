import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/supabase/server';
import KitchenPage from '@/components/staff/KitchenPage';

export default async function KitchenPageServer() {
  const user = await getUser();
  if (!user) redirect('/login');
  if (user.role === 'cashier') redirect('/cashier');
  return <KitchenPage />;
}