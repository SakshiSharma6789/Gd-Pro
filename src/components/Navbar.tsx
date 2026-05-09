import { Link, useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { User } from 'firebase/auth';
import { MessageSquare, LayoutDashboard, History, LogOut, Sparkles, User as UserIcon } from 'lucide-react';
import { motion } from 'motion/react';

export default function Navbar({ user }: { user: User | null }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  return (
    <nav className="bg-slate-950/50 backdrop-blur-2xl sticky top-0 z-50 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-brand-500/20 shadow-xl group-hover:scale-105 transition-transform group-hover:rotate-6">
            <Sparkles className="w-6 h-6 text-slate-950" />
          </div>
          <span className="text-xl font-display uppercase tracking-tight text-white group-hover:text-brand-400 transition-colors">GD <span className="text-brand-500">PRO</span></span>
        </Link>

        {user ? (
          <div className="flex items-center gap-2 sm:gap-8">
            <div className="hidden md:flex items-center gap-10">
              <NavLink to="/dashboard" icon={<LayoutDashboard className="w-4 h-4"/>} label="Terminal" active={location.pathname === '/dashboard'} />
              <NavLink to="/history" icon={<History className="w-4 h-4"/>} label="Archives" active={location.pathname === '/history'} />
              <NavLink to="/profile" icon={<UserIcon className="w-4 h-4"/>} label="Profile" active={location.pathname === '/profile'} />
            </div>
            
            <div className="h-6 w-px bg-white/10 mx-2 hidden md:block"></div>

            <div className="flex items-center gap-4">
              <Link to="/profile" className="flex flex-col items-end mr-2 group/profile cursor-pointer hidden sm:flex">
                <span className={`text-sm font-bold leading-none transition-colors ${location.pathname === '/profile' ? 'text-brand-400' : 'text-white group-hover/profile:text-brand-400'}`}>{user.displayName || 'Speakster'}</span>
                <span className="text-[10px] uppercase tracking-[0.2em] font-black text-brand-500 mt-1">SIM_RANK: PRO</span>
              </Link>
              <button 
                onClick={handleLogout}
                className="p-2.5 rounded-xl hover:bg-red-500/10 text-slate-500 hover:text-red-500 transition-all active:scale-95"
                title="TERMINATE SESSION"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
             <Link to="/auth" className="px-8 py-3 bg-white text-slate-950 font-black rounded-xl hover:bg-brand-500 transition-all text-xs uppercase tracking-widest shadow-xl">
                Login / Join
             </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

function NavLink({ to, icon, label, active }: { to: string, icon: any, label: string, active: boolean }) {
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] transition-all relative ${active ? 'text-brand-400' : 'text-slate-500 hover:text-white'}`}
    >
      {icon}
      {label}
      {active && (
        <motion.div 
          layoutId="nav-underline"
          className="absolute -bottom-2 left-0 right-0 h-0.5 bg-brand-500 rounded-full"
        />
      )}
    </Link>
  );
}
