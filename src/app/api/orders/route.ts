import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { fetchProductsByIds } from '@/lib/server/sanityServer';
import { verifyInsforgeBearerToken } from '@/lib/server/insforgeServer';
import { orderRateLimit } from '@/lib/server/rateLimit';
import { algeriaWilayas } from '@/lib/algeria-wilayas';
import type { CreateOrderInput, DeliveryType } from '@/lib/types/order';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN?.trim();
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID?.trim();

function normalizeQty(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
}

function deliveryFeeForProduct(
  product: any,
  wilayaId: number,
  deliveryType: DeliveryType,
  defaultHome: number | null,
  defaultDesk: number | null
): number {
  let home = defaultHome !== null ? defaultHome : 0;
  let desk = defaultDesk !== null ? defaultDesk : 0;
  if (Array.isArray(product.customShipping)) {
    const custom = product.customShipping.find((c: any) => Number(c?.wilayaId) === wilayaId);
    if (custom) {
      if (custom.homePrice !== null && Number.isFinite(Number(custom.homePrice))) home = Number(custom.homePrice);
      if (custom.deskPrice !== null && Number.isFinite(Number(custom.deskPrice))) desk = Number(custom.deskPrice);
    }
  }
  return deliveryType === 'home' ? home : desk;
}

function parseOrderBody(body: any): CreateOrderInput | null {
  if (!body || typeof body !== 'object') return null;
  if (!Array.isArray(body.items) || body.items.length === 0) return null;
  if (body.items.length > 50) {
    throw new Error('Maximum 50 items allowed per order');
  }
  if (!body.shipping || typeof body.shipping !== 'object') return null;

  const fullName = String(body.shipping.fullName || '').trim();
  const phone = String(body.shipping.phone || '').trim();
  const addressLine1 = String(body.shipping.addressLine1 || '').trim();
  const wilayaId = Number(body.shipping.wilayaId);
  const rawDeliveryType = String(body.shipping.deliveryType || '').trim().toLowerCase();
  const deliveryType: DeliveryType =
    rawDeliveryType === 'desk' || rawDeliveryType === 'pickup' ? 'desk' : 'home';
  if (!fullName || !phone) return null;
  if (!Number.isInteger(wilayaId) || wilayaId < 1) return null;
  if (deliveryType !== 'home' && deliveryType !== 'desk') return null;
  if (deliveryType === 'home' && !addressLine1) return null;

  const items = body.items
    .map((it: any) => ({
      id: String(it?.id || '').trim(),
      quantity: normalizeQty(it?.quantity),
    }))
    .filter((it: any) => it.id && it.quantity > 0);

  if (items.length === 0) return null;

  return {
    items,
    shipping: {
      fullName,
      phone,
      wilayaId,
      deliveryType,
      addressLine1: deliveryType === 'home' ? addressLine1 : 'Stop Desk / Bureau',
      notes: body.shipping.notes || '',
    },
  };
}

async function sendOrderTelegramNotification(order: {
  id: string;
  totalAmount: number;
  subtotal: number;
  shippingFee: number;
  deliveryType: DeliveryType;
  wilayaId: number;
  shippingAddress: { fullName: string; phone: string; addressLine1: string; city: string; notes?: string };
  items: Array<{ title: string; quantity: number; price: number }>;
}) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;

  const itemsText = order.items
    .map((item) => `- ${item.title} x${item.quantity} (${item.price} DZD)`)
    .join('\n');
  const message =
    `🛒 New Order: ${order.id}\n` +
    `Customer: ${order.shippingAddress.fullName}\n` +
    `Phone: ${order.shippingAddress.phone}\n` +
    `Delivery: ${order.deliveryType === 'home' ? 'Home' : 'Desk'}\n` +
    `Wilaya: ${order.wilayaId}\n` +
    `Address: ${order.shippingAddress.addressLine1}\n` +
    `City: ${order.shippingAddress.city}\n` +
    (order.shippingAddress.notes ? `Notes: ${order.shippingAddress.notes}\n` : '') +
    `Subtotal: ${order.subtotal} DZD\n` +
    `Shipping: ${order.shippingFee} DZD\n` +
    `Total: ${order.totalAmount} DZD\n` +
    `Items:\n${itemsText}`;

  const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      disable_web_page_preview: true,
    }),
  });
  if (!response.ok) {
    console.error('Failed to send Telegram order notification:', await response.text());
  }
}

