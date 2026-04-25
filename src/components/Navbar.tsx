import { Link, useLocation } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../lib/firebase';
import { Plus, Home as HomeIcon, Trophy, User, History } from 'lucide-react';

export default function Navbar() {
  const [user] = useAuthState(auth);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-2xl border border-slate-200/50 px-6 py-3 rounded-full z-50 shadow-[0_20px_50px_rgba(0,0,0,0.1)] w-[92%] max-w-md flex items-center justify-between">
      <Link
        to="/"
        className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${
          isActive('/') ? 'text-indigo-600' : 'text-slate-400'
        }`}
      >
        <HomeIcon className={`w-6 h-6 ${isActive('/') ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
        <span className="text-[9px] font-bold tracking-tight">Trang chủ</span>
      </Link>

      <Link
        to="/payouts"
        className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${
          isActive('/payouts') ? 'text-indigo-600' : 'text-slate-400'
        }`}
      >
        <Trophy className={`w-6 h-6 ${isActive('/payouts') ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
        <span className="text-[9px] font-bold tracking-tight">Xếp hạng</span>
      </Link>

      <Link
        to="/add"
        className="w-12 h-12 bg-slate-950 rounded-full flex items-center justify-center text-white shadow-xl shadow-slate-950/20 active:scale-90 transition-all hover:bg-slate-800 -mt-2"
      >
        <Plus className="w-7 h-7" strokeWidth={2.5} />
      </Link>

      <Link
        to="/history"
        className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${
          isActive('/history') ? 'text-indigo-600' : 'text-slate-400'
        }`}
      >
        <History className={`w-6 h-6 ${isActive('/history') ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
        <span className="text-[9px] font-bold tracking-tight">Lịch sử</span>
      </Link>

      <Link
        to="/profile"
        className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${
          isActive('/profile') ? 'text-indigo-600' : 'text-slate-400'
        }`}
      >
        {user?.photoURL ? (
          <div className={`w-6 h-6 rounded-full overflow-hidden border-2 transition-all ${
            isActive('/profile') ? 'border-indigo-600' : 'border-transparent opacity-70'
          }`}>
            <img src={user.photoURL} alt="Nav Avatar" className="w-full h-full object-cover" />
          </div>
        ) : (
          <User className={`w-6 h-6 ${isActive('/profile') ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
        )}
        <span className="text-[9px] font-bold tracking-tight">Cá nhân</span>
      </Link>
    </nav>
  );
}
