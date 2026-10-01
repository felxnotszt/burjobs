import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail, verifyPassword, createSession } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email dan password wajib' }, { status: 400 });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Email atau password salah' }, { status: 401 });
    }

    const ok = await verifyPassword(password, user.password);
    if (!ok) {
      return NextResponse.json({ success: false, message: 'Email atau password salah' }, { status: 401 });
    }

    const token = await createSession(user.id, user.role);
    const cookieStore = await cookies();
    cookieStore.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
      sameSite: 'lax',
    });

    return NextResponse.json({
      success: true,
      data: { role: user.role, name: user.name },
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message ?? 'Server error' }, { status: 500 });
  }
}
