// No backend order endpoints exist yet, so orders are typed here, not in types/api.ts.
export interface OrderItem {
  id: string;
  title: string;
  image: string;
  category: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  placedAt: string;
  items: OrderItem[];
  shipping: {
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  payment: {
    cardName: string;
    cardLast4: string;
    expiry: string;
  };
  summary: {
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
  };
}

const getOrderKey = (userId: string) => `shopcart_orders_${userId}`;

export const loadOrders = (userId: string | undefined): Order[] => {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(getOrderKey(userId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveOrder = (userId: string | undefined, order: Order): void => {
  if (!userId || !order) return;
  try {
    const currentOrders = loadOrders(userId);
    const nextOrders = [order, ...currentOrders];
    localStorage.setItem(getOrderKey(userId), JSON.stringify(nextOrders));
  } catch {
    return;
  }
};
