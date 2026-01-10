import React, { useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Check,
  ChefHat,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const RestaurantVendorUI = () => {
  const [cart, setCart] = useState([]);
  const [selectedToken, setSelectedToken] = useState('1');
  const [orders, setOrders] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  const menu = {
    Starters: [
      { id: 1, name: 'Paneer Tikka', price: 180 },
      { id: 2, name: 'Spring Rolls', price: 120 },
      { id: 3, name: 'Chicken Wings', price: 220 },
      { id: 4, name: 'Veg Cutlet', price: 90 },
      { id: 5, name: 'French Fries', price: 80 },
      { id: 6, name: 'Cheese Balls', price: 140 },
      { id: 7, name: 'Nachos', price: 160 },
      { id: 8, name: 'Samosa', price: 30 },
      { id: 9, name: 'Chilli Paneer', price: 190 },
      { id: 10, name: 'Manchurian', price: 150 },
    ],
    'Main Course': [
      { id: 11, name: 'Butter Chicken', price: 280 },
      { id: 12, name: 'Dal Makhani', price: 180 },
      { id: 13, name: 'Paneer Butter Masala', price: 240 },
      { id: 14, name: 'Veg Biryani', price: 210 },
      { id: 15, name: 'Chicken Biryani', price: 260 },
      { id: 16, name: 'Kadhai Paneer', price: 230 },
      { id: 17, name: 'Rajma Chawal', price: 170 },
      { id: 18, name: 'Chole Bhature', price: 160 },
      { id: 19, name: 'Aloo Paratha', price: 80 },
      { id: 20, name: 'Egg Curry', price: 150 },
      { id: 21, name: 'Chicken Curry', price: 240 },
      { id: 22, name: 'Mix Veg', price: 170 },
    ],
    Breads: [
      { id: 23, name: 'Roti', price: 20 },
      { id: 24, name: 'Butter Roti', price: 25 },
      { id: 25, name: 'Naan', price: 40 },
      { id: 26, name: 'Butter Naan', price: 50 },
      { id: 27, name: 'Garlic Naan', price: 60 },
      { id: 28, name: 'Lachha Paratha', price: 55 },
      { id: 29, name: 'Missi Roti', price: 35 },
      { id: 30, name: 'Kulcha', price: 45 },
    ],
    Beverages: [
      { id: 31, name: 'Water', price: 20 },
      { id: 32, name: 'Cold Drink', price: 50 },
      { id: 33, name: 'Lassi', price: 80 },
      { id: 34, name: 'Cold Coffee', price: 120 },
      { id: 35, name: 'Tea', price: 20 },
      { id: 36, name: 'Coffee', price: 30 },
      { id: 37, name: 'Lemon Soda', price: 60 },
      { id: 38, name: 'Buttermilk', price: 40 },
    ],
  };

  const addToCart = (item) => {
    const found = cart.find((c) => c.id === item.id);
    if (found) {
      setCart(cart.map((c) =>
        c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const decreaseItem = (item) => {
    const found = cart.find((c) => c.id === item.id);
    if (!found) return;
    if (found.quantity === 1) {
      setCart(cart.filter((c) => c.id !== item.id));
    } else {
      setCart(cart.map((c) =>
        c.id === item.id ? { ...c, quantity: c.quantity - 1 } : c
      ));
    }
  };

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const placeOrder = () => {
    if (!cart.length) return;
    setOrders([...orders, { id: Date.now(), token: selectedToken, items: cart, total }]);
    setCart([]);
    setCartOpen(false);
  };

  const completeOrder = (id) => {
    setOrders(orders.filter((o) => o.id !== id));
  };

  const availableTokens = () => {
    const used = orders.map((o) => o.token);
    return Array.from({ length: 20 }, (_, i) => `${i + 1}`).filter(
      (t) => !used.includes(t)
    );
  };

  const getQty = (id) => cart.find((c) => c.id === id)?.quantity || 0;

  return (
    <div className="min-h-screen bg-stone-50 p-6">
      <div className="max-w-[1800px] mx-auto">
        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <div>
            <h1 className="text-3xl font-serif">Culinary</h1>
            <p className="text-xs text-stone-500">Vendor Order System</p>
          </div>
          <ChefHat size={32} />
        </div>

        {Object.entries(menu).map(([category, items]) => (
          <div key={category} className="mb-8">
            <h2 className="text-lg font-serif mb-2">{category}</h2>

            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 2xl:grid-cols-9 gap-2">
              {items.map((item) => (
                <div key={item.id} className="border bg-white p-2 text-xs flex flex-col gap-1">
                  <div className="aspect-square bg-stone-100" />
                  <div className="truncate font-medium">{item.name}</div>
                  <div className="flex justify-between items-center">
                    <span>₹{item.price}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => decreaseItem(item)} className="border px-1">−</button>
                      <span>{getQty(item.id)}</span>
                      <button onClick={() => addToCart(item)} className="border px-1">+</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Active Orders */}
        {orders.length > 0 && (
          <div className="mt-10 border-t pt-4">
            <h2 className="text-lg font-serif mb-3">Active Orders</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {orders.map((o) => (
                <div key={o.id} className="border p-2 text-xs bg-white">
                  <div className="flex justify-between mb-1">
                    <span>Token {o.token}</span>
                    <Check size={14} className="cursor-pointer" onClick={() => completeOrder(o.id)} />
                  </div>
                  {o.items.map((i) => (
                    <div key={i.id} className="flex justify-between text-stone-600">
                      <span>{i.name} × {i.quantity}</span>
                      <span>₹{i.price * i.quantity}</span>
                    </div>
                  ))}
                  <div className="border-t mt-1 pt-1 flex justify-between font-medium">
                    <span>Total</span>
                    <span>₹{o.total}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      <div
        onClick={() => setCartOpen(true)}
        className="fixed bottom-6 right-6 bg-black text-white px-4 py-2 rounded-full flex gap-2 cursor-pointer"
      >
        <ShoppingCart size={16} /> {cart.length}
      </div>

      {/* Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-end z-50">
          <div className="bg-white w-full sm:w-[400px] h-full p-4 flex flex-col">
            <div className="flex justify-between mb-3">
              <h2 className="font-serif">Current Order</h2>
              <X onClick={() => setCartOpen(false)} className="cursor-pointer" />
            </div>

            <div className="flex-1 overflow-y-auto text-sm space-y-2">
              {cart.map((item) => (
                <div key={item.id} className="border p-2">
                  <div className="flex justify-between">
                    {item.name}
                    <Trash2 size={14} className="cursor-pointer" onClick={() => decreaseItem(item)} />
                  </div>
                  Qty: {item.quantity} — ₹{item.price * item.quantity}
                </div>
              ))}
            </div>

            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between">
                <span>Total</span>
                <span>₹{total}</span>
              </div>

              <Select value={selectedToken} onValueChange={setSelectedToken}>
                <SelectTrigger><SelectValue placeholder="Token" /></SelectTrigger>
                <SelectContent>
                  {availableTokens().map((t) => (
                    <SelectItem key={t} value={t}>Token {t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button onClick={placeOrder}>Place Order</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantVendorUI;
