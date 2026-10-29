import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Product,
  CartItem,
  TableItem,
  Customer,
  Staff,
  Order,
  KitchenTicket,
  DiningType,
  PaymentMethod,
} from '../types/pos';
import {
  INITIAL_PRODUCTS,
  INITIAL_TABLES,
  STAFF_LIST,
  CUSTOMER_LIST,
  INITIAL_PHOTO_CART,
  INITIAL_ORDERS,
  INITIAL_KITCHEN_TICKETS,
} from '../data/mockData';
import { soundManager } from '../utils/audio';

export type ActiveView = 'pos_desktop' | 'pos_mobile' | 'kds' | 'tables' | 'dashboard' | 'inventory';

interface POSContextType {
  // Views
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;

  // Active Cart State
  cart: CartItem[];
  addToCart: (product: Product, notes?: string) => void;
  updateCartQty: (itemId: string, delta: number) => void;
  setCartItemQty: (itemId: string, qty: number) => void;
  removeCartItem: (itemId: string) => void;
  clearCart: () => void;

  // Active Sale Metadata
  diningType: DiningType;
  setDiningType: (type: DiningType) => void;
  pax: number;
  setPax: (pax: number) => void;
  selectedTable: TableItem | null;
  selectTable: (table: TableItem | null) => void;
  selectedCustomer: Customer;
  setSelectedCustomer: (customer: Customer) => void;
  activeStaff: Staff;
  setActiveStaff: (staff: Staff) => void;
  orderNotes: string;
  setOrderNotes: (notes: string) => void;
  discountPercent: number;
  discountNominal: number;
  setDiscount: (percent: number, nominal: number) => void;
  deliveryCost: number;
  setDeliveryCost: (cost: number) => void;

  // Calculations
  subtotal: number;
  taxAmount: number;
  serviceCharge: number;
  grandTotal: number;

  // Products
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  updateProduct: (product: Product) => void;

  // Tables
  tables: TableItem[];
  updateTableStatus: (tableId: string, status: TableItem['status'], currentOrderId?: string, currentTotal?: number) => void;

  // Orders & Realtime
  orders: Order[];
  kitchenTickets: KitchenTicket[];
  sendToKitchen: () => void;
  updateKitchenTicketStatus: (ticketId: string, status: KitchenTicket['status']) => void;
  toggleKitchenItemDone: (ticketId: string, itemIdx: number) => void;
  completeSale: (method: PaymentMethod, amountPaid: number, notes?: string) => Order;
  cancelActiveOrder: () => void;
  loadOrderToCart: (order: Order) => void;

  // Modals & Triggers
  activeModal: 'none' | 'checkout' | 'receipt' | 'discount' | 'delivery' | 'notes' | 'staff' | 'customer' | 'tables' | 'orders';
  setActiveModal: (modal: 'none' | 'checkout' | 'receipt' | 'discount' | 'delivery' | 'notes' | 'staff' | 'customer' | 'tables' | 'orders') => void;
  lastCompletedOrder: Order | null;
  setLastCompletedOrder: (order: Order | null) => void;

  // System
  isRealtimeConnected: boolean;
  activeShiftStartTime: string;
  resetAllData: () => void;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

const LOCAL_STORAGE_PREFIX = 'kedaipos_v1_';

export const POSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<ActiveView>('pos_desktop');
  const [isRealtimeConnected, setIsRealtimeConnected] = useState<boolean>(true);
  const [activeShiftStartTime] = useState<string>(() => new Date().toISOString());

