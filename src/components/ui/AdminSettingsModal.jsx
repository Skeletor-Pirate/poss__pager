import React, { useState, useEffect } from 'react';
import { X, Save, CreditCard, User } from 'lucide-react';

export default function AdminSettingsModal({ open, onClose, API_URL, restaurantId, isDarkMode }) {
  const [upiId, setUpiId] = useState("");
  const [payeeName, setPayeeName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      const fetchSettings = async () => {
        try { 
          const token = localStorage.getItem("auth_token");
          // Fetch from your DB
          const res = await fetch(`${API_URL}/settings`, { 
            headers: { Authorization: `Bearer ${token}` } 
          });

          if (res.ok) { 
            const data = await res.json();
            // Map DB columns (upi_id, payee_name) to state
            setUpiId(data.upi_id || ""); 
            setPayeeName(data.payee_name || ""); 
          }
        } catch (e) { console.error(e); }
      };
      fetchSettings();
    }
  }, [open, API_URL]);

  const handleSave = async () => {
    setLoading(true);
    try { 
      const token = localStorage.getItem("auth_token");
      
      // Using PUT to update your existing row
      const res = await fetch(`${API_URL}/settings`, { 
        method: "PUT", 
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, 
        body: JSON.stringify({ upiId, payeeName }) 
      });

      if (!res.ok) throw new Error("Failed to save settings. Server error.");
      
      alert("Settings Saved!");
      onClose();
    } catch (e) { 
      alert(e.message); 
    } finally { 
      setLoading(false); 
    }
  };

  if (!open) return null;

  const theme = {
    overlay: "bg-black/90 backdrop-blur-sm",
    panel: isDarkMode ? "bg-black border-zinc-800" : "bg-white border-slate-200",
    textMain: isDarkMode ? "text-white" : "text-slate-900",
    textSub: isDarkMode ? "text-zinc-400" : "text-slate-500",
    border: isDarkMode ? "border-zinc-800" : "border-slate-200",
    input: isDarkMode ? "bg-black border-zinc-800 text-white focus:border-zinc-600" : "bg-white border-slate-200 text-slate-900 focus:border-slate-400",
    buttonSec: isDarkMode ? "text-zinc-400 hover:text-white hover:bg-zinc-900" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100",
    buttonPri: isDarkMode ? "bg-white text-black hover:bg-zinc-200" : "bg-black text-white hover:bg-zinc-800"
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 font-sans ${theme.overlay}`}>
      <div className={`w-full max-w-sm rounded-2xl shadow-2xl border ${theme.panel}`}>
        <div className={`p-6 border-b flex justify-between items-center ${theme.border}`}>
            <h2 className={`text-lg font-bold ${theme.textMain}`}>System Settings</h2>
            <button onClick={onClose} className={`p-2 rounded-lg ${theme.buttonSec}`}><X size={20} /></button>
        </div>
        <div className="p-6 space-y-5">
            <div>
                <label className={`block text-xs font-bold uppercase mb-2 ${theme.textSub}`}>UPI ID</label>
                <div className="relative">
                    <CreditCard className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme.textSub}`} size={18}/>
                    <input value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="merchant@upi" className={`w-full pl-10 pr-4 py-3 rounded-xl outline-none border font-medium ${theme.input}`} />
                </div>
            </div>
            <div>
                <label className={`block text-xs font-bold uppercase mb-2 ${theme.textSub}`}>Payee Name</label>
                <div className="relative">
                    <User className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme.textSub}`} size={18}/>
                    <input value={payeeName} onChange={(e) => setPayeeName(e.target.value)} placeholder="Business Name" className={`w-full pl-10 pr-4 py-3 rounded-xl outline-none border font-medium ${theme.input}`} />
                </div>
            </div>
        </div>
        <div className={`p-6 border-t flex justify-end gap-3 ${theme.border}`}>
            <button onClick={onClose} className={`px-5 py-2.5 rounded-xl font-bold text-sm ${theme.buttonSec}`}>Cancel</button>
            <button onClick={handleSave} disabled={loading} className={`px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 ${theme.buttonPri}`}>
                <Save size={18}/> {loading ? "Saving..." : "Save Changes"}
            </button>
        </div>
      </div>
    </div>
  );
}