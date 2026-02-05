import React, { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Trash2,
  Box,
  ChevronDown,
} from "lucide-react";
import { getTheme, COMMON_STYLES, FONTS } from "./theme";

export default function POSView({
  menu,
  categories,
  cart,
  orders,
  selectedCategory,
  setSelectedCategory,
  onAddToCart,
  userRole,
  isDarkMode,

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

  /* ===========================
     HEADER
     =========================== */
  return (
    <div
      className={`flex flex-col h-full ${theme.bg.main} ${theme.text.main}`}
      style={{ fontFamily: FONTS.sans }}
    >
      {/* Top Bar */}
      <div
        className={`flex items-center justify-between p-6 border-b ${theme.border.default}`}
      >
        <div className="flex items-center gap-4 w-full max-w-xl">
          <div className="relative flex-1">
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

          <select
            className={COMMON_STYLES.select(isDarkMode)}
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {userRole === "admin" && (
          <button
            onClick={() => setIsAddingItem(true)}
            className={theme.button.primary}
          >
            + Add Product
          </button>
        )}
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
              {rawProducts.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="p-8 text-center text-sm opacity-60"
                  >
                    No products added yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ===========================
          CASHIER GRID
         =========================== */}
      {userRole !== "admin" && (
        <div className="p-6 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(p => (
            <div
              key={p.id}
              className={`${COMMON_STYLES.card(isDarkMode)} p-4 flex flex-col`}
            >
              <span className={COMMON_STYLES.badge(isDarkMode)}>
                {p.category}
              </span>
              <h3 className="mt-2 font-semibold">{p.name}</h3>
              <div className="text-sm opacity-70">Stock: {p.stock}</div>
              <div className="mt-auto flex items-center justify-between">
                <span className="font-mono text-lg">₹{p.price}</span>
                <button
                  disabled={p.stock <= 0}
                  onClick={() => onAddToCart(p)}
                  className={theme.button.primary}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}