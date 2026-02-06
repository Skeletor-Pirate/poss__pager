import React, { useState, useMemo } from "react";
import { Search, Plus, Trash2, Box, Save, X, Edit3, Package } from "lucide-react";
import { getTheme, COMMON_STYLES, FONTS, TRANSITIONS } from "./theme";

export default function POSView({
  menu,
  categories,
  selectedCategory,
  setSelectedCategory,
  onAddToCart,
  userRole,
  isDarkMode,
  rawProducts,
  handleAdminAddProduct,
  handleAdminUpdateProduct,
  handleAdminDeleteProduct,
}) {
  const theme = getTheme(isDarkMode);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
  });

  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    price: "",
    stock: "",
    category: categories[0] || "General",
  });

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

  const handleSaveEdit = async () => {
    await handleAdminUpdateProduct(editingId, {
      name: editForm.name,
      price: Number(editForm.price),
      stock: Number(editForm.stock),
      category: editForm.category,
    });
    setEditingId(null);
  };

  const handleAddNewProduct = async () => {
    if (!newItem.name || !newItem.price || !newItem.stock) {
      alert("Please fill all fields");
      return;
    }
    await handleAdminAddProduct({
      name: newItem.name,
      price: Number(newItem.price),
      stock: Number(newItem.stock),
      category: newItem.category,
    });
    setIsAddingItem(false);
    setNewItem({
      name: "",
      price: "",
      stock: "",
      category: categories[0] || "General",
    });
  };

  return (
    <div className={`flex flex-col h-full ${theme.bg.main}`} style={{ fontFamily: FONTS.sans }}>
      {/* HEADER */}
      <div className={`p-6 border-b ${theme.border.default} space-y-4`}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 max-w-2xl flex items-center gap-3">
            <div className="relative flex-1">
              <Search size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme.text.tertiary}`} />
              <input
                className={`w-full pl-10 pr-4 py-2.5 ${COMMON_STYLES.input(isDarkMode)}`}
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <select
              className={`${COMMON_STYLES.select(isDarkMode)} min-w-[160px]`}
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {userRole === "admin" && (
            <button 
              onClick={() => setIsAddingItem(true)} 
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm ${theme.button.primary} ${TRANSITIONS.colors}`}
            >
              <Plus size={18} />
              Add Product
            </button>
          )}
        </div>

        {/* Product Count */}
        <div className={`text-sm ${theme.text.secondary}`}>
          {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
          {search && ` matching "${search}"`}
        </div>
      </div>

      {/* ADMIN TABLE */}
      {userRole === "admin" && !isAddingItem && (
        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead className={`sticky top-0 ${theme.bg.main} z-10`}>
              <tr className={`${COMMON_STYLES.tableHeader(isDarkMode)}`}>
                <th className="p-4 text-left font-medium">Product</th>
                <th className="p-4 text-left font-medium">Category</th>
                <th className="p-4 text-left font-medium">Stock</th>
                <th className="p-4 text-left font-medium">Price</th>
                <th className="p-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(p => {
                const editing = editingId === p.id;

                return (
                  <tr key={p.id} className={`${COMMON_STYLES.tableRow(isDarkMode)}`}>
                    <td className="p-4">
                      {editing ? (
                        <input
                          className={`${COMMON_STYLES.input(isDarkMode)} w-full`}
                          value={editForm.name}
                          onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                        />
                      ) : (
                        <span className="font-medium">{p.name}</span>
                      )}
                    </td>

                    <td className="p-4">
                      {editing ? (
                        <input
                          className={`${COMMON_STYLES.input(isDarkMode)} w-full`}
                          value={editForm.category}
                          onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                        />
                      ) : (
                        <span className={COMMON_STYLES.badge(isDarkMode)}>{p.category}</span>
                      )}
                    </td>

                    <td className="p-4">
                      {editing ? (
                        <input
                          type="number"
                          className={`${COMMON_STYLES.input(isDarkMode)} w-24`}
                          value={editForm.stock}
                          onChange={e => setEditForm({ ...editForm, stock: e.target.value })}
                        />
                      ) : (
                        <span className={`flex items-center gap-2 ${theme.text.secondary}`}>
                          <Package size={14} /> 
                          <span className={theme.text.main}>{p.stock}</span>
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      {editing ? (
                        <input
                          type="number"
                          className={`${COMMON_STYLES.input(isDarkMode)} w-24`}
                          value={editForm.price}
                          onChange={e => setEditForm({ ...editForm, price: e.target.value })}
                        />
                      ) : (
                        <span className="font-mono font-medium">₹{p.price}</span>
                      )}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        {editing ? (
                          <>
                            <button
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium ${theme.button.primary} ${TRANSITIONS.colors}`}
                              onClick={handleSaveEdit}
                            >
                              <Save size={14} />
                              Save
                            </button>
                            <button 
                              className={`p-1.5 rounded-md ${theme.button.ghost} ${TRANSITIONS.colors}`}
                              onClick={() => setEditingId(null)}
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium ${theme.button.secondary} ${TRANSITIONS.colors}`}
                              onClick={() => {
                                setEditingId(p.id);
                                setEditForm({
                                  name: p.name,
                                  price: String(p.price),
                                  stock: String(p.stock),
                                  category: p.category,
                                });
                              }}
                            >
                              <Edit3 size={14} />
                              Edit
                            </button>
                            <button 
                              className={`p-1.5 rounded-md ${theme.button.ghost} ${TRANSITIONS.colors}`}
                              onClick={() => handleAdminDeleteProduct(p.id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ADMIN ADD PRODUCT FORM */}
      {userRole === "admin" && isAddingItem && (
        <div className="flex-1 overflow-auto p-6">
          <div className={`max-w-2xl mx-auto ${COMMON_STYLES.card(isDarkMode)} p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Add New Product</h3>
              <button 
                onClick={() => setIsAddingItem(false)}
                className={`p-2 rounded-md ${theme.button.ghost}`}
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-xs font-medium uppercase mb-2 ${theme.text.secondary}`}>
                  Product Name
                </label>
                <input
                  className={`w-full ${COMMON_STYLES.input(isDarkMode)}`}
                  value={newItem.name}
                  onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="e.g., Margherita Pizza"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-medium uppercase mb-2 ${theme.text.secondary}`}>
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    className={`w-full ${COMMON_STYLES.input(isDarkMode)}`}
                    value={newItem.price}
                    onChange={e => setNewItem({ ...newItem, price: e.target.value })}
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className={`block text-xs font-medium uppercase mb-2 ${theme.text.secondary}`}>
                    Stock
                  </label>
                  <input
                    type="number"
                    className={`w-full ${COMMON_STYLES.input(isDarkMode)}`}
                    value={newItem.stock}
                    onChange={e => setNewItem({ ...newItem, stock: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-medium uppercase mb-2 ${theme.text.secondary}`}>
                  Category
                </label>
                <input
                  className={`w-full ${COMMON_STYLES.input(isDarkMode)}`}
                  value={newItem.category}
                  onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                  placeholder="e.g., Pizza"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsAddingItem(false)}
                  className={`flex-1 py-2.5 rounded-lg font-medium text-sm ${theme.button.secondary} ${TRANSITIONS.colors}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddNewProduct}
                  className={`flex-1 py-2.5 rounded-lg font-medium text-sm ${theme.button.primary} ${TRANSITIONS.colors}`}
                >
                  Add Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CASHIER GRID */}
      {userRole !== "admin" && (
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(p => (
              <div 
                key={p.id} 
                className={`
                  ${COMMON_STYLES.card(isDarkMode)} 
                  p-4 flex flex-col gap-3
                  ${p.stock <= 0 ? 'opacity-50' : ''}
                  ${TRANSITIONS.colors}
                `}
              >
                <div className="flex items-start justify-between">
                  <span className={COMMON_STYLES.badge(isDarkMode)}>{p.category}</span>
                  <span className={`flex items-center gap-1.5 text-xs ${theme.text.tertiary}`}>
                    <Package size={12} />
                    {p.stock}
                  </span>
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-base mb-1">{p.name}</h3>
                  <p className={`text-xl font-semibold font-mono ${theme.text.main}`}>
                    ₹{p.price}
                  </p>
                </div>

                <button
                  disabled={p.stock <= 0}
                  onClick={() => onAddToCart(p)}
                  className={`
                    w-full flex items-center justify-center gap-2 py-2.5 rounded-lg 
                    font-medium text-sm
                    ${theme.button.primary}
                    disabled:opacity-40 disabled:cursor-not-allowed
                    ${TRANSITIONS.colors}
                  `}
                >
                  <Plus size={16} />
                  {p.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className={`flex flex-col items-center justify-center h-full ${theme.text.tertiary}`}>
              <Package size={64} className="mb-4 opacity-20" />
              <p className="text-lg font-medium">No products found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}