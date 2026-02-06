
import React, { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  Box,
  X as XIcon,
} from "lucide-react";
import { getTheme, COMMON_STYLES, FONTS } from "./theme";

export default function POSView({
  menu,
  categories,
  cart,
  orders,
  selectedCategory,
  setSelectedCategory,
  availableTokens,
  selectedToken,
  onSetToken,
  onAddToCart,
  onRemoveFromCart,
  onCheckout,
  userRole,
  isDarkMode,
  discount,
  setDiscount,
  taxRate,

  /* admin props */
  isAddingItem,
  setIsAddingItem,
  newItem,
  setNewItem,
  isCreatingCategory,
  setIsCreatingCategory,
  handleAdminAddProduct,
  handleAdminDeleteProduct,
  rawProducts,
}) {
  const theme = getTheme(isDarkMode);
  const [search, setSearch] = useState("");

  /* ===========================
     FILTERED PRODUCTS (cashier)
     =========================== */
  const filteredProducts = useMemo(() => {
    let list = [];
    if (selectedCategory === "All") {
      Object.values(menu).forEach(arr => (list = list.concat(arr)));
    } else {
      list = menu[selectedCategory] || [];
    }
    if (search) {
      list = list.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    return list;
  }, [menu, selectedCategory, search]);

  /* cart totals */
  const cartSubtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const taxAmount = Math.max(0, cartSubtotal - discount) * (taxRate / 100);
  const grandTotal = Math.round(Math.max(0, cartSubtotal - discount) + taxAmount);

  /* ===========================
     RENDER
     =========================== */
  return (
    <div
      className={`flex h-full ${theme.bg.main} ${theme.text.main}`}
      style={{ fontFamily: FONTS.sans }}
    >
      {/* ═══════════════ LEFT – MENU ═══════════════ */}
      <div className={`flex-1 flex flex-col border-r ${theme.border.default} ${theme.bg.main}`}>

        {/* Search + Horizontal Category Tabs */}
        <div className={`p-4 border-b ${theme.border.default} space-y-3`}>
          {/* Search */}
          <div className="relative max-w-2xl">
            <Search
              size={18}
              className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme.text.secondary}`}
            />
            <input
              className={`w-full pl-10 ${COMMON_STYLES.input(isDarkMode)}`}
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Horizontal Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {["All", ...categories].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-all
                  ${selectedCategory === cat
                    ? `${theme.bg.active} ${theme.text.main}`
                    : `${theme.button.ghost}`
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ===========================
            ADMIN ADD PRODUCT FORM
           =========================== */}
        {userRole === "admin" && isAddingItem && (
          <div className="p-6">
            <div className={`${COMMON_STYLES.card(isDarkMode)} p-6 space-y-4`}>
              <div className="grid grid-cols-4 gap-4">
                <input
                  className={COMMON_STYLES.input(isDarkMode)}
                  placeholder="Product name"
                  value={newItem.name}
                  onChange={e =>
                    setNewItem({ ...newItem, name: e.target.value })
                  }
                />
                <input
                  type="number"
                  className={COMMON_STYLES.input(isDarkMode)}
                  placeholder="Price"
                  value={newItem.price}
                  onChange={e =>
                    setNewItem({ ...newItem, price: e.target.value })
                  }
                />
                <input
                  type="number"
                  className={COMMON_STYLES.input(isDarkMode)}
                  placeholder="Stock"
                  value={newItem.stock}
                  onChange={e =>
                    setNewItem({ ...newItem, stock: e.target.value })
                  }
                />

                {isCreatingCategory ? (
                  <input
                    className={COMMON_STYLES.input(isDarkMode)}
                    placeholder="New category"
                    value={newItem.category}
                    onChange={e =>
                      setNewItem({ ...newItem, category: e.target.value })
                    }
                  />
                ) : (
                  <select
                    className={COMMON_STYLES.select(isDarkMode)}
                    value={newItem.category}
                    onChange={e => {
                      if (e.target.value === "__new__") {
                        setIsCreatingCategory(true);
                        setNewItem({ ...newItem, category: "" });
                      } else {
                        setNewItem({ ...newItem, category: e.target.value });
                      }
                    }}
                  >
                    <option value="">Category</option>
                    {categories.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="__new__">+ New</option>
                  </select>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  className={theme.button.secondary}
                  onClick={() => {
                    setIsAddingItem(false);
                    setIsCreatingCategory(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  className={theme.button.primary}
                  onClick={handleAdminAddProduct}
                >
                  Save Product
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===========================
            ADMIN PRODUCT TABLE
           =========================== */}
        {userRole === "admin" && !isAddingItem && (
          <div className="flex-1 overflow-auto p-6">
            
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
              <table className="w-full border-collapse">
                <thead className={COMMON_STYLES.tableHeader(isDarkMode)}>
                  <tr>
                    <th className="text-left p-4">Name</th>
                    <th className="text-left p-4">Category</th>
                    <th className="text-left p-4">Stock</th>
                    <th className="text-left p-4">Price</th>
                    <th className="text-right p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rawProducts.map(p => (
                    <tr
                      key={p.id}
                      className={COMMON_STYLES.tableRow(isDarkMode)}
                    >
                      <td className="p-4 font-medium">{p.name}</td>
                      <td className="p-4">
                        <span className={COMMON_STYLES.badge(isDarkMode)}>
                          {p.category}
                        </span>
                      </td>
                      <td className="p-4 flex items-center gap-2">
                        <Box size={14} />
                        {p.stock}
                      </td>
                      <td className="p-4 font-mono">₹{p.price}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleAdminDeleteProduct(p.id)}
                          className={theme.button.ghost}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ═══════════════ CASHIER GRID ═══════════════ */}
        {userRole !== "admin" && (
          <div className="flex-1 overflow-auto p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
              {filteredProducts.map(p => (
                <div
                  key={p.id}
                  className={`${COMMON_STYLES.card(isDarkMode)} p-4 flex flex-col border ${theme.border.hover} transition-all rounded-lg`}
                >
                  <span className={`${COMMON_STYLES.badge(isDarkMode)} text-[10px] mb-2`}>
                    {p.category}
                  </span>
                  <h3 className="font-semibold text-sm mb-1 line-clamp-2">{p.name}</h3>
                  <div className={`text-xs flex items-center gap-1 mb-3 ${theme.text.secondary}`}>
                    <Box size={12} /> {p.stock}
                  </div>
                  <div className="mt-auto flex items-center justify-between gap-2">
                    <span className="font-mono text-base font-semibold">₹{p.price}</span>
                    <button
                      disabled={p.stock <= 0}
                      onClick={() => onAddToCart(p)}
                      className={`px-2 py-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-all active:scale-95 ${p.stock <= 0 ? `${theme.bg.subtle} ${theme.text.muted} cursor-not-allowed` : theme.button.primary}`}
                    >
                      <Plus size={14} strokeWidth={2.5} /> Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════ RIGHT – CART (cashier only) ═══════════════ */}
      {userRole !== "admin" && (
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

