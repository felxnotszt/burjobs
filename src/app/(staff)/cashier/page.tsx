import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/supabase/server';
import CashierPage from '@/components/staff/CashierPage';

export default async function CashierPageServer() {
  const user = await getUser();
  if (!user) redirect('/login');
  if (!['admin', 'cashier'].includes(user.role)) redirect('/kitchen');
  return <CashierPage />;
}