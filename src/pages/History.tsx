import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { PracticeSession } from '../types';
import { Link } from 'react-router-dom';
import { History as HistoryIcon, Search, Calendar, Award, ChevronRight, Filter, Database, Clock } from 'lucide-react';
import { motion } from 'motion/react';

export default function History() {
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchHistory = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, 'practiceSessions'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const snap = await getDocs(q);
      setSessions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as PracticeSession)));
      setLoading(false);
    };
    fetchHistory();
  }, []);

  const filteredSessions = filter === 'All' 
    ? sessions 
    : sessions.filter(s => s.topicCategory === filter);

  const categories = ['All', ...Array.from(new Set(sessions.map(s => s.topicCategory)))];

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4">
      <div className="w-12 h-12 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
      <div className="text-xs font-mono text-brand-400 uppercase tracking-widest">Accessing Databanks...</div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-16 py-10 px-4">
      <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8">
        <div>
           <div className="flex items-center gap-3 mb-4">
             <div className="w-12 h-12 bg-brand-500/10 rounded-2xl flex items-center justify-center">
               <Database className="w-6 h-6 text-brand-400" />
             </div>
             <h1 className="text-4xl md:text-5xl font-display uppercase tracking-tight text-white mb-2">Operation Archives</h1>
           </div>
           <p className="text-slate-400 font-light max-w-md">Historical record of all AI-evaluated communication simulations.</p>
        </div>
        <div className="flex glass-dark p-2 rounded-2xl border border-white/5 overflow-x-auto max-w-full no-scrollbar">
           {categories.map(cat => (
             <button 
               key={cat}
               onClick={() => setFilter(cat)}
               className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === cat ? 'bg-brand-500 text-slate-950 shadow-xl shadow-brand-500/10' : 'text-slate-500 hover:text-white'}`}
             >
               {cat}
             </button>
           ))}
        </div>
      </div>

      <div className="space-y-8">
        {filteredSessions.length > 0 ? (
          filteredSessions.map((session, i) => (
            <motion.div 
              key={session.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.01, x: 5 }}
              transition={{ delay: i * 0.05, type: "spring" }}
              className="group glass-dark p-1 rounded-[2rem] border-white/5 hover:border-brand-500/30 transition-all shadow-xl hover:shadow-brand-500/5"
            >
               <Link to={`/result/${session.id}`} className="flex flex-col sm:flex-row items-center p-6 gap-8 bg-slate-950/40 rounded-[1.8rem] hover:bg-white/5 transition-all">
                  {/* Date Column */}
                  <div className="flex flex-col items-center justify-center w-28 h-28 bg-white/5 rounded-3xl group-hover:bg-brand-500/10 transition-colors border border-white/5">
                     <span className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 group-hover:text-brand-400 transition-colors">
                       {new Date(session.createdAt.seconds * 1000).toLocaleString('en-US', { month: 'short' })}
                     </span>
                     <span className="text-4xl font-display text-white group-hover:text-brand-400">
                        {new Date(session.createdAt.seconds * 1000).getDate()}
                     </span>
                  </div>

                  {/* Info Column */}
                  <div className="flex-grow">
                     <div className="flex items-center gap-4 mb-3">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 bg-brand-500/10 text-brand-400 rounded-lg border border-brand-500/20">
                          {session.topicCategory}
                        </span>
                        <div className="flex gap-1">
                           {[...Array(5)].map((_, i) => (
                             <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < (session.feedback?.overallScore || 0) / 2 ? 'bg-brand-400' : 'bg-white/10'}`}></div>
                           ))}
                        </div>
                     </div>
                     <h3 className="text-2xl font-bold text-white mb-2 leading-tight group-hover:text-brand-400 transition-colors uppercase tracking-tight">{session.topicTitle}</h3>
                     <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
                       <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/> {session.durationSeconds}S</span>
                       <span className="opacity-20">|</span>
                       <span className="line-clamp-1 max-w-md italic opacity-50">{session.answerText}</span>
                     </div>
                  </div>

                  {/* Score Column */}
                  <div className="flex items-center gap-10 pr-6">
                     <div className="text-right">
                        <div className="text-4xl font-display text-brand-400 leading-none">{session.feedback?.overallScore}<span className="text-sm opacity-30 font-sans ml-1 text-white">/10</span></div>
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">PERFORMANCE</div>
                     </div>
                     <ChevronRight className="w-6 h-6 text-slate-700 group-hover:text-brand-400 group-hover:translate-x-2 transition-all" />
                  </div>
               </Link>
            </motion.div>
          ))
        ) : (
          <div className="py-32 text-center glass-dark rounded-[3rem] border-white/5 relative overflow-hidden">
             <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/10">
                <Search className="w-10 h-10 text-slate-600" />
             </div>
             <h3 className="text-3xl font-display uppercase text-white mb-4 tracking-tight">Void Detected</h3>
             <p className="text-slate-400 max-w-sm mx-auto font-light">No historical data found in this category. Initiate a mission to populate archives.</p>
             <Link to="/dashboard" className="inline-block mt-10 px-10 py-4 bg-brand-500 text-slate-950 font-black rounded-2xl hover:bg-white transition-all uppercase tracking-widest text-xs">
                Browse Targets
             </Link>
             <div className="absolute top-0 right-0 p-10 opacity-[0.02] text-9xl font-display">EMPTY</div>
          </div>
        )}
      </div>
    </div>
  );
}
