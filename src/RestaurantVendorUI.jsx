import React, { useState } from "react";
import {
  Plus,
  Minus,
  ShoppingCart,
  X,
  Trash2,
  Check,
  ChefHat,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const menu = {
  Starters: [
    { id: 1, name: "Paneer Tikka", price: 180 },
    { id: 2, name: "Spring Rolls", price: 120 },
    { id: 3, name: "Chicken Wings", price: 220 },
  ],
  "Main Course": [
    { id: 10, name: "Butter Chicken", price: 280 },
    { id: 11, name: "Dal Makhani", price: 180 },
    { id: 12, name: "Paneer Butter Masala", price: 240 },
    { id: 13, name: "Veg Biryani", price: 210 },
    { id: 14, name: "Chicken Biryani", price: 260 },
    { id: 15, name: "Rajma Chawal", price: 170 },
    { id: 16, name: "Chole Bhature", price: 160 },
    { id: 17, name: "Egg Curry", price: 150 },
  ],
  Beverages: [
    { id: 18, name: "Cold Coffee", price: 120 },
    { id: 19, name: "Lassi", price: 80 },
    { id: 20, name: "Lemon Soda", price: 60 },
    { id: 21, name: "Water", price: 20 },
    { id: 22, name: "Tea", price: 20 },
    { id: 23, name: "Coffee", price: 30 },
  ],
};

export default function RestaurantVendorUI() {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [selectedToken, setSelectedToken] = useState("1");

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

  const getQty = (id) => cart.find((c) => c.id === id)?.quantity || 0;

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const placeOrder = () => {
    if (!cart.length) return;
    setOrders([...orders, { id: Date.now(), token: selectedToken, items: cart, total }]);
    setCart([]);
    setCartOpen(false);
  };

  const availableTokens = () => {
    const used = orders.map((o) => o.token);
    return Array.from({ length: 20 }, (_, i) => `${i + 1}`).filter(
      (t) => !used.includes(t)
    );
  };

  return (
    <div className="min-h-screen bg-stone-50 p-6">
      <div className="max-w-[1400px] mx-auto">

        {/* Header */}
        <div className="flex justify-between mb-6">
          <div>
            <h1 className="text-3xl font-serif">Culinary</h1>
            <p className="text-xs text-stone-500">Vendor Order System</p>
          </div>
          <ChefHat />
        </div>

        {/* Menu */}
        {Object.entries(menu).map(([category, items]) => (
          <div key={category} className="mb-8">
            <h2 className="font-serif mb-3">{category}</h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {items.map((item) => (
                <div key={item.id} className="bg-white border rounded-xl p-3 flex gap-3">
                  <div className="w-12 h-12 bg-stone-100 rounded" />

                  <div className="flex-1 text-sm">{item.name}</div>

                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm font-medium">₹{item.price}</span>

                    <div className="flex items-center border rounded-full px-2 gap-2">
                      <button onClick={() => decreaseItem(item)}>
                        <Minus size={12} />
                      </button>
                      <span className="text-xs w-3 text-center">
                        {getQty(item.id)}
                      </span>
                      <button onClick={() => addToCart(item)}>
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Active Orders */}
        {orders.length > 0 && (
          <div className="mt-8 border-t pt-4">
            <h2 className="font-serif mb-3">Active Orders</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {orders.map((o) => (
                <div key={o.id} className="border p-3 bg-white rounded text-sm">
                  <div className="flex justify-between mb-1">
                    <span>Token {o.token}</span>
                    <Check size={16} />
                  </div>
                  {o.items.map((i) => (
                    <div key={i.id} className="flex justify-between text-xs">
                      <span>{i.name} × {i.quantity}</span>
                      <span>₹{i.price * i.quantity}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating cart */}
      {cart.length > 0 && (
        <div
          onClick={() => setCartOpen(true)}
          className="fixed bottom-6 right-6 bg-black text-white px-4 py-2 rounded-full flex gap-2 cursor-pointer"
        >
          <ShoppingCart size={16} /> {cart.length}
        </div>
      )}

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
                <div key={item.id} className="border p-2 rounded">
                  {item.name} × {item.quantity} — ₹{item.price * item.quantity}
                </div>
              ))}
            </div>

            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between">
                <span>Total</span>
                <span>₹{total}</span>
              </div>

              <Select value={selectedToken} onValueChange={setSelectedToken}>
                <SelectTrigger>
                  <SelectValue placeholder="Token" />
                </SelectTrigger>
                <SelectContent>
                  {availableTokens().map((t) => (
                    <SelectItem key={t} value={t}>
                      Token {t}
                    </SelectItem>
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
}
