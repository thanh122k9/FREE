import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDoc, collection, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Link2, Type, AlignLeft, DollarSign, Image as ImageIcon, Send, Sparkles, AlertCircle, ShieldAlert } from 'lucide-react';
import { extractProductInfo } from '../services/geminiService';
import { motion } from 'motion/react';

export default function AddProduct() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    setLoading(true);
    try {
      await addDoc(collection(db, 'products'), {
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName,
        userPhoto: auth.currentUser.photoURL,
        url,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('Đã có lỗi khi gửi yêu cầu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto pb-32 pt-6">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[32px] elegant-card overflow-hidden p-8 sm:p-10"
      >
        <div className="text-center relative">
          <div className="w-16 h-16 bg-slate-950 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl relative z-10">
            <Link2 className="w-8 h-8" />
          </div>
          
          <div className="space-y-1.5 mb-8 relative z-10">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Đề xuất Link</h1>
            <p className="text-slate-400 font-medium text-[12px]">Hệ thống gửi tự động LinkRegistry™</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-xl flex items-center gap-3 text-left"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-[12px] font-bold">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-2 text-left">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">Địa chỉ liên kết đích</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center">
                  <Link2 className="text-slate-300 w-5 h-5 group-hover:text-indigo-500 transition-colors" />
                </div>
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white outline-none transition-all text-[14px] font-medium text-slate-950 placeholder:text-slate-300"
                  placeholder="https://shopee.vn/product/..."
                />
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || !url}
              className="w-full bg-slate-950 text-white py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50 shadow-lg"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Gửi xét duyệt
                </>
              )}
            </motion.button>
            
            <div className="pt-6 border-t border-slate-50 flex items-center justify-center gap-2">
               <ShieldAlert className="w-4 h-4 text-slate-300" />
               <p className="text-[10px] text-slate-300 font-medium">Bảo mật & Tự động hóa bởi LinkPro AI</p>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
