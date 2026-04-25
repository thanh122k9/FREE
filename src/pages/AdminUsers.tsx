import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { User, Shield, Key, RefreshCw, Search, Loader2, Mail, Calendar, CheckCircle2, ShoppingBag, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  apiToken?: string;
  isAdmin?: boolean;
  shopeeId?: string;
  tiktokId?: string;
  onboardingCompleted?: boolean;
  createdAt?: any;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [actingOn, setActingOn] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkAdmin() {
      if (auth.currentUser) {
        try {
          const docRef = doc(db, 'users', auth.currentUser.uid);
          const docSnap = await getDoc(docRef);
          const isHardcodedAdmin = auth.currentUser.email === 'truongthanh.nongtruong@gmail.com';
          const isDbAdmin = docSnap.exists() && (docSnap.data().isAdmin === true || docSnap.data().role === 'admin');
          
          if (isHardcodedAdmin || isDbAdmin) {
            setIsAdmin(true);
          } else {
            console.error("Access denied: Not an admin");
            setLoading(false);
          }
        } catch (err) {
          console.error("Error checking admin status:", err);
          setLoading(false);
        }
      } else {
        navigate('/login');
      }
    }
    checkAdmin();
  }, [navigate]);

  useEffect(() => {
    if (!isAdmin) return;

    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as UserProfile[];
      setUsers(docs);
      setLoading(false);
    }, (error) => {
      console.error("Firestore error fetching users:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAdmin]);

  const handleResetToken = async (userId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn làm mới Token cho người dùng này?')) return;
    setActingOn(userId);
    try {
      const newToken = crypto.randomUUID();
      await updateDoc(doc(db, 'users', userId), {
        apiToken: newToken,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error(err);
      alert('Không thể cập nhật Token. Vui lòng kiểm tra quyền hạn.');
    } finally {
      setActingOn(null);
    }
  };

  const filteredUsers = users.filter(u => 
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.uid?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAdmin && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4 px-4 text-center">
        <Shield className="w-12 h-12 text-rose-500 opacity-20" />
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900">Truy cập bị từ chối</h2>
          <p className="text-sm text-slate-500">Bạn không có quyền quản trị để xem trang này.</p>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="text-indigo-600 font-bold text-sm"
        >
          Quay lại trang chủ
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-32 pt-6 px-1">
      <div className="flex flex-col -space-y-0.5 mb-2">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          Quản lý Thành viên
          <Shield className="w-5 h-5 text-indigo-500" />
        </h1>
        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">Kiểm soát API Tokens & Quyền hạn</span>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center">
          <Search className="text-slate-300 w-5 h-5 group-focus-within:text-indigo-500 transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Tìm tên, email hoặc UID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl elegant-card focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all text-[14px] font-medium text-slate-950"
        />
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {filteredUsers.map((user, index) => (
            <motion.div
              key={user.uid}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="bg-white rounded-[28px] p-5 elegant-card border border-slate-50 relative overflow-hidden group"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border-2 border-white shadow-sm shrink-0 overflow-hidden relative">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-200">
                      <User className="w-8 h-8" />
                    </div>
                  )}
                  {user.isAdmin && (
                    <div className="absolute -top-1 -right-1 bg-indigo-500 text-white p-1 rounded-bl-xl border-2 border-white">
                      <Shield className="w-3 h-3" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-slate-900 text-[15px] truncate">{user.displayName || 'Chưa đặt tên'}</h3>
                    {user.onboardingCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-3">
                    <Mail className="w-3 h-3" />
                    <span className="truncate">{user.email}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {user.shopeeId && (
                      <div className="bg-orange-50 text-orange-600 px-3 py-1.5 rounded-xl border border-orange-100 flex items-center gap-1.5 shadow-sm">
                        <ShoppingBag className="w-3 h-3" />
                        <span className="text-[10px] font-bold uppercase tracking-tight">Shopee: {user.shopeeId}</span>
                      </div>
                    )}
                    {user.tiktokId && (
                      <div className="bg-slate-900 text-white px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
                        <Smartphone className="w-3 h-3" />
                        <span className="text-[10px] font-bold uppercase tracking-tight">TikTok: {user.tiktokId}</span>
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-950 rounded-xl p-3 relative group/token">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">API TOKEN</span>
                      <button 
                        onClick={() => handleResetToken(user.uid)}
                        disabled={actingOn === user.uid}
                        className="text-white/40 hover:text-white transition-colors"
                        title="Reset Token"
                      >
                        {actingOn === user.uid ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                      </button>
                    </div>
                    <code className="text-[10px] text-white/90 font-mono break-all leading-relaxed">
                      {user.apiToken || 'Chưa cấp token'}
                    </code>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" />
                  ID: {user.uid?.slice(0, 8)}...
                </div>
                <div className={user.isAdmin ? 'text-indigo-500' : 'text-slate-300'}>
                  {user.isAdmin ? 'Quản trị viên' : 'Thành viên'}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredUsers.length === 0 && (
          <div className="text-center py-20 bg-white rounded-[32px] elegant-card">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
               <User className="w-8 h-8 text-slate-200" />
            </div>
            <h2 className="text-[13px] font-medium text-slate-400">Không tìm thấy người dùng nào</h2>
          </div>
        )}
      </div>
    </div>
  );
}
