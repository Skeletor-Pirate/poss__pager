import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  LogOut,
  Sun,
  Moon,
  Bell,
  Usb,
  ShoppingCart,
  Plus,
  Minus,
  X,
  User
} from "lucide-react";

import POSView from "./POSView";
import CheckoutModal from "./CheckoutModal";
import ActiveOrdersDrawer from "./ActiveOrdersDrawer";

export default function RestaurantVendorUI({
  user,
  onLogout,
  isDarkMode,
  onToggleTheme
}) {
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("auth_token");

  /* ================= USER CONTEXT ================= */
  const resolvedUser = user?.user || user;
  const userRole = resolvedUser?.role || "cashier";
  const username = resolvedUser?.username || "User";
  const restaurantId = resolvedUser?.restaurantId;

  /* ================= STATE ================= */
  const [rawProducts, setRawProducts] = useState([]);
  const [menu, setMenu] = useState({});
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);

  const [showCheckout, setShowCheckout] = useState(false);
  const [showKitchen, setShowKitchen] = useState(false);

  /* ===== TOKEN SYSTEM ===== */
  const [selectedToken, setSelectedToken] = useState("1");

  const availableTokens = useMemo(() => {
    const used = orders.map(o => String(o.token));
    return Array.from({ length: 50 }, (_, i) => String(i + 1)).filter(
      t => !used.includes(t)
    );
  }, [orders]);

  useEffect(() => {
    if (!availableTokens.includes(selectedToken)) {
      setSelectedToken(availableTokens[0] || "1");
    }
  }, [availableTokens, selectedToken]);

  /* ===== UPI ===== */
  const [upiData, setUpiData] = useState(null);

  /* ===== ESP ===== */
  const [dockConnected, setDockConnected] = useState(false);
  const writerRef = useRef(null);

  const connectDock = async () => {
    if (!("serial" in navigator)) {
      alert("Web Serial API not supported");
      return;
    }
    const port = await navigator.serial.requestPort();
    await port.open({ baudRate: 115200 });
    writerRef.current = port.writable.getWriter();
    setDockConnected(true);
  };

  const sendTokenToESP = async tokenNum => {
    if (!writerRef.current) return;
    await writerRef.current.write(
      new TextEncoder().encode(`TOKEN:${tokenNum}\n`)
    );
  };

  /* ================= PRODUCTS ================= */
  const fetchProducts = async () => {
    const res = await fetch(`${API_URL}/products`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const list = await res.json();

    const normalized = list.map(p => ({
      ...p,
      id: Number(p.id),
      price: Number(p.price),
      stock: Number(p.stock)
    }));

    setRawProducts(normalized);

    const grouped = {};
    const cats = new Set();

    normalized.forEach(p => {
      const cat = p.category || "General";
      cats.add(cat);
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(p);
    });

    setMenu(grouped);
    setCategories([...cats]);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /* ================= CART ================= */
  const addToCart = product => {
    setCart(prev => {
      const found = prev.find(p => p.id === product.id);
      return found
        ? prev.map(p =>
            p.id === product.id
              ? { ...p, quantity: p.quantity + 1 }
              : p
          )
        : [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) =>
    setCart(prev =>
      prev
        .map(p =>
          p.id === id ? { ...p, quantity: p.quantity + delta } : p
        )
        .filter(p => p.quantity > 0)
    );

  const removeFromCart = id =>
    setCart(prev => prev.filter(p => p.id !== id));

  const subtotal = cart.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  /* ================= ORDER ================= */
  const finalizeOrder = async paymentMethod => {
    const payload = {
      token: Number(selectedToken),
      paymentMethod,
      items: cart.map(i => ({
        productId: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity
      }))
    };

    const res = await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.message);
      return;
    }

    if (dockConnected) {
      sendTokenToESP(selectedToken);
    }

    if (paymentMethod === "upi" && data.upi?.qr) {
      setUpiData(data.upi);
      return;
    }

    setOrders(prev => [
      ...prev,
      { id: data.orderId, token: selectedToken }
    ]);

    setCart([]);
    setShowCheckout(false);
  };

  /* ================= UI ================= */
  return (
    <div className={`flex flex-col h-screen ${isDarkMode ? "bg-black text-white" : "bg-white text-black"}`}>
      
      {/* TOP BAR */}
      <header className="h-14 border-b flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <strong>POS</strong>

          <button onClick={connectDock} className="text-xs flex gap-2">
            <Usb size={14} />
            {dockConnected ? "ESP Connected" : "Connect ESP"}
          </button>

          <button onClick={() => setShowKitchen(true)} className="text-xs flex gap-2">
            <Bell size={14} /> Kitchen
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right text-xs">
            <div className="font-semibold">{username}</div>
            <div className="uppercase opacity-70">{userRole}</div>
          </div>
          <User size={18} />
          <button onClick={onToggleTheme}>
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button onClick={onLogout}>
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        {/* PRODUCTS */}
        <div className="flex-1 overflow-auto">
          <POSView
            menu={menu}
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            onAddToCart={addToCart}
            userRole={userRole}
            isDarkMode={isDarkMode}
            rawProducts={rawProducts}
          />
        </div>

        {/* CART */}
        <aside className="w-80 border-l flex flex-col">
          <div className="p-4 font-semibold flex justify-between">
            <span>Cart</span>
            <select
              value={selectedToken}
              onChange={e => setSelectedToken(e.target.value)}
              className="text-xs border rounded px-2"
            >
              {availableTokens.map(t => (
                <option key={t} value={t}>Token {t}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 p-4 space-y-3">
            {cart.map(item => (
              <div key={item.id} className="border p-2 rounded">
                <div className="flex justify-between">
                  {item.name}
                  <button onClick={() => removeFromCart(item.id)}>
                    <X size={12} />
                  </button>
                </div>
                <div className="flex justify-between mt-2">
                  <div className="flex gap-2">
                    <button onClick={() => updateQuantity(item.id, -1)}>
                      <Minus size={12} />
                    </button>
                    {item.quantity}
                    <button onClick={() => updateQuantity(item.id, 1)}>
                      <Plus size={12} />
                    </button>
                  </div>
                  ₹{item.price * item.quantity}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t">
            <div className="flex justify-between mb-2">
              <span>Total</span>
              <strong>₹{subtotal}</strong>
            </div>
            <button
              disabled={!cart.length}
              onClick={() => setShowCheckout(true)}
              className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
            >
              Checkout
            </button>
          </div>
        </aside>
      </main>

      {/* CHECKOUT */}
      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        onConfirm={finalizeOrder}
        grandTotal={subtotal}
        isDarkMode={isDarkMode}
        backendUpiData={upiData}
      />

      <ActiveOrdersDrawer
        isOpen={showKitchen}
        onClose={() => setShowKitchen(false)}
        orders={orders}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}