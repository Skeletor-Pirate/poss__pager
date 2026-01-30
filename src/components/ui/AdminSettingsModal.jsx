import React, { useState, useEffect } from 'react';
import { X, Save, CreditCard } from 'lucide-react';

export default function AdminSettingsModal({ open, onClose, API_URL }) {
  const [upiId, setUpiId] = useState("");
  const [payeeName, setPayeeName] = useState("");
  const [loading, setLoading] = useState(false);

  // Load existing settings when modal opens
  useEffect(() => {
    if (open) {
      const fetchSettings = async () => {
        try {
          const token = localStorage.getItem("auth_token");
          const res = await fetch(`${API_URL}/settings`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setUpiId(data.upi_id || "");
            setPayeeName(data.payee_name || "");
          }
        } catch (e) {
          console.error("Failed to load settings", e);
        }
      };
      fetchSettings();
    }
  }, [open, API_URL]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      await fetch(`${API_URL}/settings`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ upi_id: upiId, payee_name: payeeName })
      });
      alert("Settings Saved!");
      onClose();
    } catch (e) {
      alert("Failed to save");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">System Settings</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X size={20} className="text-slate-500" />
            </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
            
            {/* UPI ID Input */}
            <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">UPI ID (For QR Code)</label>
                <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                    <input 
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="merchant@upi"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400"
                    />
                </div>
            </div>

            {/* Payee Name Input */}
            <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Payee Name</label>
                <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                    <input 
                        value={payeeName}
                        onChange={(e) => setPayeeName(e.target.value)}
                        placeholder="Business Name"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400"
                    />
                </div>
            </div>

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
            <button onClick={onClose} className="px-4 py-2 rounded-lg font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                Cancel
            </button>
            <button 
                onClick={handleSave} 
                disabled={loading}
                className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/30 flex items-center gap-2 active:scale-95 transition-all"
            >
                <Save size={18}/> {loading ? "Saving..." : "Save Changes"}
            </button>
        </div>

      </div>
    </div>
  );
}

// Simple Icon Component for User (to avoid extra imports if not needed, or just import User from lucide-react)
function UserIcon({ size, className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
        </svg>
    );
}