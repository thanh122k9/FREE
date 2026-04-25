import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Trophy, User, Clock, CheckCircle2, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Payout {
  id: string;
  userName?: string;
  userPhoto?: string;
  adminQuotePrice?: string;
  updatedAt: string;
  status: string;
}

export default function PublicPayouts() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 2000);

    const q = query(
      collection(db, 'products'),
      where('status', '==', 'completed'),
      orderBy('updatedAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      clearTimeout(timeoutId);
      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Payout[];
      setPayouts(docs);
      setLoading(false);
    }, (error) => {
      clearTimeout(timeoutId);
      console.error("Firestore error in Payouts:", error);
      setLoading(false);
    });

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-10 pb-32 pt-10 px-4">
      <header className="text-center space-y-6">
        <motion.div
           initial={{ scale: 0.9, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           className="inline-flex items-center justify-center w-24 h-24 bg-slate-950 text-white rounded-[32px] shadow-2xl border-4 border-white mx-auto relative group"
        >
          <Trophy className="w-10 h-10 relative z-10" />
        </motion.div>
        
        <div className="space-y-2">
          <div className="flex flex-col -space-y-0.5">
             <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Danh sách các đơn</h1>
             <span className="text-[11px] font-medium text-slate-400">Những đơn hàng đã được duyệt</span>
          </div>
          <div className="flex items-center justify-center gap-2 pt-2">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cập nhật gần nhất</p>
          </div>
        </div>
      </header>

      {payouts.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[32px] p-20 text-center elegant-card"
        >
           <TrendingUp className="w-16 h-16 text-slate-100 mx-auto mb-4" />
           <p className="text-slate-300 font-medium text-[12px]">Đang tải danh sách...</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {payouts.map((payout, index) => (
              <motion.div
                key={payout.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group elegant-card rounded-[24px] p-4 flex items-center gap-4"
              >
                {/* Ranking index */}
                <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                  index < 3 ? 'bg-slate-950 text-white shadow-lg' : 'bg-slate-50 text-slate-400'
                }`}>
                  {index + 1}
                </div>
                
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border-2 border-white shadow-sm shrink-0 overflow-hidden">
                    {payout.userPhoto ? (
                      <img src={payout.userPhoto} alt={payout.userName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-200">
                        <User className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-slate-900 text-[14px] truncate">{payout.userName || 'Creator'}</span>
                    <span className="text-slate-400 text-[10px] font-medium">{new Date(payout.updatedAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <span className="text-indigo-600 font-bold text-lg tracking-tight">+{payout.adminQuotePrice || '0'}</span>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">Đã chuyển</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
      
      <div className="text-center py-10 opacity-20">
         <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-950">Hội trường vinh danh LinkPro</p>
      </div>
    </div>
  );
}
