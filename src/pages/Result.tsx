import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { PracticeSession } from '../types';
import { motion } from 'motion/react';
import { 
  Trophy, CheckCircle2, AlertCircle, Sparkles, MessageSquare, 
  Lightbulb, ArrowLeft, Share2, BarChart2, Star, Target, Info, Clock
} from 'lucide-react';

export default function Result() {
  const { sessionId } = useParams();
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      if (!sessionId) return;
      const docSnap = await getDoc(doc(db, 'practiceSessions', sessionId));
      if (docSnap.exists()) {
        setSession({ id: docSnap.id, ...docSnap.data() } as PracticeSession);
      }
      setLoading(false);
    };
    fetchSession();
  }, [sessionId]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4">
      <div className="w-12 h-12 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
      <div className="text-xs font-mono text-brand-400 uppercase tracking-widest">Decrypting AI Insights...</div>
    </div>
  );
  
  if (!session || !session.feedback) return (
    <div className="max-w-xl mx-auto py-20 text-center glass-dark rounded-[2.5rem] p-12 mt-10">
      <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
      <h2 className="text-3xl font-display uppercase text-white mb-4">Archives Restricted</h2>
      <p className="text-slate-400 mb-8 font-light">The requested feedback packet could not be retrieved from the central database.</p>
      <Link to="/dashboard" className="px-8 py-3 bg-white text-slate-950 font-black rounded-xl hover:bg-brand-500 transition-all uppercase tracking-widest text-xs">
        Return to Terminal
      </Link>
    </div>
  );

  const { feedback } = session;

  return (
    <div className="max-w-7xl mx-auto space-y-16 py-10 px-4">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
        <div>
          <Link to="/dashboard" className="inline-flex items-center gap-3 text-brand-400 font-black uppercase tracking-widest text-xs mb-6 group">
            <div className="w-8 h-8 bg-brand-500/10 rounded-lg flex items-center justify-center group-hover:-translate-x-1 transition-transform">
              <ArrowLeft className="w-4 h-4" /> 
            </div>
            Exit Analysis
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <span className="px-3 py-1 bg-brand-500/10 text-brand-500 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-brand-500/20">Mission Complete</span>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter">ID: {session.id?.slice(0, 12)}</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-display uppercase tracking-tight text-white mb-4 leading-none">{session.topicTitle}</h1>
          <p className="text-slate-400 font-light flex flex-wrap items-center gap-x-6 gap-y-2 text-sm italic">
            <span className="flex items-center gap-2"><Clock className="w-4 h-4 opacity-30" /> {session.durationSeconds} Seconds Speaking Duration</span>
            <span className="flex items-center gap-2"><Info className="w-4 h-4 opacity-30" /> Processed by AI Core on {new Date(session.createdAt.seconds * 1000).toLocaleString()}</span>
          </p>
        </div>
        <div className="flex gap-4">
          <button className="p-5 glass-dark rounded-2xl text-slate-400 hover:text-white transition-all border border-white/5 active:scale-95">
            <Share2 className="w-6 h-6" />
          </button>
          <Link 
            to={`/practice/${session.topicId}`}
            className="px-10 py-5 bg-brand-500 text-slate-950 font-black rounded-2xl shadow-2xl shadow-brand-500/20 hover:scale-105 active:scale-95 transition-all text-xs uppercase tracking-widest"
          >
            Re-initiate
          </Link>
        </div>
      </div>

      {/* Main Score Board */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left column: Score Summary */}
        <div className="lg:col-span-4 space-y-10">
          <div className="bg-gradient-to-br from-brand-500 to-orange-700 rounded-[2.5rem] p-12 text-slate-950 text-center shadow-2xl shadow-brand-500/20 relative overflow-hidden group">
            <div className="relative z-10">
               <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform group-hover:rotate-6">
                 <Trophy className="w-10 h-10 text-slate-950" />
               </div>
               <h3 className="text-xs font-bold uppercase tracking-[0.3em] mb-4 opacity-80">Aggregate Rank</h3>
               <div className="text-8xl font-display leading-none mb-6">{feedback.overallScore}<span className="text-2xl opacity-40 font-sans font-black">/10</span></div>
               <div className="px-8 py-3 bg-slate-950 text-white rounded-full inline-block font-black tracking-widest text-[10px] uppercase shadow-xl transition-all">
                 {feedback.overallScore >= 8 ? 'Mastery Level' : feedback.overallScore >= 6 ? 'Competent' : 'Recruit'}
               </div>
            </div>
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-32 -mt-32 transition-all duration-700 group-hover:scale-150"></div>
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-black/5 rounded-full blur-2xl -mr-24 -mb-24"></div>
          </div>

          <div className="glass-dark p-10 rounded-[2.5rem] border-white/5 space-y-8">
            <h3 className="text-xs font-bold text-brand-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
               <BarChart2 className="w-4 h-4" /> Neural Breakdown
            </h3>
            <ScoreBar label="Relevance" score={feedback.relevance} color="bg-brand-400" />
            <ScoreBar label="Clarity" score={feedback.clarity} color="bg-indigo-400" />
            <ScoreBar label="Structure" score={feedback.structure} color="bg-brand-500" />
            <ScoreBar label="Confidence" score={feedback.confidence} color="bg-indigo-500" />
          </div>
        </div>

        {/* Right column: Detailed Feedback */}
        <div className="lg:col-span-8 space-y-12">
          {/* Answer Review */}
          <div className="glass-dark p-1 rounded-[2.5rem] border-white/5 bg-gradient-to-b from-white/5 to-transparent">
            <div className="bg-slate-950/80 rounded-[2.2rem] p-10 md:p-12">
               <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3 uppercase tracking-tight">
                 <MessageSquare className="w-6 h-6 text-brand-400" /> Transmission Captured
               </h3>
               <div className="p-8 bg-white/5 rounded-3xl text-brand-50/70 text-lg leading-relaxed italic relative font-mono overflow-hidden">
                  <span className="text-9xl text-white/5 absolute -top-8 -left-4 select-none pointer-events-none font-sans">"</span>
                  <div className="relative z-10">{session.answerText}</div>
                  <span className="text-9xl text-white/5 absolute -bottom-20 right-4 select-none pointer-events-none transform rotate-180 font-sans">"</span>
               </div>
            </div>
          </div>

          {/* AI Insights */}
          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.2
                }
              }
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
              <AnalysisCard 
                 title="Tactical Wins" 
                 items={feedback.strengths} 
                 icon={<CheckCircle2 className="w-6 h-6 text-emerald-400" />}
                 borderColor="border-emerald-500/20"
                 glowColor="bg-emerald-500/5"
              />
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
              <AnalysisCard 
                 title="Vulnerabilities" 
                 items={feedback.mistakes} 
                 icon={<AlertCircle className="w-6 h-6 text-rose-400" />}
                 borderColor="border-rose-500/20"
                 glowColor="bg-rose-500/5"
              />
            </motion.div>
          </motion.div>

          <div className="glass-dark p-12 rounded-[2.5rem] border-white/5 relative overflow-hidden group">
             <h3 className="text-xl font-bold mb-8 flex items-center gap-3 text-brand-400 uppercase tracking-tight relative z-10">
               <Sparkles className="w-6 h-6" /> Optimal Synthesis
             </h3>
             <p className="text-brand-50/90 leading-relaxed text-xl font-light italic bg-white/5 p-10 rounded-4xl border border-white/10 relative z-10 shadow-inner">
               {feedback.improvedAnswer}
             </p>
             <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                <Target className="w-48 h-48" />
             </div>
          </div>

          <div className="bg-brand-500/10 border border-brand-500/20 p-12 rounded-[2.5rem]">
             <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3 uppercase tracking-tight">
               <Lightbulb className="w-6 h-6 text-brand-400" /> Strategic Tips
             </h3>
             <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {feedback.tips.map((tip, i) => (
                 <li key={i} className="flex gap-4 text-slate-300 font-light text-sm bg-white/5 p-4 rounded-2xl border border-white/5">
                    <Star className="w-4 h-4 text-brand-400 flex-shrink-0 mt-1" fill="currentColor"/>
                    {tip}
                 </li>
               ))}
             </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreBar({ label, score, color }: { label: string, score: number, color: string }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
        <span>{label}</span>
        <span className="text-white">{score}/10</span>
      </div>
      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div 
           initial={{ width: 0 }}
           animate={{ width: `${score * 10}%` }}
           transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
           className={`h-full ${color} shadow-[0_0_10px_rgba(59,130,246,0.3)]`}
        />
      </div>
    </div>
  );
}

function AnalysisCard({ title, items, icon, borderColor, glowColor }: { title: string, items: string[], icon: any, borderColor: string, glowColor: string }) {
  return (
    <motion.div 
      whileHover={{ y: -10, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`glass-dark p-10 rounded-[2.5rem] border ${borderColor} ${glowColor} h-full relative overflow-hidden group shadow-2xl hover:shadow-white/5 animate-glow`}
    >
      <h4 className="text-lg font-bold text-white mb-8 flex items-center gap-4 uppercase tracking-tight relative z-10 transition-colors group-hover:text-brand-400">
        {icon} {title}
      </h4>
      <ul className="space-y-4 relative z-10">
        {items.map((item, i) => (
           <li key={i} className="flex gap-4 text-sm text-slate-400 leading-relaxed font-light">
             <div className="w-1.5 h-1.5 bg-slate-700 rounded-full flex-shrink-0 mt-2.5"></div>
             {item}
           </li>
        ))}
      </ul>
      <div className="absolute bottom-0 right-0 p-8 opacity-[0.02] group-hover:rotate-12 group-hover:opacity-[0.05] transition-all">
        {icon}
      </div>
    </motion.div>
  );
}

