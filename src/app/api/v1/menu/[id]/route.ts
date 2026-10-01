import { db } from '@/db';
import { menuItems, menuOptions, menuOptionValues } from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await db.select().from(menuItems).where(eq(menuItems.id, id)).limit(1);
  if (!item.length) return Response.json({ success: false, message: 'Menu tidak ditemukan' }, { status: 404 });

  const options = await db.select().from(menuOptions).where(eq(menuOptions.menuItemId, id));
  const optionIds = options.map(o => o.id);
  const optionValues = optionIds.length > 0
    ? await db.select().from(menuOptionValues).where(inArray(menuOptionValues.menuOptionId, optionIds))
    : [];

  return Response.json({
    success: true,
    data: {
      ...item[0],
      options: options.map(o => ({
        ...o,
        values: optionValues.filter(v => v.menuOptionId === o.id),
      })),
    },
  });
}
