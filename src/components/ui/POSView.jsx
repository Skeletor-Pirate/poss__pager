import React, { useEffect, useState, useMemo, useRef } from 'react';
import { LogOut, LayoutDashboard, Coffee, Settings, User, Bell, Plus, Trash2 } from 'lucide-react';
import { getTheme, COMMON_STYLES, FONTS } from './theme';
import POSView from './POSView';
import CheckoutModal from './CheckoutModal';
import SalesReport from './SalesReport';
import AdminSettingsModal from './AdminSettingsModal';
import ActiveOrdersDrawer from './ActiveOrdersDrawer';

export default function RestaurantVendorUI({ user, onLogout, isDarkMode, onToggleTheme, API_URL = "http://localhost:3000" }) {

  const token = localStorage.getItem("auth_token");
  // ✅ FIX: Declared 'theme' only once now.
  const theme = getTheme(isDarkMode);

  // Helpers
  const getRestaurantId = () => user?.restaurantId || user?.user?.restaurantId || user?.restaurant_id || 1;
  const getUserRole = () => user?.role || user?.user?.role || localStorage.getItem("user_role") || 'cashier';
  const userRole = getUserRole();

  // --- STATE ---
  const [orders, setOrders] = useState([]);
  const [history, setHistory] = useState([]);
  const [rawProducts, setRawProducts] = useState([]);
  const [menu, setMenu] = useState({});
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [usersList, setUsersList] = useState([]);

  const [showActiveOrders, setShowActiveOrders] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [activeTab, setActiveTab] = useState(userRole === 'admin' ? 'dashboard' : 'menu');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [dockConnected, setDockConnected] = useState(false);

  // Admin State
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', price: '', category: '' });
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'cashier' });

  // POS Logic
  const [selectedToken, setSelectedToken] = useState("1");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [discount, setDiscount] = useState(0);
  const [taxRate] = useState(5);
  
  // Settings for QR Generation
  const [settings, setSettings] = useState({ upiId: "", payeeName: "" });
  const [activeUpiData, setActiveUpiData] = useState(null);

  const hasFetched = useRef(false);

  // --- API ---
  const refreshProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/products`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const list = await res.json();
        const productList = Array.isArray(list) ? list : [];
        setRawProducts(productList);
        const grouped = {};
        const cats = new Set();
        productList.forEach(p => {
          const cat = p.category || "General";
          if (!grouped[cat]) grouped[cat] = [];
          cats.add(cat);
          grouped[cat].push({ id: Number(p.id), name: p.name, price: Number(p.price), category: cat });
        });
        setMenu(grouped);
        setCategories(Array.from(cats));
      }
    } catch (e) { console.error(e); }
  };

  const refreshUsers = async () => {
    try {
      const userRes = await fetch(`${API_URL}/auth/users`, { headers: { Authorization: `Bearer ${token}` } });
      if (userRes.ok) setUsersList(await userRes.json());
    } catch (e) { console.error(e); }
  };

  const fetchActiveOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/orders`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const serverOrders = await res.json();
        if (Array.isArray(serverOrders)) {
          setOrders(serverOrders.map(o => ({
            ...o,
            startedAt: o.created_at || Date.now(),
            paymentMethod: 'cash',
            total: Number(o.total || 0),
            items: o.items || []
          })));
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    const load = async () => {
      await refreshProducts();
      await fetchActiveOrders();
      try {
        const sRes = await fetch(`${API_URL}/settings`, { headers: { Authorization: `Bearer ${token}` } });
        if (sRes.ok) { 
            const s = await sRes.json(); 
            setSettings({ upiId: s.upi_id, payeeName: s.payee_name }); 
        }
      } catch (e) {}
      
      if (userRole === 'admin') await refreshUsers();
    };
    load();
    const interval = setInterval(fetchActiveOrders, 3000);
    return () => clearInterval(interval);
  }, [token, API_URL, userRole]);

  // --- HANDLERS ---
  const handleAdminAddProduct = async () => {
    if (!newItem.name || !newItem.price) return alert("Name and Price required");
    await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: newItem.name, price: newItem.price, category: newItem.category || "General" })
    });
    setNewItem({ name: '', price: '', category: '' });
    setIsCreatingCategory(false);
    setIsAddingItem(false);
    refreshProducts();
  };

  const handleAdminAddUser = async () => {
    if (!newUser.username || !newUser.email || !newUser.password) return alert("Fill all fields");
    try {
      const res = await fetch(`${API_URL}/auth/staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newUser)
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || "Failed"); }
      setNewUser({ username: '', email: '', password: '', role: 'cashier' });
      refreshUsers();
      alert("Staff added!");
    } catch (e) { alert(e.message); }
  };

  const handleAdminDeleteUser = async (id) => {
    if (!confirm("Delete User?")) return;
    try {
      const res = await fetch(`${API_URL}/auth/users/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setUsersList(prev => prev.filter(u => u.id !== id));
    } catch (e) {}
  };

  const connectDock = async () => {
    try {
      if ('serial' in navigator) {
        const port = await navigator.serial.requestPort();
        await port.open({ baudRate: 9600 });
        setDockConnected(true);
        alert("Dock Connected Successfully!");
      } else { alert("Web Serial API not supported in this browser."); }
    } catch (err) { console.error(err); setDockConnected(false); }
  };

  const sendToDock = async (tokenNum) => {
    if (!dockConnected) { alert("Dock not connected. Connect via the Wifi icon."); return; }
    console.log(`Sending Token ${tokenNum} to Dock...`);
  };

  // --- CART ---
  const cartSubtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const taxAmount = (Math.max(0, cartSubtotal - discount)) * (taxRate / 100);
  const grandTotal = Math.round((Math.max(0, cartSubtotal - discount)) + taxAmount);

  const availableTokens = useMemo(() => {
    const used = orders.map(o => String(o.id));
    return Array.from({ length: 50 }, (_, i) => String(i + 1)).filter(t => !used.includes(t));
  }, [orders]);

  useEffect(() => {
    if (availableTokens.length > 0 && !availableTokens.includes(selectedToken)) setSelectedToken(availableTokens[0]);
  }, [availableTokens, selectedToken]);

  const addToCart = item => setCart(p => {
    const f = p.find(i => i.id === item.id);
    return f ? p.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i) : [...p, { ...item, quantity: 1 }];
  });
  const removeFromCart = item => setCart(p => {
    const f = p.find(i => i.id === item.id);
    if (!f) return p;
    if (f.quantity === 1) return p.filter(i => i.id !== item.id);
    return p.map(i => i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i);
  });

  // --- FINALIZATION ---
  const finalizeOrder = async (payData) => {
    const method = typeof payData === 'object' ? payData.paymentMethod : payData;
    
    // ✅ CRITICAL FIX: Including 'name' so your DB order_items table accepts the order
    const payload = {
      paymentMethod: method,
      items: cart.map(i => ({ 
        productId: i.id, 
        name: i.name, 
        price: i.price, 
        quantity: i.quantity 
      }))
    };

    try {
      const res = await fetch(`${API_URL}/orders`, { 
          method: "POST", 
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, 
          body: JSON.stringify(payload) 
      });
      
      const r = await res.json();
      
      if (!res.ok) {
          throw new Error(r.message || "Order Failed");
      }
      
      if (dockConnected) sendToDock(selectedToken);
      
      if (method === 'upi' && r.upi?.qr) {
          setActiveUpiData(r.upi); 
      } else {
        setOrders(p => [...p, { id: r.orderId, token: r.token, items: [...cart], created_at: new Date().toISOString(), total: grandTotal, status: 'pending' }]);
        setCart([]); setDiscount(0); setShowCheckout(false);
        setTimeout(fetchActiveOrders, 500);
      }
    } catch (e) { 
        alert(e.message); 
    }
  };

  const handleMarkReady = async (id) => {
    if (!id || id === 'undefined') return;
    if (!confirm("Complete Order?")) return;
    // ✅ FIX: Using correct DELETE route
    await fetch(`${API_URL}/orders/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    setOrders(p => p.filter(o => String(o.id) !== String(id)));
    fetchActiveOrders();
  };

  /* ─── RENDER ─── */
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', role: 'admin' },
    { id: 'menu',      icon: Coffee,          label: 'Menu' },
    { id: 'kitchen',   icon: Bell,            label: 'Kitchen', role: 'cashier', action: () => setShowActiveOrders(true) },
    { id: 'users',     icon: User,            label: 'Staff',   role: 'admin' },
  ];

  return (
    <div className={`flex h-screen overflow-hidden ${theme.bg.main} ${theme.text.main}`} style={{ fontFamily: FONTS.sans }}>

      {/* SIDEBAR */}
      <aside className={`w-20 lg:w-64 flex flex-col border-r ${theme.border.default} ${theme.bg.card}`}>
        <div className="flex items-center gap-3 justify-center lg:justify-start p-6">
          <div className={`p-2 rounded-xl ${theme.bg.subtle}`}><Settings size={22} /></div>
          <h1 className="hidden lg:block text-xl font-semibold">POSPro</h1>
        </div>
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            (!item.role || item.role === userRole) && (
              <button
                key={item.id}
                onClick={() => item.action ? item.action() : setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors outline-none
                  ${activeTab === item.id && !item.action ? `${theme.bg.active} ${theme.text.main}` : theme.button.ghost}`}
              >
                <item.icon size={18} />
                <span className="hidden lg:block">{item.label}</span>
                {item.id === 'kitchen' && orders.length > 0 && (
                  <span className={`hidden lg:flex ml-auto ${COMMON_STYLES.badge(isDarkMode)}`}>{orders.length}</span>
                )}
              </button>
            )
          ))}
          <button onClick={() => setSettingsOpen(true)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors outline-none ${theme.button.ghost}`}>
            <Settings size={18} /> <span className="hidden lg:block">Settings</span>
          </button>
        </nav>
        <div className={`mt-auto border-t ${theme.border.default} p-3`}>
          <button onClick={onLogout} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors outline-none ${theme.button.ghost}`}>
            <LogOut size={18} /> <span className="hidden lg:block">Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className={`flex-1 flex flex-col overflow-hidden ${theme.bg.main}`}>
        <header className={`h-16 flex items-center justify-between px-8 border-b ${theme.border.default} ${theme.bg.card}`}>
          <h2 className="text-xl font-semibold capitalize">{activeTab === 'dashboard' ? 'Overview' : activeTab === 'menu' ? 'Menu & Orders' : activeTab}</h2>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className={`text-sm font-medium ${theme.text.main}`}>{user?.username || 'Admin'}</p>
              <p className={`text-xs uppercase font-medium tracking-wider ${theme.text.tertiary}`}>{userRole}</p>
            </div>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center border ${theme.border.default} ${theme.bg.subtle}`}>
              <User size={16} className={theme.text.secondary} />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto relative">
          {activeTab === 'dashboard' && userRole === 'admin' && (
            <div className="p-8"><SalesReport orders={orders} history={history} products={rawProducts} isDarkMode={isDarkMode} /></div>
          )}
          {activeTab === 'menu' && (
            <POSView
              menu={menu} categories={categories} cart={cart} orders={orders}
              selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
              availableTokens={availableTokens} selectedToken={selectedToken} onSetToken={setSelectedToken}
              onAddToCart={addToCart} onRemoveFromCart={removeFromCart} onCheckout={() => setShowCheckout(true)}
              isDarkMode={isDarkMode} discount={discount} setDiscount={setDiscount} taxRate={taxRate}
              onConnectDock={connectDock} dockConnected={dockConnected} onCallCustomer={(t) => sendToDock(t)}
              userRole={userRole}
              isAddingItem={isAddingItem} setIsAddingItem={setIsAddingItem}
              newItem={newItem} setNewItem={setNewItem}
              isCreatingCategory={isCreatingCategory} setIsCreatingCategory={setIsCreatingCategory}
              handleAdminAddProduct={handleAdminAddProduct}
              handleAdminDeleteProduct={(id) => { if (confirm("Delete?")) fetch(`${API_URL}/products/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }).then(refreshProducts); }}
              rawProducts={rawProducts}
            />
          )}
          {activeTab === 'users' && userRole === 'admin' && (
            <div className="max-w-4xl mx-auto p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className={`text-2xl font-semibold mb-8 ${theme.text.main}`}>Staff Management</h2>
              <div className={`p-6 rounded-lg border mb-8 ${COMMON_STYLES.card(isDarkMode)}`}>
                <h3 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${theme.text.main}`}><Plus size={16} /> Add User</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  {['Username', 'Email', 'Password'].map((label) => (
                    <div key={label}>
                      <label className={`text-xs font-medium uppercase mb-1.5 block ${theme.text.secondary}`}>{label}</label>
                      <input 
                        type={label === 'Password' ? 'password' : 'text'}
                        className={`w-full ${COMMON_STYLES.input(isDarkMode)}`} 
                        value={newUser[label.toLowerCase()]} 
                        onChange={e => setNewUser({ ...newUser, [label.toLowerCase()]: e.target.value })} 
                        placeholder={label} 
                      />
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className={`text-xs font-medium uppercase mb-1.5 block ${theme.text.secondary}`}>Role</label>
                      <select className={`w-full ${COMMON_STYLES.select(isDarkMode)}`} value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                        <option value="cashier">Cashier</option><option value="manager">Manager</option><option value="admin">Admin</option>
                      </select>
                    </div>
                    <button onClick={handleAdminAddUser} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors outline-none mt-auto ${theme.button.primary}`}>Create</button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {usersList.map(u => (
                  <div key={u.id} className={`p-5 rounded-lg border flex justify-between items-center group transition-colors ${COMMON_STYLES.card(isDarkMode)} ${theme.border.hover}`}>
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-md ${theme.bg.subtle}`}><User size={20} /></div>
                      <div>
                        <p className={`font-medium text-sm ${theme.text.main}`}>{u.username || u.email.split('@')[0]}</p>
                        <p className={`text-xs font-medium ${theme.text.tertiary}`}>{u.role}</p>
                        <p className={`text-xs ${theme.text.muted}`}>{u.email}</p>
                      </div>
                    </div>
                    <button onClick={() => handleAdminDeleteUser(u.id)} className={`p-2 rounded-md opacity-0 group-hover:opacity-100 transition-all outline-none ${theme.bg.hover}`}><Trash2 size={16} className={theme.text.secondary} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* OVERLAYS */}
      <CheckoutModal 
        isOpen={showCheckout} 
        onClose={() => { setShowCheckout(false); setActiveUpiData(null); }} 
        onConfirm={finalizeOrder} 
        cartSubtotal={cartSubtotal} 
        taxAmount={taxAmount} 
        discount={discount} 
        grandTotal={grandTotal} 
        orderId={orders.length + 1} 
        isDarkMode={isDarkMode} 
        upiId={settings.upiId} 
        payeeName={settings.payeeName} 
        backendUpiData={activeUpiData} 
      />
      <ActiveOrdersDrawer isOpen={showActiveOrders} onClose={() => setShowActiveOrders(false)} orders={orders} onCompleteOrder={handleMarkReady} isDarkMode={isDarkMode} />
      <AdminSettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} API_URL={API_URL} restaurantId={getRestaurantId()} isDarkMode={isDarkMode} />
    </div>
  );
}