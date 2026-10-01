import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/supabase/server';
import LoginForm from '@/components/staff/LoginForm';

export default async function LoginPage() {
  const user = await getUser();
  if (user) redirect(user.role === 'cashier' ? '/cashier' : '/kitchen');
  return <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="bg-white p-8 rounded-lg shadow w-full max-w-md">
      <h1 className="text-2xl font-bold text-green-900 mb-6 text-center">BurjoKu</h1>
      <LoginForm />
    </div>
  </div>;
}
