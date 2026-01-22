import React, { useEffect, useState } from "react";

import CheckoutModal from "./CheckoutModal";
import SalesReport from "./SalesReport";
import POSView from "./POSView";
import AdminProductModal from "./AdminProductModal";

export default function RestaurantVendorUI({ user, onLogout }) {
  const API = "http://localhost:3000/products";

  // --- MENU STATE ---
  const [menuItems, setMenuItems] = useState([]);

  // --- ADMIN STATE ---
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // --- DATA STATE ---
  const [orders, setOrders] = useState([]);
  const [history, setHistory] = useState([]);
  const [nextIdCounter, setNextIdCounter] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- UI STATE ---
  const [currentView, setCurrentView] = useState("POS");

  // --- CART STATE ---
  const [cart, setCart] = useState([]);
  const [selectedToken, setSelectedToken] = useState("");
  const [discount, setDiscount] = useState(0);

  const taxRate = 5;
  const isAdmin = user?.role === "admin";

  // ============================
  // FETCH PRODUCTS
  // ============================
  async function fetchProducts() {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      console.warn("No auth_token found");
      return;
    }

    try {
      const res = await fetch(API, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Fetch failed:", data);
        return;
      }

      setMenuItems(
        data.products.map((p) => ({
          ...p,
          price: Number(p.price),
        }))
      );
    } catch (err) {
      console.error("Fetch error:", err.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  // ============================
  // ADMIN ACTIONS
  // ============================
  async function handleSaveProduct(product) {
    const token = localStorage.getItem("auth_token");

    const method = editingProduct ? "PUT" : "POST";
    const url = editingProduct ? `${API}/${editingProduct.id}` : API;

    await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(product),
    });

    setShowAdminModal(false);
    setEditingProduct(null);
    fetchProducts();
  }

  async function handleDelete(id) {
    const token = localStorage.getItem("auth_token");

    await fetch(`${API}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    fetchProducts();
  }

  // ============================
  // POS LOGIC
  // ============================
  const availableTokens = orders.map((o) => o.token);
  const freeTokens = Array.from({ length: 20 }, (_, i) => `${i + 1}`).filter(
    (t) => !availableTokens.includes(t)
  );

  useEffect(() => {
    if ((!selectedToken || !freeTokens.includes(selectedToken)) && freeTokens.length > 0) {
      setSelectedToken(freeTokens[0]);
    }
  }, [freeTokens, selectedToken]);

  const cartSubtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const taxAmount = Math.round((cartSubtotal * taxRate) / 100);
  const maxDiscount = cartSubtotal + taxAmount;
  const grandTotal = Math.max(0, maxDiscount - discount);

  const handleAddToCart = (item) => {
    setCart((p) => {
      const f = p.find((c) => c.id === item.id);
      return f
        ? p.map((c) => (c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c))
        : [...p, { ...item, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (item) => {
    setCart((p) => {
      const f = p.find((c) => c.id === item.id);
      if (!f) return p;
      return f.quantity === 1
        ? p.filter((c) => c.id !== item.id)
        : p.map((c) => (c.id === item.id ? { ...c, quantity: c.quantity - 1 } : c));
    });
  };

  // ============================
  // UI
  // ============================
  if (isLoading) return <div className="p-10">Loading products...</div>;

  if (currentView === "REPORT") {
    return (
      <SalesReport
        orders={orders}
        history={history}
        onBack={() => setCurrentView("POS")}
      />
    );
  }

  return (
    <div className="h-screen bg-stone-50">
      <POSView
        menuItems={menuItems}
        categories={[...new Set(menuItems.map((i) => i.category))]}
        orders={orders}
        cart={cart}
        selectedToken={selectedToken}
        availableTokens={freeTokens}
        discount={discount}
        grandTotal={grandTotal}
        cartSubtotal={cartSubtotal}
        taxAmount={taxAmount}
        maxDiscount={maxDiscount}
        userRole={user?.role}
        userName={user?.email}
        onAddToCart={handleAddToCart}
        onRemoveFromCart={handleRemoveFromCart}
        onCheckout={() => {}}
        onLogout={onLogout}
        isAdmin={isAdmin}
        onAddNew={() => setShowAdminModal(true)}
        onEdit={(product) => {
          setEditingProduct(product);
          setShowAdminModal(true);
        }}
        onDelete={handleDelete}
      />

      <AdminProductModal
        open={showAdminModal}
        onClose={() => {
          setShowAdminModal(false);
          setEditingProduct(null);
        }}
        initialData={editingProduct}
        onSave={handleSaveProduct}
      />
    </div>
  );
}
