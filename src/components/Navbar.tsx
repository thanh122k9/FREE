import { Link, useLocation } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Plus, Home as HomeIcon, Trophy, User, History, Shield } from 'lucide-react';
import React, { useEffect, useState } from 'react';

export default function Navbar() {
  const [user] = useAuthState(auth);
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        const isHardcodedAdmin = user.email === 'truongthanh.nongtruong@gmail.com';
        const isDbAdmin = docSnap.exists() && (docSnap.data().isAdmin === true || docSnap.data().role === 'admin');
        if (isHardcodedAdmin || isDbAdmin) {
          setIsAdmin(true);
        }
      } else {
        setIsAdmin(false);
      }
    }
    checkAdmin();
  }, [user]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-2xl border border-slate-200/50 px-4 sm:px-6 py-3 rounded-full z-50 shadow-[0_20px_50px_rgba(0,0,0,0.1)] w-[95%] max-w-md flex items-center justify-between">
      <Link
        to="/"
        className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${
          isActive('/') ? 'text-indigo-600' : 'text-slate-400'
        }`}
      >
        <HomeIcon className={`w-5.5 h-5.5 ${isActive('/') ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
        <span className="text-[8px] font-bold tracking-tight">Home</span>
      </Link>

      <Link
        to="/payouts"
        className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${
          isActive('/payouts') ? 'text-indigo-600' : 'text-slate-400'
        }`}
      >
        <Trophy className={`w-5.5 h-5.5 ${isActive('/payouts') ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
        <span className="text-[8px] font-bold tracking-tight">Xếp hạng</span>
      </Link>

      <Link
        to="/add"
        className="w-10 h-10 bg-slate-950 rounded-full flex items-center justify-center text-white shadow-xl shadow-slate-950/20 active:scale-90 transition-all hover:bg-slate-800 -mt-2"
      >
        <Plus className="w-6 h-6" strokeWidth={2.5} />
      </Link>

      {isAdmin && (
        <Link
          to="/admin/users"
          className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${
            isActive('/admin/users') ? 'text-indigo-600' : 'text-slate-400'
          }`}
        >
          <Shield className={`w-5.5 h-5.5 ${isActive('/admin/users') ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
          <span className="text-[8px] font-bold tracking-tight">Thành viên</span>
        </Link>
      )}

      <Link
        to="/history"
        className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${
          isActive('/history') ? 'text-indigo-600' : 'text-slate-400'
        }`}
      >
        <History className={`w-5.5 h-5.5 ${isActive('/history') ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
        <span className="text-[8px] font-bold tracking-tight">Lịch sử</span>
      </Link>

      <Link
        to="/profile"
        className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${
          isActive('/profile') ? 'text-indigo-600' : 'text-slate-400'
        }`}
      >
        {user?.photoURL ? (
          <div className={`w-5.5 h-5.5 rounded-full overflow-hidden border-2 transition-all ${
            isActive('/profile') ? 'border-indigo-600' : 'border-transparent opacity-70'
          }`}>
            <img src={user.photoURL} alt="Nav Avatar" className="w-full h-full object-cover" />
          </div>
        ) : (
          <User className={`w-5.5 h-5.5 ${isActive('/profile') ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
        )}
        <span className="text-[8px] font-bold tracking-tight">Cá nhân</span>
      </Link>
    </nav>
  );
}

