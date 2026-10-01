// Auth utilities: password hashing + JWT using Web Crypto (no deps)
import { db } from '@/db';
import { profiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Web Crypto is available globally in Edge/Node 18+
const PBKDF2_ITERATIONS = 100_000;
const KEY_LENGTH = 32;

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const derived = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    key,
    KEY_LENGTH * 8
  );
  const hash = new Uint8Array(derived);
  const out = new Uint8Array(salt.length + hash.length);
  out.set(salt);
  out.set(hash, salt.length);
  return Buffer.from(out).toString('base64');
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const data = Buffer.from(stored, 'base64');
  const salt = data.subarray(0, 16);
  const hash = data.subarray(16);
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const derived = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    key,
    KEY_LENGTH * 8
  );
  const calcHash = new Uint8Array(derived);
  // constant-time compare
  if (calcHash.length !== hash.length) return false;
  let diff = 0;
  for (let i = 0; i < hash.length; i++) diff |= calcHash[i] ^ hash[i];
  return diff === 0;
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

async function signJwt(payload: object): Promise<string> {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  const key = await crypto.subtle.importKey(
    'raw', JWT_SECRET, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${header}.${body}`));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/[+/=]/g, m => ({'+':'-','/':'_','=':''}[m] || ''));
  return `${header}.${body}.${sigB64}`;
}

async function verifyJwt(token: string): Promise<unknown | null> {
  const [header, body, sig] = token.split('.');
  if (!header || !body || !sig) return null;
  const key = await crypto.subtle.importKey(
    'raw', JWT_SECRET, { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
  );
  const sigBuf = Uint8Array.from(atob(sig.replace(/[-_]/g, m => ({'-':'+','_':'/'}[m] || ''))), c => c.charCodeAt(0));
  const ok = await crypto.subtle.verify('HMAC', key, sigBuf, new TextEncoder().encode(`${header}.${body}`));
  if (!ok) return null;
  return JSON.parse(atob(body));
}

interface JwtPayload {
  sub: string;
  role: string;
  exp?: number;
}

export async function createSession(userId: string, role: string): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7; // 7 days
  return signJwt({ sub: userId, role, exp });
}

export async function getSession(token: string): Promise<{ userId: string; role: string } | null> {
  const payload = await verifyJwt(token) as JwtPayload | null;
  if (!payload || typeof payload !== 'object') return null;
  if (payload.exp && payload.exp < Date.now() / 1000) return null;
  return { userId: payload.sub, role: payload.role };
}

// DB helpers
export async function findUserByEmail(email: string) {
  const rows = await db.select().from(profiles).where(eq(profiles.email, email)).limit(1);
  return rows[0];
}

export async function createUser(email: string, password: string, name: string, role: 'admin' | 'cashier' | 'kitchen' = 'cashier') {
  const passwordHash = await hashPassword(password);
  const [user] = await db.insert(profiles).values({ email, password: passwordHash, name, role }).returning();
  return user;
}