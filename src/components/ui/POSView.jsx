import React, { useState, useMemo } from 'react';
import { Search, ShoppingCart, Plus, Minus, Trash2, Wifi, ChevronDown, Bell, X as XIcon } from 'lucide-react';
import { getTheme, COMMON_STYLES, FONTS } from './theme';

export default function POSView({
  menu, categories, cart, orders,
  selectedCategory, setSelectedCategory,
  availableTokens, selectedToken, onSetToken,
  onAddToCart, onRemoveFromCart, onCheckout,
  userRole, isDarkMode,
  discount, setDiscount, taxRate,
  onOpenActiveOrders, onConnectDock, dockConnected,
  // Admin
  isAddingItem, setIsAddingItem,
  newItem, setNewItem,
  isCreatingCategory, setIsCreatingCategory,
  handleAdminAddProduct, handleAdminDeleteProduct,
  rawProducts
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const theme = getTheme(isDarkMode);

  /* ── filtered product list ── */
  const filteredProducts = useMemo(() => {
    let products = [];
    if (selectedCategory === "All" || !selectedCategory) {
      Object.values(menu).forEach(arr => products.push(...arr));
    } else {
      products = menu[selectedCategory] || [];
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      products = products.filter(p => p.name.toLowerCase().includes(q));
    }
    return products;
  }, [menu, selectedCategory, searchTerm]);

  /* ── cart totals (mirrored from parent for display) ── */
  const cartSubtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const taxAmount   = Math.max(0, cartSubtotal - discount) * (taxRate / 100);
  const grandTotal  = Math.round(Math.max(0, cartSubtotal - discount) + taxAmount);

  return (
    <div className={`flex h-full ${theme.bg.main} ${theme.text.main}`} style={{ fontFamily: FONTS.sans }}>

      {/* ═══════════════ LEFT – MENU ═══════════════ */}
      <div className={`flex-1 flex flex-col border-r ${theme.border.default} ${theme.bg.main}`}>

        {/* ── top bar: search + category + icons ── */}
        <div className={`p-6 border-b flex items-center justify-between gap-4 ${theme.border.default} ${theme.bg.main}`}>

          {/* search */}
          <div className="relative flex-1 max-w-md">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme.text.secondary}`} size={20} />
            <input
              type="text"
              placeholder="Search menu..."
              className={`w-full ${COMMON_STYLES.input(isDarkMode)} pl-12 pr-4 py-3`}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          {/* category dropdown – desktop */}
          <div className="relative hidden md:block">
            <select
              className={`w-full ${COMMON_STYLES.select(isDarkMode)} pl-4 pr-10 py-3`}
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${theme.text.secondary}`} size={16} />
          </div>

          {/* icon buttons */}
          <div className="flex items-center gap-3">
            {/* dock connect */}
            <button
              onClick={onConnectDock}
              className={`p-3 rounded-xl border transition-all
                ${dockConnected
                  ? `${theme.bg.active} ${theme.border.default} ${theme.text.main}`
                  : `${theme.border.default} ${theme.button.ghost}`}`}
            >
              <Wifi size={20} className={dockConnected ? 'animate-pulse' : ''} />
            </button>

            {/* active-orders bell */}
            <button
              onClick={onOpenActiveOrders}
              className={`p-3 rounded-xl border relative transition-all ${theme.border.default} ${theme.button.ghost}`}
            >
              <Bell size={20} />
              {orders.length > 0 && (
                <span className={`absolute -top-1 -right-1 h-5 w-5 text-xs font-semibold rounded-full
                  flex items-center justify-center border-2
                  ${isDarkMode ? 'bg-white text-black border-black' : 'bg-black text-white border-white'}`}>
                  {orders.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ── mobile category pills ── */}
        <div className={`md:hidden p-4 pb-0 flex gap-3 overflow-x-auto scrollbar-hide ${theme.bg.main}`}>
          {["All", ...categories].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border
                ${selectedCategory === cat ? theme.button.primary : `${theme.border.default} ${theme.button.secondary}`}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── ADMIN: add-product form ── */}
        {userRole === 'admin' && isAddingItem && (
          <div className={`p-6 ${theme.bg.main}`}>
            <div className={`p-6 rounded-lg border animate-in fade-in zoom-in-95 duration-200 ${COMMON_STYLES.card(isDarkMode)}`}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {/* name */}
                <input
                  placeholder="Name"
                  className={`w-full ${COMMON_STYLES.input(isDarkMode)}`}
                  value={newItem.name}
                  onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                />
                {/* price */}
                <input
                  placeholder="Price (₹)"
                  type="number"
                  className={`w-full ${COMMON_STYLES.input(isDarkMode)}`}
                  value={newItem.price}
                  onChange={e => setNewItem({ ...newItem, price: e.target.value })}
                />
                {/* category (existing or new) */}
                <div className="relative col-span-2 md:col-span-2">
                  {isCreatingCategory ? (
                    <div className="flex gap-2">
                      <input
                        placeholder="New category"
                        className={`w-full flex-1 ${COMMON_STYLES.input(isDarkMode)}`}
                        value={newItem.category}
                        onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                        autoFocus
                      />
                      <button
                        onClick={() => { setIsCreatingCategory(false); setNewItem({ ...newItem, category: '' }); }}
                        className={`px-3 py-2 rounded-lg transition-colors ${theme.button.ghost}`}
                      >
                        <XIcon size={20} />
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <select
                        className={`w-full ${COMMON_STYLES.select(isDarkMode)}`}
                        value={newItem.category}
                        onChange={e => {
                          if (e.target.value === '__NEW__') { setIsCreatingCategory(true); setNewItem({ ...newItem, category: '' }); }
                          else setNewItem({ ...newItem, category: e.target.value });
                        }}
                      >
                        <option value="" disabled>Category</option>
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        <option value="__NEW__">+ Add New</option>
                      </select>
                      <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${theme.text.secondary}`} size={16} />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => { setIsAddingItem(false); setIsCreatingCategory(false); }}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${theme.button.secondary}`}
                >Cancel</button>
                <button onClick={handleAdminAddProduct} className={`px-8 py-2 rounded-lg font-medium transition-colors ${theme.button.primary}`}>Save</button>
              </div>
            </div>
          </div>
        )}

        {/* ── ADMIN: product table ── */}
        {userRole === 'admin' && !isAddingItem && (
          <div className={`flex-1 overflow-y-auto p-6 ${theme.bg.main}`}>

            {/* header row: title + add button */}
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-sm font-semibold ${theme.text.main}`}>Products</h3>
              <button
                onClick={() => setIsAddingItem(true)}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all active:scale-[0.97] ${theme.button.primary}`}
              >
                <Plus size={16} strokeWidth={2.5} /> Add Product
              </button>
            </div>

            {rawProducts.length === 0 ? (
              /* empty state */
              <div className={`rounded-lg border flex flex-col items-center justify-center py-16 ${COMMON_STYLES.card(isDarkMode)}`}>
                <div className={`p-4 rounded-xl mb-4 ${theme.bg.subtle}`}>
                  <Plus size={28} className={theme.text.secondary} />
                </div>
                <p className={`text-sm font-medium mb-1 ${theme.text.main}`}>No products yet</p>
                <p className={`text-xs mb-4 ${theme.text.secondary}`}>Click the button above to add your first item</p>
                <button
                  onClick={() => setIsAddingItem(true)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${theme.button.primary}`}
                >
                  <Plus size={15} strokeWidth={2.5} /> Add Product
                </button>
              </div>
            ) : (
              <div className={`rounded-lg overflow-hidden ${COMMON_STYLES.card(isDarkMode)}`}>
                <table className="w-full text-left">
                  <thead className={COMMON_STYLES.tableHeader(isDarkMode)}>
                    <tr>
                      <th className="p-4 pl-6 font-medium">Name</th>
                      <th className="p-4 font-medium">Category</th>
                      <th className="p-4 font-medium">Price</th>
                      <th className="p-4 text-right pr-6 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rawProducts.map(p => (
                      <tr key={p.id} className={COMMON_STYLES.tableRow(isDarkMode)}>
                        <td className={`p-4 pl-6 font-medium ${theme.text.main}`}>{p.name}</td>
                        <td className="p-4"><span className={COMMON_STYLES.badge(isDarkMode)}>{p.category}</span></td>
                        <td className={`p-4 font-mono ${theme.text.main}`}>₹{p.price}</td>
                        <td className="p-4 text-right pr-6">
                          <button onClick={() => handleAdminDeleteProduct(p.id)} className={`p-2 rounded-lg transition-colors outline-none ${theme.button.ghost}`}>
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── CASHIER: product grid ── */}
        {userRole !== 'admin' && (
          <div className={`flex-1 overflow-y-auto p-6 ${theme.bg.main}`}>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  className={`rounded-lg border p-5 relative overflow-hidden group transition-all flex flex-col
                    ${COMMON_STYLES.card(isDarkMode)} ${theme.border.hover}`}
                >
                  {/* category badge */}
                  <span className={`absolute top-4 left-4 ${COMMON_STYLES.badge(isDarkMode)} uppercase text-[10px]`}>
                    {product.category}
                  </span>

                  {/* name */}
                  <div className="mt-8 flex-1">
                    <h3 className={`text-base font-semibold line-clamp-2 ${theme.text.main}`}>{product.name}</h3>
                  </div>

                  {/* price row + add button */}
                  <div className="flex items-end justify-between mt-4">
                    <div>
                      <p className={`text-xs font-medium mb-0.5 ${theme.text.secondary}`}>Price</p>
                      <p className={`text-xl font-semibold font-mono ${theme.text.main}`}>₹{product.price}</p>
                    </div>
                    <button
                      onClick={() => onAddToCart(product)}
                      className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-1.5 transition-all active:scale-[0.96] ${theme.button.primary}`}
                    >
                      <Plus size={16} strokeWidth={2.5} /> Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════ RIGHT – CART (cashier only) ═══════════════ */}
      {userRole !== 'admin' && (
        <div className={`w-96 border-l flex flex-col ${theme.bg.card} ${theme.border.default}`}>

          {/* cart header */}
          <div className={`p-6 border-b flex items-center justify-between ${theme.border.default}`}>
            <div className="flex items-center gap-3">
              <ShoppingCart size={22} className={theme.text.main} />
              <h2 className={`text-xl font-semibold ${theme.text.main}`}>Order</h2>
            </div>
            {/* token selector */}
            <div className={`px-3 py-1 rounded-lg border ${theme.border.default} ${theme.bg.subtle}`}>
              <span className={`text-xs font-medium uppercase mr-2 ${theme.text.secondary}`}>Token</span>
              <select
                value={selectedToken}
                onChange={e => onSetToken(e.target.value)}
                className={`font-semibold outline-none appearance-none cursor-pointer bg-transparent ${theme.text.main}`}
              >
                {availableTokens.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* cart items */}
          <div className={`flex-1 overflow-y-auto p-5 space-y-3 ${theme.bg.main}`}>
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[40vh] space-y-3">
                <ShoppingCart size={56} className={theme.text.muted} />
                <p className={`text-sm font-medium ${theme.text.secondary}`}>Cart is empty</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className={`border rounded-lg p-4 flex items-center justify-between transition-all ${COMMON_STYLES.card(isDarkMode)} ${theme.border.hover}`}>
                  <div className="flex-1 pr-4">
                    <h4 className={`font-medium text-sm ${theme.text.main}`}>{item.name}</h4>
                    <p className={`text-sm font-mono ${theme.text.secondary}`}>₹{item.price}</p>
                  </div>
                  <div className={`flex items-center gap-2 p-1 rounded-lg border ${theme.bg.main} ${theme.border.default}`}>
                    <button onClick={() => onRemoveFromCart(item)} className={`p-1.5 rounded transition-colors ${theme.button.ghost}`}>
                      {item.quantity === 1 ? <Trash2 size={16} /> : <Minus size={16} strokeWidth={2.5} />}
                    </button>
                    <span className={`font-semibold w-5 text-center text-sm ${theme.text.main}`}>{item.quantity}</span>
                    <button onClick={() => onAddToCart(item)} className={`p-1.5 rounded transition-colors ${theme.button.ghost}`}>
                      <Plus size={16} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* cart footer – totals + checkout */}
          <div className={`p-6 border-t ${theme.border.default} ${theme.bg.card}`}>
            <div className="space-y-3 mb-5">
              {/* subtotal */}
              <div className={`flex justify-between text-sm font-medium ${theme.text.secondary}`}>
                <span>Subtotal</span>
                <span className="font-mono">₹{cartSubtotal}</span>
              </div>
              {/* discount */}
              <div className={`flex justify-between text-sm font-medium items-center ${theme.text.secondary}`}>
                <span>Discount</span>
                <input
                  type="number"
                  value={discount}
                  onChange={e => setDiscount(Math.max(0, e.target.value))}
                  className={`w-20 ${COMMON_STYLES.input(isDarkMode)} py-1 px-2 text-right font-mono text-sm`}
                />
              </div>
              {/* tax */}
              <div className={`flex justify-between text-sm font-medium ${theme.text.secondary}`}>
                <span>GST ({taxRate}%)</span>
                <span className="font-mono">₹{taxAmount.toFixed(2)}</span>
              </div>
              {/* grand total */}
              <div className={`flex justify-between font-semibold text-lg pt-3 border-t ${theme.text.main} ${theme.border.default}`}>
                <span>Total</span>
                <span className="font-mono">₹{grandTotal}</span>
              </div>
            </div>

            {/* checkout button */}
            <button
              onClick={onCheckout}
              disabled={cart.length === 0}
              className={`w-full py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]
                ${cart.length > 0 ? theme.button.primary : `${theme.bg.subtle} ${theme.text.muted} cursor-not-allowed`}`}
            >
              Checkout &amp; Call Token {selectedToken}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}