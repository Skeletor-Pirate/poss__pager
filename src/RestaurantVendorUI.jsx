import React, { useState } from "react";
import { Plus, Minus, ShoppingCart, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const MENU = [
  {
    id: 1,
    name: "Paneer Butter Masala with Garlic Naan",
    price: 220,
    img: "https://images.unsplash.com/photo-1601050690597-df0568f70950",
  },
  {
    id: 2,
    name: "Chicken Biryani Dum Style",
    price: 260,
    img: "https://images.unsplash.com/photo-1600628422019-37c6b8a03e7f",
  },
  {
    id: 3,
    name: "Veg Hakka Noodles Extra Spicy",
    price: 180,
    img: "https://images.unsplash.com/photo-1605478373056-58c3aee7c8a0",
  },
  {
    id: 4,
    name: "Masala Dosa with Coconut Chutney",
    price: 140,
    img: "https://images.unsplash.com/photo-1600628422019-37c6b8a03e7f",
  },
];

export default function RestaurantVendorUI() {
  const [cart, setCart] = useState({});
  const [open, setOpen] = useState(false);

  const addItem = (item) => {
    setCart((p) => ({ ...p, [item.id]: (p[item.id] || 0) + 1 }));
  };

  const removeItem = (item) => {
    setCart((p) => {
      if (!p[item.id]) return p;
      const u = { ...p };
      u[item.id]--;
      if (!u[item.id]) delete u[item.id];
      return u;
    });
  };

  const qty = (id) => cart[id] || 0;
  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-[#f4f6fb] p-6 font-sans">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Culinary</h1>
        <p className="text-sm text-gray-500">Vendor Order System</p>
      </div>

      {/* Menu Cards */}
      <div className="grid gap-3">
        {MENU.map((item) => (
          <div
            key={item.id}
            className="
              bg-white
              rounded-xl
              border
              border-gray-200
              px-3 py-2
              flex items-center gap-3
              hover:shadow-sm
              transition
            "
          >
            {/* Thumbnail Image */}
            <img
              src={item.img}
              alt={item.name}
              className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
            />

            {/* RIGHT CONTENT */}
            <div className="flex flex-col flex-1 items-end gap-1">
              <div className="text-sm font-medium text-gray-900 text-right leading-snug">
                {item.name}
              </div>

              <span className="text-sm font-semibold text-gray-900">
                ₹{item.price}
              </span>

              <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 gap-3">
                <button onClick={() => removeItem(item)}>
                  <Minus size={14} />
                </button>

                <span className="text-xs w-4 text-center">{qty(item.id)}</span>

                <button onClick={() => addItem(item)}>
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Cart */}
      {totalItems > 0 && (
        <button
          onClick={() => setOpen(true)}
          className="
            fixed bottom-6 right-6
            bg-gray-900 text-white
            px-5 py-3
            rounded-full
            shadow-lg
            flex items-center gap-2
          "
        >
          <ShoppingCart size={18} />
          {totalItems}
        </button>
      )}

      {/* Cart Drawer */}
      {open && (
        <div className="fixed inset-0 bg-black/30 flex justify-end">
          <div className="bg-white w-full sm:w-[380px] h-full p-5 flex flex-col">
            <div className="flex justify-between mb-4">
              <h2 className="font-semibold text-lg">Cart</h2>
              <button onClick={() => setOpen(false)}>
                <X />
              </button>
            </div>

            <div className="flex-1 space-y-3 text-sm">
              {MENU.filter((i) => cart[i.id]).map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.name}</span>
                  <span>
                    {cart[item.id]} × ₹{item.price}
                  </span>
                </div>
              ))}
            </div>

            <Button className="mt-4 w-full">Place Order</Button>
          </div>
        </div>
      )}
    </div>
  );
}
    ],
    'Main Course': [
      { id: 10, name: 'Butter Chicken', price: 280 },
      { id: 11, name: 'Dal Makhani', price: 180 },
      { id: 12, name: 'Paneer Butter Masala', price: 240 },
      { id: 13, name: 'Veg Biryani', price: 210 },
      { id: 14, name: 'Chicken Biryani', price: 260 },
      { id: 15, name: 'Rajma Chawal', price: 170 },
      { id: 16, name: 'Chole Bhature', price: 160 },
      { id: 17, name: 'Egg Curry', price: 150 },
    ],
    Beverages: [
      { id: 18, name: 'Cold Coffee', price: 120 },
      { id: 19, name: 'Lassi', price: 80 },
      { id: 20, name: 'Lemon Soda', price: 60 },
      { id: 21, name: 'Water', price: 20 },
      { id: 22, name: 'Tea', price: 20 },
      { id: 23, name: 'Coffee', price: 30 },
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
    <div className="min-h-screen bg-[#f8f9fb] p-6">
      <div className="max-w-[1400px] mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">
              Culinary
            </h1>
            <p className="text-sm text-gray-500">
              Vendor Order System
            </p>
          </div>
          <ChefHat size={32} className="text-gray-700" />
        </div>

        {/* Menu */}
        {Object.entries(menu).map(([category, items]) => (
          <div key={category} className="mb-10">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {category}
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="
                    bg-white
                    rounded-2xl
                    px-4 py-3
                    flex items-center gap-4
                    shadow-md
                    hover:shadow-lg
                    transition
                  "
                >
                  <div className="w-16 h-16 bg-gray-200 rounded-xl flex-shrink-0" />

                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 leading-snug">
                      {item.name}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className="text-sm font-semibold text-gray-900">
                      ₹{item.price}
                    </span>

                    <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 gap-3">
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
          <div className="mt-12">
            <h2 className="text-lg font-semibold mb-4">Active Orders</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {orders.map((o) => (
                <div key={o.id} className="bg-white rounded-xl shadow p-4 text-sm">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Token {o.token}</span>
                    <Check
                      size={16}
                      className="cursor-pointer"
                      onClick={() => completeOrder(o.id)}
                    />
                  </div>

                  {o.items.map((i) => (
                    <div key={i.id} className="flex justify-between text-gray-600 text-xs">
                      <span>{i.name} × {i.quantity}</span>
                      <span>₹{i.price * i.quantity}</span>
                    </div>
                  ))}

                  <div className="border-t mt-3 pt-2 flex justify-between font-medium text-sm">
                    <span>Total</span>
                    <span>₹{o.total}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Cart */}
      <div
        onClick={() => setCartOpen(true)}
        className="
          fixed bottom-6 right-6
          bg-gray-900 text-white
          px-5 py-3
          rounded-full
          shadow-lg
          flex gap-2
          cursor-pointer
        "
      >
        <ShoppingCart size={16} /> {cart.length}
      </div>

      {/* Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-end z-50">
          <div className="bg-white w-full sm:w-[400px] h-full p-5 flex flex-col shadow-xl">
            <div className="flex justify-between mb-4">
              <h2 className="font-semibold text-lg">Current Order</h2>
              <X onClick={() => setCartOpen(false)} className="cursor-pointer" />
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 text-sm">
              {cart.map((item) => (
                <div key={item.id} className="border rounded-lg p-3">
                  <div className="flex justify-between mb-1">
                    {item.name}
                    <Trash2
                      size={14}
                      className="cursor-pointer"
                      onClick={() => decreaseItem(item)}
                    />
                  </div>
                  Qty: {item.quantity} — ₹{item.price * item.quantity}
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between font-medium">
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

              <Button onClick={placeOrder} className="w-full">
                Place Order
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantVendorUI;
    ],
    'Main Course': [
      { id: 10, name: 'Butter Chicken', price: 280 },
      { id: 11, name: 'Dal Makhani', price: 180 },
      { id: 12, name: 'Paneer Butter Masala', price: 240 },
      { id: 13, name: 'Veg Biryani', price: 210 },
      { id: 14, name: 'Chicken Biryani', price: 260 },
      { id: 15, name: 'Rajma Chawal', price: 170 },
      { id: 16, name: 'Chole Bhature', price: 160 },
      { id: 17, name: 'Egg Curry', price: 150 },
    ],
    Beverages: [
      { id: 18, name: 'Cold Coffee', price: 120 },
      { id: 19, name: 'Lassi', price: 80 },
      { id: 20, name: 'Lemon Soda', price: 60 },
      { id: 21, name: 'Water', price: 20 },
      { id: 22, name: 'Tea', price: 20 },
      { id: 23, name: 'Coffee', price: 30 },
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
      <div className="max-w-[1400px] mx-auto">
        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <div>
            <h1 className="text-3xl font-serif">Culinary</h1>
            <p className="text-xs text-stone-500">Vendor Order System</p>
          </div>
          <ChefHat size={32} />
        </div>

        {Object.entries(menu).map(([category, items]) => (
          <div key={category} className="mb-8">
            <h2 className="text-lg font-serif mb-3">{category}</h2>

            {/* 6-column grid preserved */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border rounded-xl px-3 py-2 flex items-center gap-3 shadow-sm"
                >
                  <div className="w-14 h-14 bg-stone-100 rounded-lg flex-shrink-0" />

                  <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium leading-snug min-w-0">
                    {item.name}
                  </div>


                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm font-semibold">₹{item.price}</span>

                    <div className="flex items-center border rounded-full px-2 py-0.5 gap-2">
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

        {/* Active Orders restored */}
        {orders.length > 0 && (
          <div className="mt-10 border-t pt-4">
            <h2 className="text-lg font-serif mb-3">Active Orders</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {orders.map((o) => (
                <div key={o.id} className="border p-3 bg-white text-sm rounded-lg">
                  <div className="flex justify-between mb-1">
                    <span>Token {o.token}</span>
                    <Check
                      size={16}
                      className="cursor-pointer"
                      onClick={() => completeOrder(o.id)}
                    />
                  </div>

                  {o.items.map((i) => (
                    <div key={i.id} className="flex justify-between text-xs text-stone-600">
                      <span>{i.name} × {i.quantity}</span>
                      <span>₹{i.price * i.quantity}</span>
                    </div>
                  ))}

                  <div className="border-t mt-2 pt-1 flex justify-between font-medium text-xs">
                    <span>Total</span>
                    <span>₹{o.total}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Cart Button restored */}
      <div
        onClick={() => setCartOpen(true)}
        className="fixed bottom-6 right-6 bg-black text-white px-4 py-2 rounded-full flex gap-2 cursor-pointer"
      >
        <ShoppingCart size={16} /> {cart.length}
      </div>

      {/* Drawer restored */}
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
                  <div className="flex justify-between">
                    {item.name}
                    <Trash2
                      size={14}
                      className="cursor-pointer"
                      onClick={() => decreaseItem(item)}
                    />
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
};

export default RestaurantVendorUI;