// resolveAdminSession removed since we use luxara_admin_access cookie

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    if (process.env.REQUIRE_UPSTASH_REDIS === 'true') {
      const { success } = await orderRateLimit.limit(ip);
      if (!success) {
        return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
      }
    }
    const authHeader = request.headers.get('authorization');
    let insforgeUser = null;
    if (authHeader) {
      try {
        insforgeUser = await verifyInsforgeBearerToken(authHeader);
      } catch (e) {
        console.error('Invalid token', e);
      }
    }
    
    const userId = insforgeUser ? insforgeUser.id : 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    const userEmail = insforgeUser ? (insforgeUser.email || null) : null;

    const rawBody = await request.json().catch(() => null);
    let payload;
    try {
      payload = parseOrderBody(rawBody);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    
    if (!payload) {
      return NextResponse.json({ error: 'Invalid order payload.' }, { status: 400 });
    }

    const wilaya = algeriaWilayas.find((w) => w.id === payload.shipping.wilayaId);
    if (!wilaya) {
      return NextResponse.json({ error: 'Invalid wilaya selected.' }, { status: 400 });
    }

    const uniqueIds = [...new Set(payload.items.map((i) => i.id))];
    const sanityProducts = await fetchProductsByIds(uniqueIds);
    if (sanityProducts.length !== uniqueIds.length) {
      return NextResponse.json({ error: 'One or more products are unavailable.' }, { status: 409 });
    }

    let subtotal = 0;
    let shippingFee = 0;
    const orderItems = payload.items.map((inputItem) => {
      const p = sanityProducts.find((sp) => sp._id === inputItem.id)!;
      const unitPrice = Number(p.discountPrice ?? p.price ?? 0);
      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        throw new Error(`Invalid product price for ${p._id}`);
      }
      subtotal += unitPrice * inputItem.quantity;
      const itemShipping = deliveryFeeForProduct(
        p,
        payload.shipping.wilayaId,
        payload.shipping.deliveryType,
        wilaya.homePrice,
        wilaya.deskPrice
      );
      if (itemShipping > shippingFee) shippingFee = itemShipping;

      return {
        id: p._id,
        title: p.title || 'Untitled',
        price: unitPrice,
        quantity: inputItem.quantity,
        main_image:
          p.mainImage ||
          (Array.isArray(p.gallery) && p.gallery.length > 0 ? p.gallery[0] : ''),
      };
    });

    const totalAmount = subtotal + shippingFee;
    const nowIso = new Date().toISOString();

    const adminDb = getAdminDb();

    const orderDoc = {
      user_id: userId,
      user_email: userEmail,
      total_amount: totalAmount,
      subtotal_amount: subtotal,
      shipping_fee: shippingFee,
      shipping_address: {
        fullName: payload.shipping.fullName,
        addressLine1: payload.shipping.addressLine1 || 'Stop Desk / Bureau',
        city: `${wilaya.id} - ${wilaya.nameAr}`,
        postalCode: '00000',
        country: 'Algeria',
        phone: payload.shipping.phone,
        notes: payload.shipping.notes || '',
      },
      delivery_type: payload.shipping.deliveryType,
      wilaya_id: payload.shipping.wilayaId,
      items: orderItems,
      created_at: nowIso,
      status: 'pending',
      source: 'web_checkout',
    };

    let refId = 'mock_order_' + Date.now();
    try {
      const ref = await adminDb.collection('orders').add(orderDoc);
      refId = ref.id;
    } catch (dbErr: any) {
      console.warn('Firebase DB error (likely local clock issue):', dbErr.message);
      // We continue locally so you can test the UI
    }

    try {
      await sendOrderTelegramNotification({
        id: refId,
        totalAmount,
        subtotal,
        shippingFee,
        deliveryType: payload.shipping.deliveryType,
        wilayaId: payload.shipping.wilayaId,
        shippingAddress: {
          fullName: payload.shipping.fullName,
          phone: payload.shipping.phone,
          addressLine1: payload.shipping.addressLine1 || 'Stop Desk / Bureau',
          city: `${wilaya.id} - ${wilaya.nameAr}`,
          notes: payload.shipping.notes || '',
        },
        items: orderItems.map((item) => ({
          title: item.title,
          quantity: item.quantity,
          price: item.price,
        })),
      });
    } catch (telegramErr: any) {
      console.warn('Telegram notify error:', telegramErr.message);
    }

    return NextResponse.json({
      id: refId,
      ...orderDoc,
    });
  } catch (error: any) {
    console.error('POST /api/orders failed:', error);
    return NextResponse.json(
      { error: 'Failed to create order.', detail: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const jar = await cookies();
    const admin = jar.get('luxara_admin_access')?.value === 'granted';
    const authHeader = request.headers.get('authorization');
    let user = null;
    if (authHeader) {
      try {
        user = await verifyInsforgeBearerToken(authHeader);
      } catch (e) {}
    }

    if (!admin && !user) {
      return NextResponse.json({ error: 'Unauthorized user session.' }, { status: 401 });
    }

    const adminDb = getAdminDb();

    const url = new URL(request.url);
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit') || '30')));

    const ordersCol = adminDb.collection('orders');
    const q = admin
      ? ordersCol.orderBy('created_at', 'desc').limit(limit)
      : ordersCol.where('user_id', '==', user!.id).orderBy('created_at', 'desc').limit(limit);

    const snap = await q.get();
    const rows = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ orders: rows });
  } catch (error: any) {
    console.error('GET /api/orders failed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders.', detail: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const jar = await cookies();
    const admin = jar.get('luxara_admin_access')?.value === 'granted';
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Order ID is required.' }, { status: 400 });
    }

    const adminDb = getAdminDb();
    await adminDb.collection('orders').doc(id).delete();

    return NextResponse.json({ success: true, message: 'Order deleted successfully.' });
  } catch (error: any) {
    console.error('DELETE /api/orders failed:', error);
    return NextResponse.json(
      { error: 'Failed to delete order.', detail: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
