import React, { useEffect, useState, useRef } from 'react';
import { auth, db } from '../lib/firebase';
import { doc, onSnapshot, collection, query, where, updateDoc } from 'firebase/firestore';
import { updateProfile, signOut } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Calendar, Smartphone, Send, Award, DollarSign, 
  ChevronRight, Camera, Loader2, LogOut, History, Wallet, Bell, Trophy,
  Eye, EyeOff, Copy, Key
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  displayName: string;
  birthDate: string;
  shopeeId: string;
  tiktokId: string;
  photoURL?: string;
  apiToken?: string;
}

interface UserStats {
  totalRequests: number;
  completedPayouts: number;
  totalEarnings: number;
  pendingRequests: number;
}

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats>({ 
    totalRequests: 0, 
    completedPayouts: 0, 
    totalEarnings: 0,
    pendingRequests: 0
  });
  const [loading, setLoading] = useState(true);
  const [updatingAvatar, setUpdatingAvatar] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) return;

    // Listen to User Profile
    const unsubProfile = onSnapshot(doc(db, 'users', auth.currentUser.uid), async (docSnap) => {
      try {
        if (docSnap.exists()) {
          const data = docSnap.data();
          
          // Auto-generate token if missing
          if (!data.apiToken) {
            const newToken = crypto.randomUUID();
            await setDoc(doc(db, 'users', auth.currentUser!.uid), {
              uid: auth.currentUser!.uid,
              email: auth.currentUser!.email,
              apiToken: newToken,
              updatedAt: new Date().toISOString()
            }, { merge: true });
            return;
          }

          setProfile({
            ...data as UserProfile,
            photoURL: data.photoURL || auth.currentUser?.photoURL || undefined,
            apiToken: data.apiToken
          });
        }
      } catch (err) {
        console.error("Profile sync error:", err);
      } finally {
        setLoading(false);
      }
    }, (error) => {
      console.error("Firestore listener error:", error);
      setLoading(false);
    });

    // Listen to Stats (Real-time)
    const q = query(collection(db, 'products'), where('userId', '==', auth.currentUser.uid));
    const unsubStats = onSnapshot(q, (snapshot) => {
      const products = snapshot.docs.map(doc => doc.data());
      
      const completed = products.filter(p => p.status === 'completed');
      const pending = products.filter(p => p.status === 'pending' || p.status === 'quoted');
      
      const earnings = completed.reduce((acc, p) => {
        const priceStr = p.adminQuotePrice || '0';
        // Basic parser for Vietnamese currency strings (e.g., "500.000", "500k")
        const numeric = parseInt(priceStr.replace(/[^0-9]/g, ''), 10) || 0;
        return acc + numeric;
      }, 0);

      setStats({
        totalRequests: products.length,
        completedPayouts: completed.length,
        totalEarnings: earnings,
        pendingRequests: pending.length
      });
    });

    return () => {
      unsubProfile();
      unsubStats();
    };
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !auth.currentUser) return;

    setUpdatingAvatar(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        try {
          await setDoc(doc(db, 'users', auth.currentUser!.uid), {
            uid: auth.currentUser!.uid,
            email: auth.currentUser!.email,
            photoURL: base64String,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        } catch (err) {
          console.error("Firestore update error:", err);
        }

        setProfile(prev => prev ? { ...prev, photoURL: base64String } : null);
        setUpdatingAvatar(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Error updating avatar:", err);
      setUpdatingAvatar(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-32 pt-6 px-4">
      {/* Upper Profile View */}
      <section>
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[32px] p-8 elegant-card flex flex-col items-center text-center relative overflow-hidden"
        >
          <div className="relative mb-6 group cursor-pointer" onClick={handleAvatarClick}>
            <div className="w-24 h-24 rounded-3xl bg-slate-50 border-4 border-white shadow-xl overflow-hidden relative group-hover:scale-105 transition-all duration-500">
              {profile?.photoURL ? (
                <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-200">
                  <User className="w-10 h-10" />
                </div>
              )}
              
              <AnimatePresence>
                {updatingAvatar && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-20"
                  >
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/20 backdrop-blur-[1px] transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            {/* Online badge */}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full z-10" />
            
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange}
            />
          </div>
          
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{profile?.displayName || 'Creator'}</h1>
            <div className="flex items-center justify-center">
              <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">Đối tác xác thực</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-8 w-full mt-8 border-t border-slate-50 pt-8">
            <div className="space-y-0.5">
              <p className="text-xl font-bold text-slate-900">{stats.totalRequests}</p>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Links</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-xl font-bold text-emerald-600">{stats.completedPayouts}</p>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Thành công</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-xl font-bold text-amber-500">{stats.pendingRequests}</p>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Đang chờ</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Earnings Dashboard */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-950 rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Wallet className="w-16 h-16 text-white" />
        </div>
        
        <div className="space-y-1 mb-6">
          <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-400">Thu nhập ròng</span>
          <h2 className="text-3xl font-bold tracking-tight">{formatCurrency(stats.totalEarnings)}</h2>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-medium text-emerald-400 bg-emerald-400/10 w-fit px-3 py-1 rounded-full">
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Thanh toán tự động đang hoạt động
        </div>
      </motion.div>

      {/* Main Actions */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Sửa Bio', icon: Smartphone, color: 'text-indigo-600', bg: 'bg-indigo-50', onClick: () => navigate('/onboarding') },
          { label: 'Lịch sử', icon: History, color: 'text-slate-600', bg: 'bg-slate-50', onClick: () => navigate('/history') },
          { label: 'Xếp hạng', icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-50', onClick: () => navigate('/payouts') },
          { label: 'Cài đặt', icon: Bell, color: 'text-slate-400', bg: 'bg-slate-50', onClick: () => {} },
        ].map((item, idx) => (
          <motion.button
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + idx * 0.05 }}
            onClick={item.onClick}
            className="flex items-center gap-4 p-4 bg-white rounded-2xl elegant-card active:scale-95"
          >
            <div className={`w-10 h-10 rounded-xl ${item.bg} ${item.color} flex items-center justify-center shrink-0`}>
              <item.icon className="w-5 h-5" />
            </div>
            <span className="text-slate-900 font-bold text-xs uppercase tracking-tight">{item.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Profile Details */}
      <div className="bg-white rounded-[32px] elegant-card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50">
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Thông tin tài khoản</h4>
        </div>
        <div className="divide-y divide-slate-50">
            {[
              { label: 'Ngày sinh', value: profile?.birthDate, icon: Calendar },
              { label: 'Shopee ID', value: profile?.shopeeId, icon: Smartphone },
              { label: 'TikTok ID', value: profile?.tiktokId, icon: Send },
            ].map((row) => (
              <div key={row.label} className="flex justify-between items-center p-5">
                <div className="flex items-center gap-3">
                  <row.icon className="w-4 h-4 text-slate-300" />
                  <span className="text-[11px] font-medium text-slate-400">{row.label}</span>
                </div>
                <span className="text-[12px] font-bold text-slate-900">{row.value || '---'}</span>
              </div>
            ))}
        </div>
      </div>

      {/* API Key View */}
      <div className="bg-slate-900 rounded-[32px] p-8 border border-white/5 shadow-xl relative overflow-hidden group">
         <div className="flex items-center justify-between mb-6">
            <h4 className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest">API Security Token</h4>
            <div className="bg-white/5 text-white/40 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase border border-white/10">Bảo mật</div>
         </div>

         <div className="flex items-center gap-4 p-4 bg-black/20 rounded-xl border border-white/5">
            <div className="flex-1 overflow-hidden">
               <span className={`text-[12px] font-mono font-bold tracking-tight ${showToken ? 'text-indigo-200' : 'text-slate-700 blur-sm select-none'}`}>
                  {profile?.apiToken || '************************************'}
               </span>
            </div>
            <div className="flex items-center gap-1">
               <button 
                 onClick={() => setShowToken(!showToken)}
                 className="p-2 text-slate-500 hover:text-white transition-all"
               >
                 {showToken ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
               </button>
               <button 
                 onClick={() => {
                   if (profile?.apiToken) {
                     navigator.clipboard.writeText(profile.apiToken);
                     setCopied(true);
                     setTimeout(() => setCopied(false), 2000);
                   }
                 }}
                 className="p-2 text-slate-500 hover:text-white relative"
               >
                 {copied && (
                   <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-[10px] px-2 py-1 rounded font-bold shadow-lg">Copied</div>
                 )}
                 <Copy className="w-4.5 h-4.5" />
               </button>
            </div>
         </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-3 py-5 bg-rose-50 text-rose-600 rounded-[24px] font-bold text-[11px] uppercase tracking-widest border border-rose-100 hover:bg-rose-100 transition-all"
      >
        <LogOut className="w-4.5 h-4.5" />
        Kết thúc phiên làm việc
      </button>

      <footer className="text-center py-10">
        <div className="flex flex-col items-center gap-2 opacity-20">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em]">LinkPro Enterprise</p>
          <span className="text-[8px] font-medium">v2.0.42 / Build 2026.04.24</span>
        </div>
      </footer>
    </div>
  );
}

