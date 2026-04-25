import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { Mail, Lock, LogIn, AlertCircle, Chrome } from 'lucide-react';
import { motion } from 'motion/react';
import { setDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          isAdmin: false,
          onboardingCompleted: false,
          createdAt: serverTimestamp(),
        });
      }
      
      navigate('/');
    } catch (err: any) {
      setError('Đã có lỗi khi đăng nhập bằng Google.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 py-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 -left-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-sm bg-white rounded-[3rem] premium-shadow p-10 sm:p-12 border border-slate-50 relative z-10 overflow-hidden"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ rotate: -10 }}
            animate={{ rotate: 3 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-slate-950 text-white rounded-[2rem] mb-8 shadow-2xl shadow-indigo-200 border-4 border-white mx-auto transition-transform hover:rotate-0 duration-500 ease-out"
          >
            <LogIn className="w-10 h-10" />
          </motion.div>
          <div className="flex flex-col -space-y-1">
            <h1 className="text-4xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">LinkPro</h1>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500">Cổng truy cập</span>
          </div>
          <p className="text-slate-400 font-extrabold text-[10px] uppercase tracking-[0.2em] leading-relaxed mt-6 italic opacity-80 decoration-indigo-500">
            Mạng lưới Creator Chuyên nghiệp & Quản lý Affiliate
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 bg-rose-50 border border-rose-100 text-rose-600 px-5 py-4 rounded-2xl flex items-center gap-4 text-left shadow-sm"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-[10px] font-black uppercase tracking-tight leading-none">{error}</p>
          </motion.div>
        )}

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-5 bg-slate-950 text-white rounded-[1.75rem] font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-4 hover:bg-slate-800 transition-all shadow-[0_20px_50px_-10px_rgba(0,0,0,0.3)] disabled:opacity-50 group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-transparent -translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
          {loading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <Chrome className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Đăng nhập bằng Google
            </>
          )}
        </motion.button>

        <div className="mt-12 pt-10 border-t border-slate-50 space-y-6">
           <div className="flex items-center gap-4 text-slate-200">
              <div className="h-[2px] flex-1 bg-slate-100"></div>
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-300 italic">Nguồn tin cậy</span>
              <div className="h-[2px] flex-1 bg-slate-100"></div>
           </div>
           <div className="flex flex-col gap-2">
              <p className="text-center text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] leading-relaxed italic">
                Cổng truy cập chỉ dành cho các chuyên gia thị trường đã xác thực.
              </p>
              <div className="flex justify-center gap-3 mt-2 opacity-10">
                 <div className="w-6 h-2 bg-slate-950 rounded-full" />
                 <div className="w-6 h-2 bg-slate-950 rounded-full" />
                 <div className="w-6 h-2 bg-slate-950 rounded-full" />
              </div>
           </div>
        </div>
      </motion.div>
      
      <div className="absolute bottom-8 text-center opacity-30">
         <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300 italic">Hệ sinh thái An toàn v2.0</p>
      </div>
    </div>
  );
}
