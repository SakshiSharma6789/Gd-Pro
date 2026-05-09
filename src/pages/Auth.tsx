import { useState } from 'react';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, UserPlus, Github, Chrome, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCred.user, { displayName: name });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-20 px-4 flex items-center justify-center min-h-[80vh] relative">
      {/* Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/5 blur-[120px] rounded-full pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full glass-dark p-12 rounded-[3rem] border-white/5 relative overflow-hidden z-10"
      >
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
          <ShieldCheck className="w-40 h-40" />
        </div>
        
        <div className="text-center mb-10 relative z-10">
          <div className="w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-brand-500/20">
            <Sparkles className="w-8 h-8 text-slate-950" />
          </div>
          <h2 className="text-4xl font-display uppercase tracking-tight text-white mb-3">
            {isLogin ? 'Access Portal' : 'Join the Core'}
          </h2>
          <p className="text-slate-400 font-light text-sm uppercase tracking-widest">Operation: Debate Mastery</p>
        </div>

        <div className="flex gap-4 mb-10 relative z-10">
          <button 
            onClick={handleGoogleLogin}
            className="flex-1 flex items-center justify-center gap-3 py-4 glass text-white rounded-2xl hover:bg-white/10 transition-all font-bold text-xs uppercase tracking-widest border border-white/5"
          >
            <Chrome className="w-5 h-5 text-brand-500" />
            Establish Via Google
          </button>
        </div>

        <div className="relative mb-10">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5"></div>
          </div>
          <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.3em]">
            <span className="px-6 bg-[#020617] text-slate-600">Manual Credentialing</span>
          </div>
        </div>

        <form onSubmit={handleAuth} className="space-y-6 relative z-10">
          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-4">Full Identity</label>
                <input 
                  type="text" 
                  required 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/5 focus:border-brand-500/30 focus:bg-white/10 outline-none transition-all text-white placeholder:text-slate-700"
                  placeholder="E.G. COMMANDER SHEPARD"
                />
              </motion.div>
            )}
          </AnimatePresence>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-4">Communication Line (Email)</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/5 focus:border-brand-500/30 focus:bg-white/10 outline-none transition-all text-white placeholder:text-slate-700"
              placeholder="YOUR@AGENCY.COM"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-4">Secure Passkey</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/5 focus:border-brand-500/30 focus:bg-white/10 outline-none transition-all text-white placeholder:text-slate-700"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold uppercase tracking-tight flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <button 
            disabled={loading}
            className="w-full py-5 bg-white text-slate-950 font-black rounded-2xl shadow-2xl hover:bg-brand-500 disabled:opacity-20 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
          >
            {loading ? 'PROCESSING...' : (isLogin ? <><LogIn className="w-5 h-5"/> Initiate Sign-In</> : <><UserPlus className="w-5 h-5"/> Initialize Account</>)}
          </button>
        </form>

        <p className="mt-10 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">
          {isLogin ? "Unauthorized account?" : "Existing operative?"}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="ml-2 text-brand-500 font-black hover:text-white transition-colors"
          >
            {isLogin ? 'Register New' : 'Authenticate'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
