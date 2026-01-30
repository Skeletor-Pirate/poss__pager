import React, { useState, useEffect } from 'react';
import { X, CreditCard, Banknote, Smartphone, CheckCircle, Loader } from 'lucide-react';

export default function CheckoutModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  cartSubtotal, 
  taxAmount, 
  discount, 
  grandTotal, 
  orderId, 
  isDarkMode,
  backendUpiData 
}) {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPaymentMethod('cash');
      setIsProcessing(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsProcessing(true);
    // ✅ Always pass as Object
    await onConfirm({ paymentMethod: paymentMethod });
    setIsProcessing(false);
  };

  // ... (Rest of the UI remains the same, assuming it was working correctly)
  // I will just paste the return block briefly for completeness if you need it, 
  // but the logic above is the key fix.
  
  if (backendUpiData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
        <div className={`w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden relative ${isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}>
            <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-500/10 transition-colors z-10">
              <X className={isDarkMode ? "text-slate-400" : "text-slate-500"} size={24} />
            </button>
            <div className="p-8 flex flex-col items-center text-center">
                <h2 className={`text-2xl font-black mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Payment</h2>
                <div className="bg-white p-4 rounded-2xl shadow-lg mb-6">
                    <img src={backendUpiData.qr} alt="UPI QR" className="w-48 h-48 object-contain" />
                </div>
                <p className={`text-lg font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{backendUpiData.payee || "Merchant"}</p>
                <p className="text-4xl font-black text-green-500 mb-8">₹{grandTotal}</p>
                <button onClick={onClose} className="w-full py-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-green-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"><CheckCircle size={24} /> Payment Done</button>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className={`w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col ${isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}>
        <div className={`p-6 flex justify-between items-center border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <div><h2 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Checkout</h2><p className={`text-sm font-bold mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Order #{orderId}</p></div>
          <button onClick={onClose} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}><X size={24} /></button>
        </div>
        <div className="p-6 space-y-6">
          <div className={`p-5 rounded-2xl space-y-2 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50 border border-slate-100'}`}>
            <div className={`flex justify-between text-sm font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}><span>Subtotal</span><span>₹{cartSubtotal}</span></div>
            <div className={`flex justify-between text-sm font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}><span>Discount</span><span>-₹{discount}</span></div>
            <div className={`flex justify-between text-sm font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}><span>Tax</span><span>₹{Math.round(taxAmount)}</span></div>
            <div className={`flex justify-between text-2xl font-black pt-4 mt-2 border-t ${isDarkMode ? 'border-slate-700 text-white' : 'border-slate-200 text-slate-900'}`}><span>Total</span><span className="text-blue-500">₹{grandTotal}</span></div>
          </div>
          <div>
            <label className={`block text-xs font-bold uppercase mb-3 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Payment Method</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'cash', icon: Banknote, label: 'Cash' },
                { id: 'upi', icon: Smartphone, label: 'UPI' },
                { id: 'card', icon: CreditCard, label: 'Card' }
              ].map((m) => (
                <button key={m.id} onClick={() => setPaymentMethod(m.id)} className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 font-bold gap-2 ${paymentMethod === m.id ? 'border-blue-500 bg-blue-500/10 text-blue-500' : isDarkMode ? 'border-slate-800 bg-slate-800/50 text-slate-400 hover:border-slate-600 hover:bg-slate-800' : 'border-slate-100 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-600'}`}>
                  <m.icon size={24} /><span className="text-sm">{m.label}</span>
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleConfirm} disabled={isProcessing} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-lg shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:shadow-none flex justify-center items-center gap-2">{isProcessing ? <Loader className="animate-spin" /> : "Confirm Payment"}</button>
        </div>
      </div>
    </div>
  );
}