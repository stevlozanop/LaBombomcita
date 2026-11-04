// Tipos y constantes compartidos (sirven en servidor y navegador)

export type Settings = {
  name: string;
  whatsapp: string;
  phone: string;
  address: string;
  mapsUrl: string;
  instagram: string;
  currency: string;
  ordersOpen: boolean;
  payments: string[];
};
export type Category = { id: string; name: string };
export type Dish = {
  id: string;
  categoryId: string;
  name: string;
  desc: string;
  price: number;
  available: boolean;
};
export type Hour = { id: string; day: string; time: string };

export const ORDER_STATUSES = ["nuevo", "preparando", "en camino", "entregado", "cancelado"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type Order = {
  id: string;
  code: string;
  createdAt: string;
  items: { name: string; price: number; qty: number }[];
  total: number;
  name: string;
  phone: string;
  mode: "delivery" | "recojo";
  address: string;
  payment: string;
  notes: string;
  status: OrderStatus;
};
export type Activity = { at: string; text: string };

export type Db = {
  settings: Settings;
  categories: Category[];
  dishes: Dish[];
  hours: Hour[];
  orders: Order[];
  activity: Activity[];
  nextOrder: number;
};

