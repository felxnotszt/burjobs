import { NextRequest } from 'next/server';
import { db } from '@/db';
import { menuItems, categories } from '@/db/schema';
import { eq, and, like, sql } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get('category_id');
  const q = searchParams.get('q');

  const conditions = [eq(menuItems.isAvailable, true)];
  if (categoryId) conditions.push(eq(menuItems.categoryId, categoryId));
  if (q) conditions.push(like(menuItems.name, `%${q}%`));

  const items = await db
    .select({
      id: menuItems.id,
      name: menuItems.name,
      description: menuItems.description,
      price: menuItems.price,
      imagePath: menuItems.imagePath,
      isPopular: menuItems.isPopular,
      categoryId: menuItems.categoryId,
      categoryName: categories.name,
    })
    .from(menuItems)
    .innerJoin(categories, eq(menuItems.categoryId, categories.id))
    .where(and(...conditions))
    .orderBy(menuItems.sortOrder);

  return Response.json({ success: true, data: items });
}
