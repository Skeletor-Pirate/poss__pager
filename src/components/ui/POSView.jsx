import React, { useState, useEffect, useMemo } from "react";
import { Plus, Edit2, LogOut } from "lucide-react";

export default function POSView({
  menuItems = [],
  categories = [],
  cart = [],
  userRole,
  userName,
  isAdmin = false,

  onAddToCart = () => {},
  onEdit = () => {},
  onAddNew = () => {},
  onLogout = () => {},

  theme = {},
  isDarkMode = false
}) {
  const safeTheme = {
    bgCard: theme.bgCard || "bg-white",
    border: theme.border || "border-stone-200",
    textMain: theme.textMain || "text-black",
  };

  const [selectedCategory, setSelectedCategory] = useState(categories[0] || "");

  useEffect(() => {
    if (!selectedCategory && categories.length > 0) {
      setSelectedCategory(categories[0]);
    }
  }, [categories]);

  const displayItems = useMemo(() => {
    const filtered = menuItems.filter(i => i.category === selectedCategory);

    if (isAdmin) {
      return [{ id: "__add__", isAddButton: true }, ...filtered];
    }

    return filtered;
  }, [menuItems, selectedCategory, isAdmin]);

  return (
    <div className="h-screen flex flex-col bg-stone-50">

      {/* HEADER */}
      <div className={`${safeTheme.bgCard} border-b ${safeTheme.border} p-4 flex justify-between items-center`}>
        <div>
          <h1 className="font-bold text-lg">POS System</h1>
          <p className="text-xs opacity-60">{userName} ({userRole})</p>
        </div>
        <button onClick={onLogout} className="text-red-500">
          <LogOut size={18} />
        </button>
      </div>

      {/* CATEGORIES */}
      <div className="flex gap-2 p-2 overflow-x-auto">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded text-sm ${
              selectedCategory === cat ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* GRID */}
      <div className="flex-1 p-4 grid grid-cols-2 md:grid-cols-4 gap-4 overflow-y-auto">

        {displayItems.map(item => {
          if (item.isAddButton) {
            return (
              <div
                key="add"
                onClick={onAddNew}
                className="border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500"
              >
                <Plus size={32} />
                <span>Add Product</span>
              </div>
            );
          }

          return (
            <div
              key={item.id}
              onClick={() => isAdmin ? onEdit(item) : onAddToCart(item)}
              className="border rounded-xl p-3 cursor-pointer hover:shadow flex flex-col"
            >
              <div className="font-bold">{item.name}</div>
              <div className="text-sm opacity-70">₹{item.price}</div>
              <div className="text-xs opacity-50">{item.category}</div>

              <div className="mt-auto text-xs text-blue-600">
                {isAdmin ? <span className="flex items-center gap-1"><Edit2 size={12}/> Modify</span> : "Add to cart"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
