import React, { useState } from 'react';
import { Search, Monitor, LogOut, X, ChefHat, Bell, Plus, Minus, LayoutGrid, Usb } from 'lucide-react';

export default function POSView({ 
  menu = {}, 
  categories = [], 
  cart = [], 
  orders = [], 
  selectedCategory, 
  setSelectedCategory, 
  availableTokens = [], 
  selectedToken, 
  onSetToken, 
  onAddToCart, 
  onRemoveFromCart, 
  onCheckout, 
  onLogout, 
  userRole, 
  isDarkMode, 
  onToggleTheme,
  discount,
  setDiscount,
  taxRate,
  onOpenSettings,
  onMarkReady,
  onCallCustomer,
  onConnectDock,
  dockConnected
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showLeftSidebar, setShowLeftSidebar] = useState(false);

  // --- LOGIC & SAFETY CHECKS ---
  // Ensure menu exists before trying to read it
  const safeMenu = menu || {};
  
  const products = selectedCategory 
      ? (safeMenu[selectedCategory] || []) 
      : Object.values(safeMenu).flat();

  // Ensure products is an array before filtering
  const safeProducts = Array.isArray(products) ? products : [];

  const filteredProducts = safeProducts.filter(p => 
      p?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Ensure cart is an array
  const safeCart = Array.isArray(cart) ? cart : [];
  
  const cartSubtotal = safeCart.reduce((s, i) => s + (i.price || 0) * (i.quantity || 1), 0);
  const afterDiscount = Math.max(0, cartSubtotal - Number(discount || 0));
  const taxAmount = afterDiscount * ((taxRate || 0) / 100);
  const grandTotal = Math.round(afterDiscount + taxAmount);

  // --- HANDLERS ---
  const handleDiscountChange = (e) => {
      const val = e.target.value;
      if (val === '') { setDiscount(''); return; }
      const numVal = parseFloat(val);
      if (numVal >= 0) setDiscount(numVal);
  };

  // --- THEME ---
  const bgMain = isDarkMode ? "bg-slate-900" : "bg-slate-50";
  const bgCard = isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200";
  const textMain = isDarkMode ? "text-white" : "text-slate-900";
  const textSub = isDarkMode ? "text-slate-400" : "text-slate-500";
  const inputBg = isDarkMode ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-slate-200 text-slate-900";
  const topBarBg = isDarkMode ? "bg-slate-900/95 backdrop-blur-md border-slate-800" : "bg-white/95 backdrop-blur-md border-slate-200";

  return (
    <div className={`flex h-full w-full absolute inset-0 ${bgMain} ${textMain} font-sans overflow-hidden`}>
      
      {/* LEFT SIDEBAR (Kitchen - Overlay) */}
      {showLeftSidebar && (
        <>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setShowLeftSidebar(false)}></div>
          <div className={`absolute inset-y-0 left-0 w-80 shadow-2xl z-50 p-4 flex flex-col transition-transform duration-300 animate-in slide-in-from-left ${isDarkMode ? 'bg-slate-900 border-r border-slate-700' : 'bg-white border-r border-slate-200'}`}>
            <div className="flex justify-between items-center mb-6">
               <h2 className={`text-xl font-black flex items-center gap-2 ${textMain}`}><ChefHat className="text-orange-500"/> Kitchen</h2>
               <button onClick={() => setShowLeftSidebar(false)} className="p-1 rounded hover:bg-slate-500/10"><X size={20}/></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3">
              {/* ✅ Safety Check: (orders || []) */}
              {(orders || []).map(order => (
                <div key={order.id} className={`p-4 rounded-xl border relative group ${bgCard}`}>
                    <div className="flex justify-between font-bold mb-2">
                       <span className="flex items-center gap-2"><span className="bg-orange-500 text-white px-2 py-0.5 rounded text-xs">#{order.token}</span></span>
                       <span className="text-xs font-mono opacity-50">
                         {new Date(order.startedAt || Date.now()).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                       </span>
                    </div>
                    {/* ✅ Safety Check for items inside order */}
                    {(order.items || []).map((item, idx) => (
                       <div key={idx} className={`text-sm ${textSub} flex justify-between`}>
                           <span>{item.name}</span>
                           <span className="font-bold">x{item.quantity}</span>
                       </div>
                    ))}
                    <div className="flex gap-2 mt-3 pt-3 border-t border-inherit">
                        <button onClick={() => onCallCustomer(order.token)} className="flex-1 py-1.5 bg-blue-500/10 text-blue-500 rounded text-xs font-bold flex items-center justify-center gap-1 hover:bg-blue-500/20"><Bell size={12}/> Call</button>
                        <button onClick={() => onMarkReady(order.id)} className="flex-1 py-1.5 bg-green-500/10 text-green-500 rounded text-xs font-bold hover:bg-green-500/20">Done</button>
                    </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* CENTER (Menu) */}
      <div className="flex-1 flex flex-col h-full relative">
        
        {/* TOP BAR */}
        <div className={`flex flex-col z-30 shadow-sm border-b transition-colors ${topBarBg}`}>
            <div className="h-16 px-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => setShowLeftSidebar(true)} className={`p-2 rounded-lg relative ${isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`}>
                        <ChefHat size={22}/>
                        {(orders || []).length > 0 && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-slate-900 rounded-full animate-pulse"></span>}
                    </button>
                    <h1 className="font-black text-2xl tracking-tighter flex items-center gap-2"><LayoutGrid className="text-blue-500 fill-current" /> POS</h1>
                </div>
                
                <div className="flex-1 max-w-lg relative mx-auto">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${textSub}`} size={16} />
                    <input 
                        placeholder="Search menu..." 
                        className={`w-full pl-10 pr-4 py-2 rounded-full text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all ${inputBg}`} 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                    />
                </div>

                <div className="flex items-center gap-2">
                    <button 
                        onClick={onConnectDock} 
                        className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                        ${dockConnected ? 'bg-green-500/10 text-green-500' : 'bg-slate-500/10 text-slate-500 hover:bg-slate-500/20'}`}
                    >
                        <Usb size={16}/> {dockConnected ? "Dock Active" : "Connect Dock"}
                    </button>

                    <button onClick={onToggleTheme} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-yellow-400' : 'hover:bg-slate-100 text-slate-600'}`}>
                        <Monitor size={20}/>
                    </button>
                    <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg text-sm font-bold transition-all">
                        <LogOut size={18}/> <span className="hidden sm:inline">Logout</span>
                    </button>
                </div>
            </div>

            {/* Categories */}
            <div className="px-4 pb-0 overflow-x-auto no-scrollbar">
               <div className="flex gap-2 pb-3">
                   <button 
                        onClick={() => setSelectedCategory("")} 
                        className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${selectedCategory === "" ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30' : `border-transparent hover:bg-slate-500/10 ${textSub}`}`}
                   >
                        All Items
                   </button>
                   {/* ✅ Safety Check: (categories || []) */}
                   {(categories || []).map(cat => (
                     <button 
                        key={cat} 
                        onClick={() => setSelectedCategory(cat)} 
                        className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${selectedCategory === cat ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30' : `border-transparent hover:bg-slate-500/10 ${textSub}`}`}
                     >
                        {cat}
                     </button>
                   ))}
               </div>
            </div>
        </div>

        {/* PRODUCT GRID */}
        <div className="flex-1 overflow-y-auto p-4 scroll-smooth">
           {filteredProducts.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-full opacity-50">
                  <Search size={48} className="mb-4 text-slate-500"/>
                  <h3 className="font-bold text-lg">No Items Found</h3>
               </div>
           ) : (
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 pb-20">
                  {/* ✅ Safety Check: filteredProducts is already safe */}
                  {filteredProducts.map(item => {
                    const inCart = safeCart.find(c => c.id === item.id);
                    return (
                      <div key={item.id} onClick={() => onAddToCart(item)} className={`p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] active:scale-95 flex flex-col justify-between h-28 relative group overflow-hidden ${bgCard} ${inCart ? 'ring-2 ring-blue-500 border-transparent bg-blue-500/5' : 'hover:border-blue-500/50'}`}>
                          <div>
                              <h3 className="font-bold text-sm leading-tight line-clamp-2">{item.name}</h3>
                              <p className={`text-[10px] mt-1 font-bold opacity-60 uppercase tracking-wide`}>{item.category}</p>
                          </div>
                          <div className="flex justify-between items-end mt-2">
                             <span className="font-black text-blue-500">₹{item.price}</span>
                             {inCart ? (
                                 <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg shadow-blue-500/40">{inCart.quantity}</span>
                             ) : (
                                 <div className={`p-1.5 rounded-lg bg-slate-500/10 opacity-0 group-hover:opacity-100 transition-opacity`}>
                                     <Plus size={14}/>
                                 </div>
                             )}
                          </div>
                      </div>
                    );
                  })}
               </div>
           )}
        </div>
      </div>

      {/* RIGHT SIDEBAR (Cart) */}
      <div className={`w-80 flex flex-col border-l z-20 shadow-xl ${bgCard}`}>
         <div className={`p-4 border-b flex justify-between items-center ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
            <h2 className="font-black text-lg">Cart</h2>
            <div className="flex items-center gap-2">
                <span className="text-xs font-bold opacity-60">TOKEN</span>
                <select value={selectedToken} onChange={(e) => onSetToken(e.target.value)} className={`text-sm font-black border rounded px-2 py-1 w-14 text-center outline-none focus:ring-2 ring-blue-500 ${inputBg}`}>
                    {/* ✅ Safety Check: (availableTokens || []) */}
                    {(availableTokens || []).map(t => <option key={t} value={t} className="text-slate-900">{t}</option>)}
                    <option value={selectedToken} className="text-slate-900">{selectedToken}</option>
                </select>
            </div>
         </div>

         <div className="flex-1 overflow-y-auto p-3 space-y-2">
             {safeCart.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-full opacity-40">
                     <span className="text-4xl mb-2">🛒</span>
                     <p className="font-bold text-sm">Empty Cart</p>
                 </div>
             ) : (
                 // ✅ Safety Check: safeCart is already safe
                 safeCart.map(item => (
                     <div key={item.id} className={`p-3 rounded-lg border flex justify-between items-center group ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                         <div className="flex-1">
                             <p className="font-bold text-sm truncate w-32">{item.name}</p>
                             <p className="text-xs text-blue-500 font-bold">₹{item.price * item.quantity}</p>
                         </div>
                         <div className="flex items-center gap-2 bg-slate-500/10 rounded-lg p-1">
                             <button onClick={() => onRemoveFromCart(item)} className="p-1 hover:bg-white/20 rounded"><Minus size={12}/></button>
                             <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                             <button onClick={() => onAddToCart(item)} className="p-1 hover:bg-white/20 rounded"><Plus size={12}/></button>
                         </div>
                     </div>
                 ))
             )}
         </div>

         <div className={`p-4 border-t ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
             <div className="space-y-2 mb-4 text-sm font-bold opacity-70">
                 <div className="flex justify-between"><span>Subtotal</span><span>{cartSubtotal}</span></div>
                 
                 <div className="flex justify-between items-center group">
                     <span>Discount</span>
                     <div className="flex items-center gap-1">
                        <span className={`text-xs font-bold transition-opacity ${discount > 0 ? 'text-red-500 opacity-100' : 'opacity-0 group-hover:opacity-50'}`}>- ₹</span>
                        <input 
                            className={`w-12 text-right bg-transparent outline-none border-b border-transparent focus:border-blue-500 transition-all font-bold 
                            ${discount > 0 ? 'text-red-500' : textSub} hover:border-slate-500/30`} 
                            type="number" 
                            min="0"
                            placeholder="0"
                            value={discount || ''} 
                            onChange={handleDiscountChange}
                            onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                        />
                     </div>
                 </div>

                 <div className="flex justify-between"><span>GST ({taxRate}%)</span><span>{Math.round(taxAmount)}</span></div>
             </div>
             
             <div className="flex justify-between font-black text-xl mb-4 pt-4 border-t border-dashed border-inherit">
                 <span>Total</span>
                 <span className="text-blue-500">₹{grandTotal}</span>
             </div>
             
             <button onClick={onCheckout} disabled={safeCart.length === 0} className={`w-full py-3.5 rounded-xl font-black text-lg transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2 ${safeCart.length > 0 ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}>
                Checkout & Call
             </button>
         </div>
      </div>
    </div>
  );
}