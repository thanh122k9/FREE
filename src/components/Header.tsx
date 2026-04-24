import { Link } from 'react-router-dom';
import { Home as HomeIcon, Bell, LogIn } from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../lib/firebase';

export default function Header() {
  const [user] = useAuthState(auth);

  return (
    <header className="bg-white/70 backdrop-blur-md sticky top-0 z-50 px-5 h-16 flex items-center justify-between border-b border-slate-100/50">
      <Link to="/" className="flex items-center gap-3 group">
        <div className="w-9 h-9 bg-slate-950 rounded-[12px] flex items-center justify-center shadow-lg group-active:scale-90 transition-all">
          <HomeIcon className="w-4.5 h-4.5 text-white" />
        </div>
        <div className="flex flex-col -space-y-0.5">
          <span className="font-bold tracking-tight text-xl text-slate-950">LinkPro</span>
          <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-indigo-500">Creator Hub</span>
        </div>
      </Link>
      
      {user ? (
        <button className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-indigo-600 bg-slate-50 rounded-full transition-all relative group">
          <Bell className="w-5 h-5 transition-transform group-active:scale-90" />
          <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>
      ) : (
        <Link 
          to="/login"
          className="flex items-center gap-2 bg-slate-950 text-white px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg hover:bg-slate-800 transition-all active:scale-95"
        >
          <LogIn className="w-3.5 h-3.5" />
          Đăng nhập
        </Link>
      )}
    </header>
  );
}
