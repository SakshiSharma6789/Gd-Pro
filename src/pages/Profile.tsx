import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { PracticeSession } from '../types';
import { motion } from 'motion/react';
import { User as FirebaseUser } from 'firebase/auth';
import { Trophy, Clock, BookOpen, Star, Shield, Zap, Target, Activity } from 'lucide-react';

export default function Profile() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [stats, setStats] = useState({ total: 0, avgScore: 0, totalDuration: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        setUser(currentUser);
        try {
          const allSessionsQuery = query(collection(db, 'practiceSessions'), where('userId', '==', currentUser.uid));
          const allSnap = await getDocs(allSessionsQuery);
          const total = allSnap.size;
          const totalScore = allSnap.docs.reduce((acc, d) => acc + (d.data().feedback?.overallScore || 0), 0);
          const totalDuration = allSnap.docs.reduce((acc, d) => acc + (d.data().durationSeconds || 0), 0);
          
          setStats({
            total,
            avgScore: total > 0 ? parseFloat((totalScore / total).toFixed(1)) : 0,
            totalDuration
          });
        } catch (err) {
          console.error("Profile fetch error:", err);
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      {/* Header Profile Section */}
      <div className="glass-dark p-12 rounded-[3rem] border-white/5 relative overflow-hidden mb-12">
        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
          <div className="relative">
             <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-brand-600 to-indigo-700 flex items-center justify-center shadow-2xl shadow-brand-500/20 rotate-3 group-hover:rotate-0 transition-transform">
                <span className="text-4xl font-display text-white uppercase">{user?.displayName?.charAt(0) || 'S'}</span>
             </div>
             <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-slate-900 rounded-xl border-2 border-brand-500/30 flex items-center justify-center">
                <Shield className="w-5 h-5 text-brand-400" />
             </div>
          </div>
          
          <div className="text-center md:text-left flex-grow">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
               <span className="px-3 py-1 bg-brand-500/10 text-brand-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-brand-500/20">Elite Operative</span>
               <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-500/20">Lv. {Math.floor(stats.total / 5) + 1}</span>
            </div>
            <h1 className="text-5xl font-display uppercase tracking-tight text-white mb-2">{user?.displayName || 'Speakster'}</h1>
            <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">{user?.email}</p>
          </div>

          <div className="flex gap-4">
             <StatMini icon={<Zap className="w-4 h-4 text-brand-400"/>} label="STREAK" value="12 Days" />
             <StatMini icon={<Activity className="w-4 h-4 text-indigo-400"/>} label="RANK" value="PRO" />
          </div>
        </div>
        
        {/* Glow Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05)_0%,transparent_70%)]"></div>
      </div>

      {/* Mastery Section - THE BAR */}
      <section className="mb-12">
        <div className="glass-dark p-10 rounded-[2.5rem] border-white/5 relative overflow-hidden group">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
               <Target className="w-5 h-5 text-indigo-400" />
            </div>
            <h2 className="text-2xl font-display uppercase tracking-tight">Communication Mastery</h2>
          </div>

          <div className="flex flex-col gap-10">
            {/* The Mastery Bar */}
             <div className="relative">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Global Proficiency Status</h3>
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full animate-pulse ${
                        stats.avgScore >= 9 ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 
                        stats.avgScore >= 5 ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 
                        'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]'
                      }`} />
                      <span className={`text-3xl font-display uppercase ${
                        stats.avgScore >= 9 ? 'text-emerald-400' : 
                        stats.avgScore >= 5 ? 'text-amber-400' : 
                        'text-rose-400'
                      }`}>
                        {stats.avgScore >= 9 ? 'Dominance Zone' : 
                         stats.avgScore >= 5 ? 'Evolution Zone' : 
                         'Initiation Zone'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-4xl font-display text-white">{stats.avgScore}<span className="text-sm opacity-20 ml-1">/10</span></span>
                  </div>
                </div>

                <div className="h-6 bg-white/5 rounded-2xl p-1.5 border border-white/5 relative overflow-hidden">
                   <div className="absolute inset-0 flex">
                      <div className="h-full w-1/2 border-r border-white/10"></div>
                      <div className="h-full w-[40%] border-r border-white/10"></div>
                   </div>
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${stats.avgScore * 10}%` }}
                     className={`h-full rounded-xl relative z-10 transition-all duration-1000 ease-out ${
                       stats.avgScore >= 9 ? 'bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 
                       stats.avgScore >= 5 ? 'bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 
                       'bg-gradient-to-r from-rose-600 to-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.3)]'
                     }`}
                   />
                </div>
                
                <div className="flex justify-between mt-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">
                  <span className={stats.avgScore < 5 ? 'text-rose-400' : ''}>Initiate (0-5)</span>
                  <span className={stats.avgScore >= 5 && stats.avgScore < 9 ? 'text-amber-400' : ''}>Evolved (5-9)</span>
                  <span className={stats.avgScore >= 9 ? 'text-emerald-400' : ''}>Master (9-10)</span>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ProfileStatCard 
                  icon={<BookOpen className="w-5 h-5 text-brand-400"/>} 
                  label="Total Simulations" 
                  value={stats.total} 
                  desc="Missions attempted in current cycle"
                />
                <ProfileStatCard 
                  icon={<Clock className="w-5 h-5 text-indigo-400"/>} 
                  label="Training Time" 
                  value={stats.totalDuration > 3600 ? `${(stats.totalDuration / 3600).toFixed(1)}h` : `${Math.floor(stats.totalDuration / 60)}m`}
                  desc="Total active speaking engagement"
                />
                <ProfileStatCard 
                  icon={<Trophy className="w-5 h-5 text-amber-500"/>} 
                  label="Best Performance" 
                  value="9.4" 
                  desc="Highest overall score recorded"
                />
             </div>
          </div>
        </div>
      </section>

      {/* Action Footer */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between opacity-50 hover:opacity-100 transition-opacity">
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-slate-500">Subject UUID: {user?.uid}</p>
        <div className="flex gap-4">
           <button className="px-6 py-2 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all text-slate-300">Export Protocols</button>
           <button className="px-6 py-2 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all text-slate-300">Security Log</button>
        </div>
      </div>
    </div>
  );
}

function StatMini({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex flex-col items-end px-6 py-3 glass rounded-2xl border-white/5">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
      </div>
      <span className="text-sm font-display text-white">{value}</span>
    </div>
  );
}

function ProfileStatCard({ icon, label, value, desc }: { icon: any, label: string, value: any, desc: string }) {
  return (
    <div className="p-6 glass rounded-3xl border-white/5 hover:bg-white/5 transition-all">
       <div className="w-10 h-10 bg-black/40 rounded-xl flex items-center justify-center mb-4">
          {icon}
       </div>
       <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</div>
       <div className="text-3xl font-display text-white mb-2">{value}</div>
       <p className="text-[10px] text-slate-600 font-medium uppercase tracking-wider">{desc}</p>
    </div>
  );
}
