export type DiningType = 'dine_in' | 'take_away' | 'delivery';

export type OrderStatus =
  | 'draft'
  | 'sent_to_kitchen'
  | 'cooking'
  | 'ready'
  | 'served'
  | 'paid'
  | 'cancelled';

export type PaymentMethod = 'cash' | 'qris' | 'card' | 'voucher' | 'other';

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: 'drinks' | 'coffee' | 'chicken_snacks' | 'cake_dessert' | 'meals';
  price: number;
  image: string;
  stock: number;
  barcode?: string;
  description?: string;
  isAvailable: boolean;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  qty: number;
  image: string;
  notes?: string;
  sku?: string;
}

export interface TableItem {
  id: string;
  number: string;
  name: string;
  capacity: number;
  section: 'indoor' | 'outdoor' | 'vip' | 'bar';
  status: 'available' | 'occupied' | 'reserved';
  currentOrderId?: string;
  currentTotal?: number;
  occupiedSince?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  loyaltyPoints: number;
  tier: 'Regular' | 'Silver' | 'Gold' | 'VIP';
}

export interface Staff {
  id: string;
  name: string;
  role: 'Kasir' | 'Supervisor' | 'Barista' | 'Pelayan' | 'Manager';
  avatar?: string;
}

export interface KitchenTicketItem {
  name: string;
  qty: number;
  notes?: string;
  done?: boolean;
}

export interface KitchenTicket {
  id: string;
  orderId: string;
  orderNumber: string;
  tableNumber: string;
  diningType: DiningType;
  items: KitchenTicketItem[];
  status: 'pending' | 'cooking' | 'ready' | 'completed';
  createdAt: string;
  servedBy: string;
  orderNotes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  tableNumber?: string;
  diningType: DiningType;
  pax: number;
  customer: Customer;
  servedBy: Staff;
  items: CartItem[];
  subtotal: number;
  discountPercent: number;
  discountNominal: number;
  deliveryCost: number;
  taxPercent: number; // e.g. 10% PPN
  taxAmount: number;
  total: number;
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
  amountPaid?: number;
  change?: number;
  notes?: string;
}
