import { getInsforgeAccessToken } from '@/lib/insforge';
import type { CreateOrderInput } from '@/lib/types/order';

function authHeaders(): Record<string, string> {
  const token = getInsforgeAccessToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

async function parseResponseOrThrow(res: Response) {
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(payload?.detail || payload?.error || 'Order request failed');
  }
  return payload;
}

export const orderService = {
  async createOrder(payload: CreateOrderInput) {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
      credentials: 'same-origin',
      body: JSON.stringify(payload),
    });
    return parseResponseOrThrow(res);
  },

  async getUserOrders() {
    const res = await fetch('/api/orders', {
      method: 'GET',
      headers: {
        ...authHeaders(),
      },
      credentials: 'same-origin',
      cache: 'no-store',
    });
    const payload = await parseResponseOrThrow(res);
    return Array.isArray(payload.orders) ? payload.orders : [];
  },

  async getAllOrders(limit: number = 100) {
    const res = await fetch(`/api/orders?limit=${limit}`, {
      method: 'GET',
      credentials: 'same-origin',
      cache: 'no-store',
    });
    const payload = await parseResponseOrThrow(res);
    return Array.isArray(payload.orders) ? payload.orders : [];
  },
};
