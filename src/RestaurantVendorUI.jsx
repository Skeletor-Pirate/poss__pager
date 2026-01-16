import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  ShoppingCart,
  Plus,
  Minus,
  Check,
  ChefHat,
  X,
  Search,
  Utensils,
  Clock,
  Hash,
  Receipt
} from 'lucide-react';

// --- Sub-component to isolate timer re-renders ---
const OrderTimer = ({ startedAt, large = false }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const update = () => setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    update();
    const i = setInterval(update, 1000);
    return () => clearInterval(i);
  }, [startedAt]);

  const mins = Math.floor(elapsed / 60);
  const secs = String(elapsed % 60).padStart(2, '0');
  
  const colorClass = mins > 15 ? 'text-red-600 font-bold' : mins > 10 ? 'text-orange-600' : 'text-stone-600';
  const sizeClass = large ? 'text-2xl' : 'text-xs';

  return <span className={`font-mono ${colorClass} ${sizeClass}`}>{mins}:{secs}</span>;
};

export default function RestaurantVendorUI() {
  // --- STATE ---
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('vendor_orders');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Sequential ID Counter (Resets on refresh)
  const [nextIdCounter, setNextIdCounter] = useState(1);

  const [cart, setCart] = useState([]);
  const [selectedToken, setSelectedToken] = useState('');
  
  // Panel States
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // --- REFS ---
  const searchRef = useRef(null);
  const categoryRefs = useRef([]);
  const itemRefs = useRef([]);
  const tokenRefs = useRef([]);
  const confirmButtonRef = useRef(null);
  const releaseBtnRef = useRef(null);

  // --- DATA ---
  const menu = {
    Starters: [
      { id: 1, name: 'Paneer Tikka', price: 180, imageQuery: 'Paneer Tikka dish' },
      { id: 2, name: 'Spring Rolls', price: 120 },
      { id: 3, name: 'Chicken Wings', price: 220 },
      { id: 4, name: 'French Fries', price: 80 },
    ],
    'Main Course': [
      { id: 10, name: 'Butter Chicken', price: 280, imageQuery: 'Butter Chicken dish' },
      { id: 11, name: 'Dal Makhani', price: 180 },
      { id: 12, name: 'Paneer Butter Masala', price: 240 },
      { id: 14, name: 'Chicken Biryani', price: 260 },
      { id: 15, name: 'Naan', price: 40 },
      { id: 16, name: 'Roti', price: 20 },
    ],
    Beverages: [
      { id: 18, name: 'Cold Coffee', price: 120, imageQuery: 'Cold Coffee glass' },
      { id: 19, name: 'Lassi', price: 80 },
      { id: 20, name: 'Lemon Soda', price: 60 },
    ],
  };

  const categories = Object.keys(menu);

  // --- EFFECTS ---
  useEffect(() => {
    if (!selectedCategory) setSelectedCategory(categories[0]);
  }, []);

  useEffect(() => {
    localStorage.setItem('vendor_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, menu[selectedCategory]?.length || 0);
  }, [selectedCategory, menu]);
  
  useEffect(() => {
    tokenRefs.current = tokenRefs.current.slice(0, orders.length);
  }, [orders]);

  // Focus release button when modal opens
  useEffect(() => {
    if (viewOrder) {
      setTimeout(() => {
        releaseBtnRef.current?.focus();
      }, 50);
    }
  }, [viewOrder]);

  // Global Shortcuts
  useEffect(() => {
    const h = (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        setOrdersOpen((p) => !p);
      }
      if (e.key === 'Escape') {
        if (viewOrder) setViewOrder(null);
        else setOrdersOpen(false);
      }
      // Quick Search Focus
      if (e.ctrlKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [viewOrder]);

  // --- CALCULATIONS ---
  const availableTokens = useMemo(() => {
    const used = orders.map((o) => o.token);
    return Array.from({ length: 20 }, (_, i) => `${i + 1}`).filter(
      (t) => !used.includes(t)
    );
  }, [orders]);

  useEffect(() => {
    if ((!selectedToken || !availableTokens.includes(selectedToken)) && availableTokens.length > 0) {
      setSelectedToken(availableTokens[0]);
    }
  }, [availableTokens, selectedToken]);

  const qty = (id) => cart.find((c) => c.id === id)?.quantity || 0;
  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const filteredItems = menu[selectedCategory]?.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- ACTIONS ---
  const addToCart = (item) => {
    setCart((p) => {
      const f = p.find((c) => c.id === item.id);
      return f
        ? p.map((c) => (c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c))
        : [...p, { ...item, quantity: 1 }];
    });
  };

  const dec = (item) => {
    setCart((p) => {
      const f = p.find((c) => c.id === item.id);
      if (!f) return p;
      return f.quantity === 1
        ? p.filter((c) => c.id !== item.id)
        : p.map((c) => (c.id === item.id ? { ...c, quantity: c.quantity - 1 } : c));
    });
  };

  const placeOrder = () => {
    if (!cart.length || !selectedToken) return;
    
    // --- SEQUENTIAL ID LOGIC ---
    const activeIds = new Set(orders.map(o => o.displayId));
    let candidateId = nextIdCounter;

    // Skip IDs that are already active (collision check)
    while (activeIds.has(String(candidateId).padStart(3, '0'))) {
      candidateId++;
    }

    const finalId = String(candidateId).padStart(3, '0');
    
    // Update counter for next time
    setNextIdCounter(candidateId + 1);

    const newOrder = {
      id: Date.now(),
      displayId: finalId,
      token: selectedToken,
      items: cart,
      total: cartTotal,
      startedAt: Date.now(),
    };
    setOrders((p) => [...p, newOrder]);
    setCart([]);
  };

  const completeOrder = (id) => {
    setOrders((p) => p.filter((o) => o.id !== id));
    setViewOrder(null);
  };

  // --- NAVIGATION HANDLERS ---

  // 1. SEARCH BAR
  const handleSearchKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (orders.length > 0) {
        tokenRefs.current[0]?.focus();
      } else {
        categoryRefs.current[0]?.focus();
      }
    }
  };

  // 2. ACTIVE TOKEN STRIP
  const handleTokenKeyDown = (e, index, order) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const next = (index + 1) % orders.length;
      tokenRefs.current[next]?.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = (index - 1 + orders.length) % orders.length;
      tokenRefs.current[prev]?.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      categoryRefs.current[0]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      searchRef.current?.focus();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      setViewOrder(order);
    }
  };

  // 3. CATEGORIES
  const handleCategoryKeyDown = (e, index) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      itemRefs.current[0]?.focus(); 
      return;
    }

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const next = (index + 1) % categories.length;
      setSelectedCategory(categories[next]);
      categoryRefs.current[next]?.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = (index - 1 + categories.length) % categories.length;
      setSelectedCategory(categories[prev]);
      categoryRefs.current[prev]?.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      itemRefs.current[0]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (orders.length > 0) {
        tokenRefs.current[0]?.focus();
      } else {
        searchRef.current?.focus();
      }
    }
  };

  // 4. MENU ITEMS
  const handleMenuItemKeyDown = (e, index, item) => {
    const totalItems = filteredItems.length;
    const gridCols = window.innerWidth >= 1280 ? 4 : window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1;
    
    if (e.key === 'Tab') {
      e.preventDefault();
      const nextIndex = index + gridCols;
      if (nextIndex < totalItems) {
        itemRefs.current[nextIndex]?.focus();
      } else {
        confirmButtonRef.current?.focus();
      }
      return;
    }

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const next = (index + 1) % totalItems;
      itemRefs.current[next]?.focus();
    } 
    else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = (index - 1 + totalItems) % totalItems;
      itemRefs.current[prev]?.focus();
    }
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = index + gridCols;
      if (nextIndex >= totalItems) {
        confirmButtonRef.current?.focus();
      } else {
        itemRefs.current[nextIndex]?.focus();
      }
    }
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (index < gridCols) {
        const catIndex = categories.indexOf(selectedCategory);
        categoryRefs.current[catIndex]?.focus();
      } else {
        const prev = Math.max(index - gridCols, 0);
        itemRefs.current[prev]?.focus();
      }
    }
    else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      addToCart(item);
    }
    else if (e.key === 'Backspace') {
      e.preventDefault();
      dec(item);
    }
  };

  // 5. CONFIRM BUTTON
  const handleConfirmButtonKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      if (orders.length > 0) {
         tokenRefs.current[0]?.focus();
      } else {
         setSelectedCategory(categories[0]);
         categoryRefs.current[0]?.focus();
      }
    }
    
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (filteredItems.length > 0) {
        itemRefs.current[filteredItems.length - 1]?.focus();
      } else {
        const catIndex = categories.indexOf(selectedCategory);
        categoryRefs.current[catIndex]?.focus();
      }
    }
  };

  return (
    <div className="h-screen bg-stone-50 flex flex-col md:flex-row overflow-hidden font-sans text-stone-800">
      
      {/* --- ORDER DETAILS MODAL (POPUP) --- */}
      {viewOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setViewOrder(null)} />
          <div className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 flex flex-col gap-4 mx-4">
            
            <div className="flex justify-between items-start border-b pb-4">
               <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-stone-900">Token {viewOrder.token}</span>
                    <span className="bg-blue-100 text-blue-700 font-bold px-2 py-1 rounded text-sm">#{viewOrder.displayId}</span>
                  </div>
                  <div className="text-stone-500 text-sm mt-1 flex items-center gap-2">
                     <Clock size={14} /> Preparing for <OrderTimer startedAt={viewOrder.startedAt} />
                  </div>
               </div>
               <button onClick={() => setViewOrder(null)} className="p-2 hover:bg-stone-100 rounded-full text-stone-500">
                  <X size={24} />
               </button>
            </div>

            <div className="py-2 space-y-3">
               <div className="flex justify-between items-center text-xs font-bold text-stone-400 uppercase">
                  <span>Item Description</span>
                  <span>Price</span>
               </div>
               {viewOrder.items.map((item) => (
                 <div key={item.id} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                       <div className="font-bold text-stone-800">{item.name}</div>
                       <div className="text-stone-400 text-xs">x{item.quantity}</div>
                    </div>
                    <div className="font-mono text-stone-600">₹{item.price * item.quantity}</div>
                 </div>
               ))}
               <div className="border-t border-dashed my-2"></div>
               <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Bill</span>
                  <span>₹{viewOrder.total}</span>
               </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
               <button 
                 ref={releaseBtnRef} 
                 onClick={() => completeOrder(viewOrder.id)}
                 className="w-full py-3 bg-green-600 hover:bg-green-700 focus:bg-green-700 focus:ring-4 focus:ring-green-300 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all outline-none"
               >
                 <Check size={20} /> Mark Ready & Release
               </button>
               
               <button 
                 onClick={() => setViewOrder(null)}
                 className="w-full py-2 text-stone-500 hover:text-stone-800 focus:text-stone-800 font-medium text-sm outline-none"
               >
                 Close Details (Esc)
               </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ACTIVE ORDERS SIDEBAR (Global List) --- */}
      {ordersOpen && (
        <div className="fixed inset-0 z-50 flex justify-start animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOrdersOpen(false)} />
          <div className="relative bg-white w-full max-w-md h-full shadow-2xl flex flex-col">
            <div className="p-4 border-b flex justify-between items-center bg-stone-100">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <ChefHat className="text-orange-500" /> All Active Orders
              </h2>
              <button onClick={() => setOrdersOpen(false)} className="p-2 hover:bg-stone-200 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {orders.map((o) => (
                <div key={o.id} className="border border-stone-200 bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="bg-stone-50 p-3 flex justify-between items-center border-b">
                    <div className="flex gap-2 items-center">
                      <span className="font-bold bg-black text-white px-2 py-0.5 rounded text-sm">Token {o.token}</span>
                      <span className="text-xs font-bold text-stone-500">#{o.displayId}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <OrderTimer startedAt={o.startedAt} />
                      <button onClick={() => completeOrder(o.id)} className="bg-green-100 hover:bg-green-200 text-green-700 p-1.5 rounded-full"><Check size={16} /></button>
                    </div>
                  </div>
                  <div className="p-3">
                    {o.items.map((i) => (
                      <div key={i.id} className="flex justify-between text-sm py-1 border-b border-dashed last:border-0 border-stone-100">
                        <span>{i.name} <span className="text-stone-400 text-xs">x{i.quantity}</span></span>
                      </div>
                    ))}
                    <div className="text-right font-bold mt-2 text-stone-700">₹{o.total}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- LEFT SIDE: MENU AREA --- */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* TOP HEADER */}
        <div className="bg-white border-b px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm z-10">
          <div>
            <h1 className="text-xl font-bold text-stone-800">POS Terminal</h1>
            <p className="text-xs text-stone-500">
               <span className="cursor-pointer text-blue-600 hover:underline" onClick={() => setOrdersOpen(true)}>Manage All Orders (Ctrl+O)</span>
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
            <input 
              ref={searchRef}
              onKeyDown={handleSearchKeyDown}
              className="w-full pl-10 pr-4 py-2 bg-stone-100 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Search menu... (Ctrl+F)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* --- ACTIVE TOKENS STRIP --- */}
        {orders.length > 0 && (
          <div className="bg-stone-50 border-b px-6 py-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
             <div className="flex gap-3 items-center">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-400 uppercase tracking-wider">
                  <Clock size={14} /> Waiting:
                </div>
                {orders.map((o, index) => (
                   <button 
                     key={o.id} 
                     ref={el => tokenRefs.current[index] = el}
                     onKeyDown={(e) => handleTokenKeyDown(e, index, o)}
                     onClick={() => setViewOrder(o)}
                     className="cursor-pointer inline-flex items-center gap-2 bg-white border border-stone-200 rounded-full px-1 py-1 pr-3 shadow-sm hover:shadow-md hover:border-blue-400 transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none"
                   >
                      <span className="text-xs font-bold text-white bg-black px-2 py-0.5 rounded-full">T-{o.token}</span>
                      <span className="text-xs font-bold text-stone-600 flex items-center">
                        <Hash size={10} className="mr-0.5" />{o.displayId}
                      </span>
                      <span className="text-xs font-mono border-l pl-2 border-stone-200">
                        <OrderTimer startedAt={o.startedAt} />
                      </span>
                   </button>
                ))}
             </div>
          </div>
        )}

        {/* CATEGORY TABS */}
        <div className="bg-white border-b px-6 py-2 overflow-x-auto whitespace-nowrap">
          <div className="flex gap-2">
            {categories.map((cat, i) => (
              <button
                key={cat}
                ref={(el) => (categoryRefs.current[i] = el)}
                onClick={() => setSelectedCategory(cat)}
                onKeyDown={(e) => handleCategoryKeyDown(e, i)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  selectedCategory === cat
                    ? 'bg-stone-800 text-white shadow-md'
                    : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* MENU GRID */}
        <div className="flex-1 overflow-y-auto p-6 bg-stone-50/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
            {filteredItems?.map((i, index) => (
              <div
                key={i.id}
                ref={(el) => (itemRefs.current[index] = el)}
                tabIndex={0}
                onKeyDown={(e) => handleMenuItemKeyDown(e, index, i)}
                onClick={() => addToCart(i)}
                className="bg-white border border-stone-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col gap-3 group cursor-pointer outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <div className="flex gap-4 pointer-events-none">
                  <div className="w-16 h-16 bg-stone-100 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                     {i.imageQuery ? (
                        <div className="w-full h-full object-cover text-[10px] flex items-center justify-center text-center text-stone-400">
                          <Utensils size={24} />
                        </div>
                     ) : (
                        <Utensils className="text-stone-300" />
                     )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-stone-800 leading-tight">{i.name}</h3>
                    <div className="text-stone-500 text-sm mt-1">₹{i.price}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto pt-2 border-t border-stone-50 pointer-events-none">
                  {qty(i.id) > 0 ? (
                    <div className="flex items-center gap-3 bg-stone-100 rounded-lg px-2 py-1 w-full justify-between">
                      <span className="text-stone-600 text-xs">Backspace -</span>
                      <span className="font-semibold text-sm w-4 text-center">{qty(i.id)}</span>
                      <span className="text-stone-600 text-xs">Enter +</span>
                    </div>
                  ) : (
                    <div className="w-full text-center text-stone-400 text-xs">
                      Press Enter to Add
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- RIGHT SIDE: CART --- */}
      <div className="w-full md:w-[380px] bg-white border-l h-full flex flex-col shadow-xl z-20">
        <div className="p-5 border-b bg-stone-50">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <ShoppingCart size={20} /> Current Order
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-stone-400 space-y-2">
              <ShoppingCart size={48} className="opacity-20" />
              <p>Start adding items</p>
            </div>
          ) : (
            cart.map((i) => (
              <div key={i.id} className="flex justify-between items-center py-3 border-b border-stone-100 last:border-0 group">
                <div className="flex-1">
                  <div className="font-medium text-sm text-stone-800">{i.name}</div>
                  <div className="text-xs text-stone-500">₹{i.price * i.quantity}</div>
                </div>
                
                <div className="flex items-center gap-2 bg-stone-50 rounded-lg border px-1 py-0.5">
                  <button onClick={() => dec(i)} className="p-1 hover:bg-white rounded shadow-sm text-stone-600"><Minus size={12} /></button>
                  <span className="text-xs font-semibold w-4 text-center">{i.quantity}</span>
                  <button onClick={() => addToCart(i)} className="p-1 hover:bg-white rounded shadow-sm text-stone-600"><Plus size={12} /></button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-stone-50 border-t space-y-4">
          <div className="flex justify-between items-center text-lg font-bold text-stone-800">
            <span>Total</span>
            <span>₹{cartTotal}</span>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-500">Assign Token</label>
            <select 
              value={selectedToken} 
              onChange={(e) => setSelectedToken(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-stone-300 bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {availableTokens.length === 0 ? (
                <option disabled>No Tokens Available</option>
              ) : (
                 <>
                   <option value="" disabled>Select Token</option>
                   {availableTokens.map((t) => (
                    <option key={t} value={t}>Token {t}</option>
                   ))}
                 </>
              )}
            </select>
          </div>

          <button 
            ref={confirmButtonRef}
            onKeyDown={handleConfirmButtonKeyDown}
            onClick={placeOrder}
            disabled={!cart.length || !selectedToken}
            className="w-full py-3 bg-stone-900 text-white rounded-xl font-bold hover:bg-black disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl outline-none focus:ring-4 focus:ring-stone-500/50"
          >
            Confirm Order
          </button>
        </div>
      </div>
    </div>
  );
}