  // Products
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}products`);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  // Tables
  const [tables, setTables] = useState<TableItem[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}tables`);
    return saved ? JSON.parse(saved) : INITIAL_TABLES;
  });

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}cart`);
    return saved ? JSON.parse(saved) : INITIAL_PHOTO_CART;
  });

  // Sale metadata
  const [diningType, setDiningType] = useState<DiningType>('dine_in');
  const [pax, setPax] = useState<number>(1);
  const [selectedTable, setSelectedTable] = useState<TableItem | null>(() => INITIAL_TABLES[3]); // Table 04
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>(CUSTOMER_LIST[0]);
  const [activeStaff, setActiveStaff] = useState<Staff>(STAFF_LIST[0]);
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [discountNominal, setDiscountNominal] = useState<number>(0);
  const [deliveryCost, setDeliveryCostState] = useState<number>(0);

  // Orders history
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}orders`);
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  // Kitchen tickets
  const [kitchenTickets, setKitchenTickets] = useState<KitchenTicket[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}tickets`);
    return saved ? JSON.parse(saved) : INITIAL_KITCHEN_TICKETS;
  });

  // Modals
  const [activeModal, setActiveModal] = useState<POSContextType['activeModal']>('none');
  const [lastCompletedOrder, setLastCompletedOrder] = useState<Order | null>(null);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}products`, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}tables`, JSON.stringify(tables));
  }, [tables]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}cart`, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}orders`, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}tickets`, JSON.stringify(kitchenTickets));
  }, [kitchenTickets]);

  // Real-time multi-tab synchronization via BroadcastChannel
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('kedaipos_realtime_events');
      channel.onmessage = (event) => {
        const { type, payload } = event.data || {};
        if (type === 'NEW_KITCHEN_TICKET') {
          setKitchenTickets((prev) => [payload, ...prev]);
          soundManager.playKitchenDing();
        } else if (type === 'UPDATE_TICKET_STATUS') {
          setKitchenTickets((prev) =>
            prev.map((t) => (t.id === payload.id ? { ...t, status: payload.status } : t))
          );
        } else if (type === 'SALE_COMPLETED') {
          setOrders((prev) => [payload, ...prev]);
        } else if (type === 'UPDATE_TABLES') {
          setTables(payload);
        }
      };
    } catch {
      // BroadcastChannel might not be supported in older contexts
    }

    return () => {
      channel?.close();
    };
  }, []);

  const broadcastEvent = useCallback((type: string, payload: unknown) => {
    try {
      const channel = new BroadcastChannel('kedaipos_realtime_events');
      channel.postMessage({ type, payload });
      channel.close();
    } catch {}
  }, []);

  // Cart operations
  const addToCart = useCallback((product: Product, notes?: string) => {
    soundManager.playBeep();
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id && item.notes === notes);
      if (existing) {
        return prev.map((item) =>
          item.id === existing.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      const newItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        productId: product.id,
        name: product.name,
        price: product.price,
        qty: 1,
        image: product.image,
        notes: notes || undefined,
        sku: product.sku,
      };
      return [...prev, newItem];
    });
  }, []);

  const updateCartQty = useCallback((itemId: string, delta: number) => {
    soundManager.playClick();
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.id === itemId) {
            const nextQty = item.qty + delta;
            return nextQty > 0 ? { ...item, qty: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  }, []);

  const setCartItemQty = useCallback((itemId: string, qty: number) => {
    soundManager.playClick();
    setCart((prev) => {
      if (qty <= 0) return prev.filter((i) => i.id !== itemId);
      return prev.map((i) => (i.id === itemId ? { ...i, qty } : i));
    });
  }, []);

  const removeCartItem = useCallback((itemId: string) => {
    soundManager.playWarning();
    setCart((prev) => prev.filter((i) => i.id !== itemId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setDiscountPercent(0);
    setDiscountNominal(0);
    setDeliveryCostState(0);
    setOrderNotes('');
  }, []);

  const setDiscount = useCallback((percent: number, nominal: number) => {
    setDiscountPercent(percent);
    setDiscountNominal(nominal);
  }, []);

  const setDeliveryCost = useCallback((cost: number) => {
    setDeliveryCostState(cost);
  }, []);

  // Financial Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  }, [cart]);

  // Photo calculation exact match:
  // In photo, sum of raw items is: 32,000 + 20,000 + 23,000 + 12,000 + 39,000 = 126,000
  // Display total is Rp 141,600 -> Tax 10% (12,600) + Service/Pajak resto 3,000 = 141,600!
  const { serviceCharge, taxAmount, grandTotal } = useMemo(() => {
    const discountedSubtotal = Math.max(
      0,
      subtotal - (discountPercent > 0 ? (subtotal * discountPercent) / 100 : discountNominal)
    );
    // 10% PPN
    const tax = Math.round(discountedSubtotal * 0.1);
    // Flat service fee for dine-in if items exist
    const service = diningType === 'dine_in' && cart.length > 0 ? 3000 : 0;
    const finalTotal = Math.max(0, discountedSubtotal + tax + service + deliveryCost);

    return {
      serviceCharge: service,
      taxAmount: tax,
      grandTotal: finalTotal,
    };
  }, [subtotal, discountPercent, discountNominal, diningType, cart.length, deliveryCost]);

  // Update table status
  const updateTableStatus = useCallback(
    (tableId: string, status: TableItem['status'], currentOrderId?: string, currentTotal?: number) => {
      setTables((prev) => {
        const next = prev.map((t) =>
          t.id === tableId
            ? {
                ...t,
                status,
                currentOrderId: status === 'available' ? undefined : currentOrderId ?? t.currentOrderId,
                currentTotal: status === 'available' ? undefined : currentTotal ?? t.currentTotal,
                occupiedSince: status === 'available' ? undefined : (t.occupiedSince || new Date().toISOString()),
              }
            : t
        );
        broadcastEvent('UPDATE_TABLES', next);
        return next;
      });
    },
    [broadcastEvent]
  );

  // Send to kitchen
  const sendToKitchen = useCallback(() => {
    if (cart.length === 0) return;
    soundManager.playKitchenDing();

    const orderNumber = `ORD-${1000 + orders.length + 1}`;
    const newTicket: KitchenTicket = {
      id: `tkt-${Date.now()}`,
      orderId: orderNumber,
      orderNumber,
      tableNumber: selectedTable?.number || (diningType === 'take_away' ? 'TAKEAWAY' : 'BAR'),
      diningType,
      items: cart.map((c) => ({
        name: c.name,
        qty: c.qty,
        notes: c.notes,
        done: false,
      })),
      status: 'pending',
      createdAt: new Date().toISOString(),
      servedBy: activeStaff.name,
      orderNotes: orderNotes || undefined,
    };

    setKitchenTickets((prev) => [newTicket, ...prev]);
    broadcastEvent('NEW_KITCHEN_TICKET', newTicket);

    if (selectedTable) {
      updateTableStatus(selectedTable.id, 'occupied', orderNumber, grandTotal);
    }
  }, [
    cart,
    diningType,
    selectedTable,
    activeStaff.name,
    orderNotes,
    orders.length,
    grandTotal,
    updateTableStatus,
    broadcastEvent,
  ]);

  const updateKitchenTicketStatus = useCallback(
    (ticketId: string, status: KitchenTicket['status']) => {
      soundManager.playClick();
      setKitchenTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, status } : t))
      );
      broadcastEvent('UPDATE_TICKET_STATUS', { id: ticketId, status });
    },
    [broadcastEvent]
  );

  const toggleKitchenItemDone = useCallback((ticketId: string, itemIdx: number) => {
    soundManager.playClick();
    setKitchenTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        const newItems = [...t.items];
        newItems[itemIdx] = { ...newItems[itemIdx], done: !newItems[itemIdx].done };
        return { ...t, items: newItems };
      })
    );
  }, []);

  // Complete Sale
  const completeSale = useCallback(
    (method: PaymentMethod, amountPaid: number, notes?: string): Order => {
      soundManager.playCashChime();
      const orderNumber = `ORD-${1000 + orders.length + 1}`;
      const change = Math.max(0, amountPaid - grandTotal);

      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        orderNumber,
        createdAt: new Date().toISOString(),
        tableNumber: selectedTable?.number,
        diningType,
        pax,
        customer: selectedCustomer,
        servedBy: activeStaff,
        items: [...cart],
        subtotal,
        discountPercent,
        discountNominal,
        deliveryCost,
        taxPercent: 10,
        taxAmount,
        total: grandTotal,
        status: 'paid',
        paymentMethod: method,
        amountPaid,
        change,
        notes: notes || orderNotes,
      };

      setOrders((prev) => [newOrder, ...prev]);
      setLastCompletedOrder(newOrder);
      broadcastEvent('SALE_COMPLETED', newOrder);

      // Free table if dine-in
      if (selectedTable) {
        updateTableStatus(selectedTable.id, 'available');
      }

      // Deduct product stock
      setProducts((prev) =>
        prev.map((p) => {
          const cartItem = cart.find((c) => c.productId === p.id);
          if (cartItem) {
            return { ...p, stock: Math.max(0, p.stock - cartItem.qty) };
          }
          return p;
        })
      );

      // Open receipt modal
      setActiveModal('receipt');

      // Clear current active cart
      clearCart();

      return newOrder;
    },
    [
      orders.length,
      grandTotal,
      selectedTable,
      diningType,
      pax,
      selectedCustomer,
      activeStaff,
      cart,
      subtotal,
      discountPercent,
      discountNominal,
      deliveryCost,
      taxAmount,
      orderNotes,
      updateTableStatus,
      clearCart,
      broadcastEvent,
    ]
  );

  const cancelActiveOrder = useCallback(() => {
    soundManager.playWarning();
    clearCart();
    if (selectedTable) {
      updateTableStatus(selectedTable.id, 'available');
    }
  }, [clearCart, selectedTable, updateTableStatus]);

  const loadOrderToCart = useCallback((order: Order) => {
    setCart(order.items);
    setDiningType(order.diningType);
    setPax(order.pax);
    setSelectedCustomer(order.customer);
    setActiveStaff(order.servedBy);
    setDiscountPercent(order.discountPercent);
    setDiscountNominal(order.discountNominal);
    setDeliveryCostState(order.deliveryCost);
    setOrderNotes(order.notes || '');
    if (order.tableNumber) {
      const tbl = tables.find((t) => t.number === order.tableNumber);
      if (tbl) setSelectedTable(tbl);
    }
    setActiveView('pos_desktop');
  }, [tables]);

  const updateProduct = useCallback((updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }, []);

  const resetAllData = useCallback(() => {
    localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}products`);
    localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}tables`);
    localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}cart`);
    localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}orders`);
    localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}tickets`);
    setProducts(INITIAL_PRODUCTS);
    setTables(INITIAL_TABLES);
    setCart(INITIAL_PHOTO_CART);
    setOrders(INITIAL_ORDERS);
    setKitchenTickets(INITIAL_KITCHEN_TICKETS);
    setSelectedTable(INITIAL_TABLES[3]);
    setDiningType('dine_in');
    setPax(1);
  }, []);

  const value = useMemo(
    () => ({
      activeView,
      setActiveView,
      cart,
      addToCart,
      updateCartQty,
      setCartItemQty,
      removeCartItem,
      clearCart,
      diningType,
      setDiningType,
      pax,
      setPax,
      selectedTable,
      selectTable: setSelectedTable,
      selectedCustomer,
      setSelectedCustomer,
      activeStaff,
      setActiveStaff,
      orderNotes,
      setOrderNotes,
      discountPercent,
      discountNominal,
      setDiscount,
      deliveryCost,
      setDeliveryCost,
      subtotal,
      taxAmount,
      serviceCharge,
      grandTotal,
      products,
      setProducts,
      updateProduct,
      tables,
      updateTableStatus,
      orders,
      kitchenTickets,
      sendToKitchen,
      updateKitchenTicketStatus,
      toggleKitchenItemDone,
      completeSale,
      cancelActiveOrder,
      loadOrderToCart,
      activeModal,
      setActiveModal,
      lastCompletedOrder,
      setLastCompletedOrder,
      isRealtimeConnected,
      activeShiftStartTime,
      resetAllData,
    }),
    [
      activeView,
      cart,
      addToCart,
      updateCartQty,
      setCartItemQty,
      removeCartItem,
      clearCart,
      diningType,
      pax,
      selectedTable,
      selectedCustomer,
      activeStaff,
      orderNotes,
      discountPercent,
      discountNominal,
      setDiscount,
      deliveryCost,
      setDeliveryCost,
      subtotal,
      taxAmount,
      serviceCharge,
      grandTotal,
      products,
      updateProduct,
      tables,
      updateTableStatus,
      orders,
      kitchenTickets,
      sendToKitchen,
      updateKitchenTicketStatus,
      toggleKitchenItemDone,
      completeSale,
      cancelActiveOrder,
      loadOrderToCart,
      activeModal,
      lastCompletedOrder,
      isRealtimeConnected,
      activeShiftStartTime,
      resetAllData,
    ]
  );

  return <POSContext.Provider value={value}>{children}</POSContext.Provider>;
};

export const usePOS = () => {
  const context = useContext(POSContext);
  if (!context) throw new Error('usePOS must be used within a POSProvider');
  return context;
};
