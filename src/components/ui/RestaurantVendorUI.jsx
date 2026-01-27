import React, { useEffect, useState, useMemo, useRef } from 'react';
import { LogOut, Plus, Trash2, Edit, Save, X, User, Coffee, Settings } from 'lucide-react';
import POSView from './POSView';
import CheckoutModal from './CheckoutModal';
import AdminSettingsModal from './AdminSettingsModal';

export default function RestaurantVendorUI({ user, onLogout }) {
  const API_URL = "http://localhost:3000";
  const token = localStorage.getItem("auth_token");

  // ==========================================
  // 🕵️‍♂️ ROLE DETECTION
  // ==========================================
  const findRoleInObject = (obj) => {
      if (!obj) return null;
      if (typeof obj !== 'object') return null;
      if (obj.role) return obj.role;
      if (obj.user && obj.user.role) return obj.user.role;
      return null;
  };

  let userRole = findRoleInObject(user) || 'cashier';
  if (userRole === 'manager') userRole = 'cashier'; // Force manager to cashier view

  // ==========================================
  // STATE
  // ==========================================
  const [rawProducts, setRawProducts] = useState([]);
  const [menu, setMenu] = useState({});
  const [categories, setCategories] = useState([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const hasFetched = useRef(false);

  // POS State
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedToken, setSelectedToken] = useState("1");
  const [discount, setDiscount] = useState(0);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [settings, setSettings] = useState({ upiId: "aakash@okaxis", payeeName: "Aakash" });
  const [activeUpiData, setActiveUpiData] = useState(null);

  // Admin State
  const [activeTab, setActiveTab] = useState('menu');
  const [usersList, setUsersList] = useState([]);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', price: '', category: '' });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', price: '', category: '' });
  const [newUser, setNewUser] = useState({ email: '', password: '', role: 'cashier' });

  // ==========================================
  // LOAD DATA
  // ==========================================
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    async function loadData() {
      try {
        const prodRes = await fetch(`${API_URL}/products`, { headers: { Authorization: `Bearer ${token}` } });
        if (prodRes.ok) {
          const list = await prodRes.json();
          const productList = Array.isArray(list) ? list : list.products || [];
          setRawProducts(productList);

          const grouped = {};
          const cats = [];
          productList.forEach(p => {
            const cat = p.category || "General";
            if (!grouped[cat]) { grouped[cat] = []; cats.push(cat); }
            grouped[cat].push({ id: Number(p.id), name: p.name, price: Number(p.price) });
          });
          setMenu(grouped);
          setCategories(cats);
          setSelectedCategory(cats[0] || "");
        }

        const setRes = await fetch(`${API_URL}/settings`, { headers: { Authorization: `Bearer ${token}` } });
        if (setRes.ok) {
           const s = await setRes.json();
           if (s.upi_id) setSettings({ upiId: s.upi_id, payeeName: s.payee_name });
        }

        if (userRole === 'admin') {
           const userRes = await fetch(`${API_URL}/auth/users`, { headers: { Authorization: `Bearer ${token}` } });
           if (userRes.ok) setUsersList(await userRes.json());
        }
      } catch (e) { console.error("Init Error", e); }
    }
    loadData();
  }, [token, userRole]);

  // ==========================================
  // ACTIONS
  // ==========================================
  const refreshData = () => { hasFetched.current = false; window.location.reload(); };

  // Admin Actions
  const handleAdminSaveProduct = async (id) => {
    await fetch(`${API_URL}/products/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(editForm) });
    refreshData();
  };
  const handleAdminDeleteProduct = async (id) => {
    if(!confirm("Delete this item?")) return;
    await fetch(`${API_URL}/products/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    refreshData();
  };
  const handleAdminAddProduct = async () => {
    await fetch(`${API_URL}/products`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(newItem) });
    refreshData();
  };
  const handleAdminAddUser = async () => {
    const res = await fetch(`${API_URL}/auth/signup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newUser) });
    if(res.ok) { alert("User Created"); refreshData(); } else alert("Failed");
  };
  const handleAdminDeleteUser = async (id) => {
    if(id === user.id) return alert("Cannot delete yourself");
    if(!confirm("Delete User?")) return;
    await fetch(`${API_URL}/auth/users/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    refreshData();
  };

  // POS Actions
  const availableTokens = useMemo(() => {
    const used = orders.map(o => String(o.token));
    return Array.from({ length: 50 }, (_, i) => String(i + 1)).filter(t => !used.includes(t));
  }, [orders]);
  const addToCart = item => setCart(p => {
      const f = p.find(i => i.id === item.id);
      return f ? p.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i) : [...p, { ...item, quantity: 1 }];
  });
  const removeFromCart = item => setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (!existing) return prev;
      if (existing.quantity === 1) return prev.filter(i => i.id !== item.id);
      return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i);
  });
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const grandTotal = Math.max(0, total - Number(discount));
  const finalizeOrder = async (paymentData) => {
    let method = typeof paymentData === 'string' ? paymentData : paymentData?.paymentMethod;
    const payload = {
      paymentMethod: method.toLowerCase(),
      token: Number(selectedToken),
      items: cart.map(i => ({ productId: i.id, name: i.name, price: i.price, quantity: i.quantity })),
      financials: { subtotal: total, discount: Number(discount), finalPayable: grandTotal }
    };
    try {
      const res = await fetch(`${API_URL}/orders`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
      const result = await res.json();
      if (method.toLowerCase() === 'upi' && result.upi?.qr) setActiveUpiData(result.upi);
      else handleOrderSuccess(result.orderId);
    } catch (e) { console.error("Order failed:", e); }
  };
  const handleOrderSuccess = (orderId) => {
    setOrders(p => [...p, { id: orderId || Date.now(), token: selectedToken, items: cart, startedAt: Date.now() }]);
    setCart([]); setDiscount(0); setShowCheckout(false); setActiveUpiData(null);
  };

  // ==========================================
  // VIEW RENDER
  // ==========================================
  if (userRole === 'admin') {
    return (
        <div className="min-h-screen bg-slate-100 flex font-sans text-slate-900 flex-col">
            <div className="flex flex-1 overflow-hidden">
                {/* Admin Sidebar */}
                <div className="w-64 bg-slate-900 text-white flex flex-col p-6">
                    <h1 className="text-2xl font-black mb-10 flex items-center gap-2"><Settings className="text-blue-500" /> Admin</h1>
                    <nav className="flex-1 space-y-2">
                        <button onClick={() => setActiveTab('menu')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'menu' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}><Coffee size={20}/> Menu</button>
                        <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}><User size={20}/> Staff</button>
                        <button onClick={() => setSettingsOpen(true)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-slate-400 hover:bg-slate-800"><Settings size={20}/> Settings</button>
                    </nav>
                    <button onClick={onLogout} className="flex items-center gap-2 text-red-400 font-bold mt-auto px-4 py-2 hover:bg-slate-800 rounded-lg"><LogOut size={18}/> Logout</button>
                </div>
                {/* Admin Content */}
                <div className="flex-1 p-8 overflow-y-auto">
                    {activeTab === 'menu' && (
                        <div className="max-w-5xl mx-auto">
                            <div className="flex justify-between items-center mb-6"><h2 className="text-3xl font-black">Menu</h2><button onClick={() => setIsAddingItem(true)} className="bg-blue-600 text-white px-5 py-2 rounded-xl font-bold flex gap-2"><Plus size={20}/> Add</button></div>
                            {isAddingItem && (<div className="bg-white p-6 rounded-2xl shadow-lg mb-6 border border-blue-200"><div className="grid grid-cols-3 gap-4 mb-4"><input placeholder="Name" className="border p-3 rounded-xl" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} /><input placeholder="Price" className="border p-3 rounded-xl" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} /><input placeholder="Category" className="border p-3 rounded-xl" value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})} /></div><div className="flex gap-2 justify-end"><button onClick={() => setIsAddingItem(false)} className="bg-slate-100 px-4 py-2 rounded-lg">Cancel</button><button onClick={handleAdminAddProduct} className="bg-slate-900 text-white px-6 py-2 rounded-lg">Save</button></div></div>)}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"><table className="w-full text-left"><thead className="bg-slate-50 border-b"><tr><th className="p-4">Name</th><th className="p-4">Category</th><th className="p-4">Price</th><th className="p-4 text-right">Actions</th></tr></thead><tbody>{rawProducts.map(p => (<tr key={p.id} className="border-b hover:bg-slate-50">{editingId === p.id ? (<><td className="p-4"><input className="border p-1 w-full" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})}/></td><td className="p-4"><input className="border p-1 w-full" value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})}/></td><td className="p-4"><input className="border p-1 w-full" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})}/></td><td className="p-4 text-right"><button onClick={() => handleAdminSaveProduct(p.id)} className="text-green-600 mr-2"><Save/></button><button onClick={() => setEditingId(null)} className="text-slate-400"><X/></button></td></>) : (<><td className="p-4 font-bold">{p.name}</td><td className="p-4">{p.category}</td><td className="p-4">₹{p.price}</td><td className="p-4 text-right"><button onClick={() => { setEditingId(p.id); setEditForm(p); }} className="text-blue-500 mr-2"><Edit/></button><button onClick={() => handleAdminDeleteProduct(p.id)} className="text-red-500"><Trash2/></button></td></>)}</tr>))}</tbody></table></div>
                        </div>
                    )}
                    {activeTab === 'users' && (
                        <div className="max-w-5xl mx-auto">
                            <h2 className="text-3xl font-black mb-6">Staff</h2>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8"><div className="grid grid-cols-4 gap-4 items-end"><div><label className="text-xs font-bold">Email</label><input className="w-full border p-2 rounded" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} /></div><div><label className="text-xs font-bold">Password</label><input className="w-full border p-2 rounded" type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} /></div><div><label className="text-xs font-bold">Role</label><select className="w-full border p-2 rounded" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}><option value="cashier">Cashier</option><option value="manager">Manager</option><option value="admin">Admin</option></select></div><button onClick={handleAdminAddUser} className="bg-slate-900 text-white p-2 rounded font-bold">Create</button></div></div>
                            <div className="grid grid-cols-3 gap-4">{usersList.map(u => (<div key={u.id} className="bg-white p-5 rounded-2xl border border-slate-200 flex justify-between items-center"><div className="flex items-center gap-4"><div className="bg-blue-100 p-3 rounded-full text-blue-600"><User size={20}/></div><div><p className="font-bold">{u.email}</p><p className="text-xs font-black uppercase text-slate-500">{u.role}</p></div></div><button onClick={() => handleAdminDeleteUser(u.id)} className="text-red-400 hover:bg-red-50 p-2 rounded"><Trash2 size={20}/></button></div>))}</div>
                        </div>
                    )}
                </div>
                <AdminSettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
            </div>
        </div>
    );
  }

  // POS Render (Default)
  return (
    <div className="h-screen overflow-hidden bg-slate-50 flex flex-col">
      <div className="flex-1 overflow-hidden relative">
          <CheckoutModal isOpen={showCheckout} onClose={() => { setShowCheckout(false); setActiveUpiData(null); }} onConfirm={finalizeOrder} onSuccess={() => handleOrderSuccess()} cartSubtotal={total} taxAmount={0} discount={discount} grandTotal={grandTotal} orderId={orders.length + 1} isDarkMode={false} upiId={settings.upiId} payeeName={settings.payeeName} backendUpiData={activeUpiData} />
          <AdminSettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
          <POSView menu={menu} categories={categories} cart={cart} orders={orders} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} availableTokens={availableTokens} selectedToken={selectedToken} onSetToken={setSelectedToken} onAddToCart={addToCart} onRemoveFromCart={removeFromCart} onCheckout={() => setShowCheckout(true)} onLogout={onLogout} userRole={userRole} isDarkMode={false} onToggleTheme={() => {}} onOpenOrders={() => {}} onOpenReport={() => {}} onViewOrder={() => {}} discount={discount} setDiscount={setDiscount} onAddItem={() => {}} onEditItem={() => {}} onOpenSettings={() => setSettingsOpen(true)} />
      </div>
    </div>
  );
}