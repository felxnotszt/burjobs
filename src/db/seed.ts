import { db } from './index';
import * as schema from './schema';
import crypto from 'crypto';
import { hashPassword } from '@/lib/auth';

async function seed() {
  // Settings
  await db.insert(schema.settings).values([
    { key: 'shop_name', value: 'BurjoKu' },
    { key: 'tax_percent', value: '0' },
    { key: 'service_percent', value: '0' },
  ]).onConflictDoNothing();

  // Admin user
  const hashedPassword = await hashPassword('admin123');
  await db.insert(schema.profiles).values({
    email: 'admin@burjoku.id',
    password: hashedPassword,
    name: 'Admin',
    role: 'admin',
  }).onConflictDoNothing();

  // Tables (10)
  const tableValues = Array.from({ length: 10 }, (_, i) => ({
    number: i + 1,
    token: crypto.randomBytes(16).toString('hex'),
    isActive: true,
  }));
  await db.insert(schema.tables).values(tableValues).onConflictDoNothing();

  // Categories
  const cats = await db.insert(schema.categories).values([
    { name: 'Bubur', sortOrder: 1 },
    { name: 'Mie', sortOrder: 2 },
    { name: 'Nasi', sortOrder: 3 },
    { name: 'Minuman', sortOrder: 4 },
    { name: 'Camilan', sortOrder: 5 },
  ]).returning();

  // Menu items (sample)
  const menuData = [
    { name: 'Bubur Ayam', price: 15000, categoryId: cats[0].id, isPopular: true },
    { name: 'Bubur Kacang Ijo', price: 12000, categoryId: cats[0].id },
    { name: 'Mie Goreng', price: 14000, categoryId: cats[1].id, isPopular: true },
    { name: 'Mie Kuah', price: 14000, categoryId: cats[1].id },
    { name: 'Nasi Goreng', price: 16000, categoryId: cats[2].id, isPopular: true },
    { name: 'Nasi Ayam Geprek', price: 18000, categoryId: cats[2].id },
    { name: 'Teh', price: 5000, categoryId: cats[3].id },
    { name: 'Jeruk', price: 7000, categoryId: cats[3].id },
    { name: 'Tempe Goreng', price: 3000, categoryId: cats[4].id },
    { name: 'Tahu Goreng', price: 3000, categoryId: cats[4].id },
  ];
  const menus = await db.insert(schema.menuItems).values(menuData).returning();

  // Menu options sample (Bubur Ayam - level pedas)
  const bubur = menus.find(m => m.name === 'Bubur Ayam')!;
  const opt = await db.insert(schema.menuOptions).values({
    menuItemId: bubur.id,
    name: 'Level Pedas',
    type: 'single',
    isRequired: false,
  }).returning();

  await db.insert(schema.menuOptionValues).values([
    { menuOptionId: opt[0].id, label: 'Tidak Pedas', extraPrice: 0 },
    { menuOptionId: opt[0].id, label: 'Sedang', extraPrice: 0 },
    { menuOptionId: opt[0].id, label: 'Pedas', extraPrice: 0 },
    { menuOptionId: opt[0].id, label: 'Pedas Banget', extraPrice: 1000 },
  ]);

  // Options for Teh
  const teh = menus.find(m => m.name === 'Teh')!;
  const tehSuhu = await db.insert(schema.menuOptions).values({
    menuItemId: teh.id,
    name: 'Suhu',
    type: 'single',
    isRequired: true,
  }).returning();
  await db.insert(schema.menuOptionValues).values([
    { menuOptionId: tehSuhu[0].id, label: 'Anget', extraPrice: 0 },
    { menuOptionId: tehSuhu[0].id, label: 'Es', extraPrice: 0 },
  ]);

  const tehGula = await db.insert(schema.menuOptions).values({
    menuItemId: teh.id,
    name: 'Tingkat Gula',
    type: 'single',
    isRequired: true,
  }).returning();
  await db.insert(schema.menuOptionValues).values([
    { menuOptionId: tehGula[0].id, label: 'Gula', extraPrice: 0 },
    { menuOptionId: tehGula[0].id, label: 'Less', extraPrice: 0 },
    { menuOptionId: tehGula[0].id, label: 'Tawar', extraPrice: 0 },
  ]);

  console.log('Seed done');
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
