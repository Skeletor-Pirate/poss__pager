import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Loader, CreditCard, Banknote, Smartphone } from 'lucide-react';

export default function CheckoutModal({ isOpen, onClose, onConfirm, cartSubtotal, taxAmount, discount, grandTotal, orderId, isDarkMode, backendUpiData }) {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => { if (isOpen) { setPaymentMethod('cash'); setIsProcessing(false); } }, [isOpen]);
  if (!isOpen) return null;

  const handleConfirm = async () => { setIsProcessing(true); await onConfirm({ paymentMethod }); setIsProcessing(false); };

  const theme = {
    overlay: "bg-black/90 backdrop-blur-sm",
    panel: isDarkMode ? "bg-black border-zinc-800" : "bg-white border-slate-200",
    textMain: isDarkMode ? "text-white" : "text-slate-900",
    textSub: isDarkMode ? "text-zinc-400" : "text-slate-500",
    border: isDarkMode ? "border-zinc-800" : "border-slate-200",
    card: isDarkMode ? "bg-zinc-900" : "bg-slate-50",
    iconBtn: isDarkMode ? "hover:bg-zinc-900 text-zinc-400" : "hover:bg-slate-100 text-slate-500",
    activeMethod: isDarkMode ? "bg-white text-black border-white" : "bg-slate-900 text-white border-slate-900",
    inactiveMethod: isDarkMode ? "bg-black border-zinc-800 text-zinc-400 hover:border-zinc-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50",
  };

  // ✅ RENDER QR CODE IF BACKEND SENT IT
  if (backendUpiData) {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 font-sans ${theme.overlay}`}>
        <div className={`w-full max-w-sm rounded-2xl shadow-2xl relative p-8 flex flex-col items-center text-center border ${theme.panel}`}>
          <button onClick={onClose} className={`absolute top-4 right-4 p-2 rounded-lg ${theme.iconBtn}`}><X size={24} /></button>
          <h2 className={`text-xl font-semibold mb-6 ${theme.textMain}`}>Payment</h2>
          
          <div className="bg-white p-4 rounded-xl mb-6 shadow-lg">
              {/* Display the QR Code image sent by backend */}
              <img src={backendUpiData.qr} alt="UPI QR" className="w-48 h-48 object-contain" />
          </div>
          
          <p className={`text-base font-medium mb-1 ${theme.textMain}`}>{backendUpiData.payee || "Scan to Pay"}</p>
          <p className={`text-3xl font-semibold mb-8 ${theme.textMain}`}>₹{grandTotal}</p>
          
          <button onClick={onClose} className="w-full py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 bg-green-600 text-white hover:bg-green-500">
            <CheckCircle size={20} /> Payment Done
          </button>
        </div>
      </div>
    );
  }

  // STANDARD CHECKOUT FORM
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 font-sans ${theme.overlay}`}>
      <div className={`w-full max-w-md rounded-2xl shadow-2xl flex flex-col border ${theme.panel}`}>
        <div className={`p-6 flex justify-between items-center border-b ${theme.border}`}>
            <div><h2 className={`text-xl font-semibold ${theme.textMain}`}>Checkout</h2><p className={`text-sm font-medium mt-1 ${theme.textSub}`}>Order #{orderId}</p></div>
            <button onClick={onClose} className={`p-2 rounded-lg ${theme.iconBtn}`}><X size={24} /></button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className={`p-5 rounded-xl border space-y-2 ${theme.border} ${theme.card}`}>
            <div className={`flex justify-between text-sm font-medium ${theme.textSub}`}><span>Subtotal</span><span>₹{cartSubtotal}</span></div>
            <div className={`flex justify-between text-sm font-medium ${theme.textSub}`}><span>Discount</span><span>-₹{discount}</span></div>
            <div className={`flex justify-between text-sm font-medium ${theme.textSub}`}><span>Tax</span><span>₹{Math.round(taxAmount)}</span></div>
            <div className={`flex justify-between text-xl font-semibold pt-4 mt-2 border-t ${theme.border} ${theme.textMain}`}><span>Total</span><span>₹{grandTotal}</span></div>
          </div>
          
          <div>
            <label className={`block text-xs font-medium uppercase mb-3 ${theme.textSub}`}>Payment Method</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                  { id: 'cash', icon: Banknote, label: 'Cash' }, 
                  { id: 'upi', icon: Smartphone, label: 'UPI' }, 
                  { id: 'card', icon: CreditCard, label: 'Card' }
              ].map((m) => (
                <button key={m.id} onClick={() => setPaymentMethod(m.id)} className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-all ${paymentMethod === m.id ? theme.activeMethod : theme.inactiveMethod}`}>
                  <m.icon size={24} className="mb-2"/>
                  <span className="text-xs font-bold uppercase">{m.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          <button onClick={handleConfirm} disabled={isProcessing} className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-95 ${isProcessing ? 'bg-zinc-800 text-zinc-500' : 'bg-blue-600 text-white hover:bg-blue-500'}`}>
             {isProcessing ? <Loader className="animate-spin" /> : "Confirm Order"}
          </button>
        </div>
      </div>
    </div>
  );
}