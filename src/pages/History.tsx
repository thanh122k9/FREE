import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { ExternalLink, Clock, User, Link as LinkIcon, Loader2, Edit3, ShoppingCart, CheckCircle2, XCircle, Trash2, Ban } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Product {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  url: string;
  status: 'pending' | 'quoted' | 'purchased' | 'completed' | 'rejected';
  adminQuotePrice?: string;
  adminQuoteLink?: string;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}

const statusConfig = {
  pending: { label: 'Đang chờ duyệt', color: 'bg-amber-50 text-amber-600 border-amber-100' },
  quoted: { label: 'Chờ mua', color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
  purchased: { label: 'Đã mua - Chờ duyệt', color: 'bg-blue-50 text-blue-600 border-blue-100' },
  completed: { label: 'Hoàn tất', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  rejected: { label: 'Bị từ chối', color: 'bg-rose-50 text-rose-600 border-rose-100' },
};

export default function History() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [actingOn, setActingOn] = useState<string | null>(null);
  const [quotingId, setQuotingId] = useState<string | null>(null);
  const [quotePrice, setQuotePrice] = useState('');
  const [quoteLink, setQuoteLink] = useState('');

  useEffect(() => {
    async function checkAdmin() {
      if (auth.currentUser) {
        const docRef = doc(db, 'users', auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (auth.currentUser.email === 'truongthanh.nongtruong@gmail.com' || (docSnap.exists() && docSnap.data().role === 'admin')) {
          setIsAdmin(true);
        }
      }
    }
    checkAdmin();
  }, []);

  useEffect(() => {
    const qProducts = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribeProducts = onSnapshot(qProducts, (snapshot) => {
      let docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      
      if (!isAdmin && auth.currentUser) {
        docs = docs.filter(d => d.userId === auth.currentUser?.uid);
      }
      
      setProducts(docs);
      setLoading(false);
    });

    return () => unsubscribeProducts();
  }, [isAdmin, auth.currentUser?.uid]);

  const handleMarkBought = async (productId: string) => {
    setActingOn(productId);
    try {
      await updateDoc(doc(db, 'products', productId), {
        status: 'purchased',
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setActingOn(null);
    }
  };

  const handleAdminQuote = async (productId: string) => {
    if (!quotePrice) return;
    setActingOn(productId);
    try {
      await updateDoc(doc(db, 'products', productId), {
        status: 'quoted',
        adminQuotePrice: quotePrice,
        adminQuoteLink: quoteLink || null,
        updatedAt: new Date().toISOString(),
      });
      setQuotingId(null);
      setQuotePrice('');
      setQuoteLink('');
    } catch (err) {
      console.error(err);
    } finally {
      setActingOn(null);
    }
  };

  const handleAdminComplete = async (productId: string) => {
    setActingOn(productId);
    try {
      await updateDoc(doc(db, 'products', productId), {
        status: 'completed',
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setActingOn(null);
    }
  };

  const handleAdminReject = async (productId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn từ chối yêu cầu này?')) return;
    setActingOn(productId);
    try {
      await updateDoc(doc(db, 'products', productId), {
        status: 'rejected',
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setActingOn(null);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm('Hành động này không thể hoàn tác. Xóa yêu cầu này?')) return;
    setActingOn(productId);
    try {
      await deleteDoc(doc(db, 'products', productId));
    } catch (err) {
      console.error(err);
    } finally {
      setActingOn(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-32 pt-6 px-4">
      <div className="flex flex-col -space-y-0.5">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          {isAdmin ? 'Quản trị hệ thống' : 'Lịch sử đề xuất'}
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
        </h1>
        <span className="text-[11px] font-medium text-slate-400">
          {isAdmin ? 'Bảng điều khiển kiểm soát LinkRegistry™' : 'Danh sách các liên kết bạn đã gửi'}
        </span>
      </div>

      {products.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 bg-white rounded-[32px] elegant-card"
        >
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
             <LinkIcon className="w-8 h-8 text-slate-200" />
          </div>
          <h2 className="text-[13px] font-medium text-slate-400">Hiện chưa có dữ liệu nào</h2>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          <AnimatePresence mode="popLayout">
            {products.map((product, idx) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group elegant-card rounded-[24px] p-5 flex flex-col gap-4"
              >
                {/* Status & Date */}
                <div className="flex items-center justify-between">
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusConfig[product.status].color}`}>
                    {statusConfig[product.status].label}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-medium">{new Date(product.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-lg">
                     <LinkIcon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Liên kết</p>
                    <a 
                      href={product.url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-slate-900 font-bold text-[14px] truncate block hover:text-indigo-600 transition-colors"
                    >
                      {product.url}
                    </a>
                  </div>
                </div>

                {/* Admin Quote Section */}
                {(product.status === 'quoted' || product.status === 'purchased' || product.status === 'completed') && product.adminQuotePrice && (
                  <div className="bg-slate-950 rounded-[24px] p-4 space-y-3 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                    
                    {product.adminQuoteLink && (
                      <a 
                        href={product.adminQuoteLink} 
                        target="_blank" 
                        rel="noreferrer"
                        className="w-full bg-white text-slate-950 font-black py-4 rounded-[18px] text-[13px] flex items-center justify-center gap-2 transition-all hover:bg-slate-50 uppercase tracking-[0.1em] shadow-xl"
                      >
                        MỞ LINK MUA
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}

                    <div className="w-full bg-white text-slate-950 font-black py-4 rounded-[18px] text-[13px] flex items-center justify-center shadow-xl tracking-tight">
                      hoa hồng nhận được : {product.adminQuotePrice}
                    </div>
                  </div>
                )}

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  {isAdmin ? (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 overflow-hidden">
                         {product.userPhoto ? (
                           <img src={product.userPhoto} alt={product.userName} className="w-full h-full object-cover" />
                         ) : (
                           <User className="w-4 h-4 text-slate-400 m-2" />
                         )}
                      </div>
                      <span className="text-[12px] font-bold text-slate-900">{product.userName}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                      <span className="text-[11px] font-medium text-slate-400">Đã gửi thành công</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {!isAdmin && product.status === 'quoted' && (
                      <button
                        onClick={() => handleMarkBought(product.id)}
                        disabled={actingOn === product.id}
                        className="bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold text-[11px] flex items-center gap-2 hover:bg-emerald-600 disabled:opacity-50 shadow-md"
                      >
                        {actingOn === product.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShoppingCart className="w-3.5 h-3.5" />}
                        Tôi đã mua
                      </button>
                    )}

                    {isAdmin && product.status === 'pending' && quotingId !== product.id && (
                      <button
                        onClick={() => setQuotingId(product.id)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-[11px] flex items-center gap-2 hover:bg-indigo-700 shadow-md"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Báo giá
                      </button>
                    )}

                    {isAdmin && product.status === 'purchased' && (
                      <button
                        onClick={() => handleAdminComplete(product.id)}
                        disabled={actingOn === product.id}
                        className="bg-slate-950 text-white px-4 py-2 rounded-xl font-bold text-[11px] flex items-center gap-2 hover:bg-slate-800 disabled:opacity-50 shadow-md"
                      >
                        {actingOn === product.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        Hoàn tất
                      </button>
                    )}

                    {isAdmin && (
                      <div className="flex gap-2 ml-2">
                        {product.status !== 'rejected' && product.status !== 'completed' && (
                          <button
                            onClick={() => handleAdminReject(product.id)}
                            disabled={actingOn === product.id}
                            className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                            title="Từ chối"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={actingOn === product.id}
                          className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                          title="Xóa vĩnh viễn"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Admin Editor */}
                {isAdmin && quotingId === product.id && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Giá báo</label>
                        <input
                          type="text"
                          placeholder="Ví dụ: 500k"
                          className="w-full px-4 py-3 text-[13px] bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-bold"
                          value={quotePrice}
                          onChange={(e) => setQuotePrice(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Link mua hàng mới</label>
                        <input
                          type="text"
                          placeholder="https://shopee.vn/..."
                          className="w-full px-4 py-3 text-[13px] bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all"
                          value={quoteLink}
                          onChange={(e) => setQuoteLink(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                       <button
                         onClick={() => handleAdminQuote(product.id)}
                         disabled={actingOn === product.id || !quotePrice}
                         className="flex-1 bg-slate-950 text-white py-3 rounded-xl font-bold text-[12px] hover:bg-slate-800 disabled:opacity-50 transition-all shadow-lg flex items-center justify-center gap-2"
                       >
                         {actingOn === product.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Gửi báo giá'}
                       </button>
                       <button
                         onClick={() => { setQuotingId(null); setQuotePrice(''); setQuoteLink(''); }}
                         className="px-4 text-slate-400 hover:text-rose-500 bg-white border border-slate-200 rounded-xl transition-colors"
                       >
                         Hủy
                       </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
