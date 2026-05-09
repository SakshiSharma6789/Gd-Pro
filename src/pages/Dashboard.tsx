import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, query, where, limit, orderBy } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Topic, PracticeSession } from '../types';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Trophy, Clock, ArrowRight, Star, TrendingUp, Sparkles, ChevronRight, Edit3 } from 'lucide-react';

const SEED_TOPICS: Omit<Topic, 'id'>[] = [
  { title: "Describe your favorite childhood toy", category: "Basic", difficulty: "Easy" },
  { title: "Your daily routine and its benefits", category: "Basic", difficulty: "Easy" },
  { title: "Common interview questions: Introduce yourself", category: "Common", difficulty: "Easy" },
  { title: "The importance of teamwork in projects", category: "Common", difficulty: "Medium" },
  { title: "The French Revolution and its impact", category: "History", difficulty: "Hard" },
  { title: "Analysis of the Great Depression", category: "History", difficulty: "Hard" },
  { title: "The current state of global inflation", category: "Current", difficulty: "Medium" },
  { title: "Recent advancements in space exploration", category: "Current", difficulty: "Medium" },
  { title: "Impact of AI on Job Market", category: "Technology", difficulty: "Medium" },
  { title: "Social media: Connectivity vs Isolation", category: "Social Issues", difficulty: "Easy" },
];

export default function Dashboard() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [recentSessions, setRecentSessions] = useState<PracticeSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, avgScore: 0, totalDuration: 0 });
  const [showAllTopics, setShowAllTopics] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All Missions");
  const [customTopic, setCustomTopic] = useState('');
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const navigate = useNavigate();

  const handleCreateCustomMission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTopic.trim() || isCreatingCustom) return;

    setIsCreatingCustom(true);
    try {
      const topicData: Omit<Topic, 'id'> = {
        title: customTopic.trim(),
        category: "Custom Mission",
        difficulty: "Medium",
        // We could use Gemini here to determine category/difficulty if we wanted
      };
      const docRef = await addDoc(collection(db, 'topics'), topicData);
      navigate(`/practice/${docRef.id}`);
    } catch (err) {
      console.error("Error creating custom mission:", err);
      setIsCreatingCustom(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const topicSnap = await getDocs(collection(db, 'topics'));
        if (topicSnap.empty) {
          const promises = SEED_TOPICS.map(t => addDoc(collection(db, 'topics'), t));
          await Promise.all(promises);
          const newSnap = await getDocs(collection(db, 'topics'));
          setTopics(newSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Topic)));
        } else {
          setTopics(topicSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Topic)));
        }

        const user = auth.currentUser;
        if (user) {
          const sessionsQuery = query(
            collection(db, 'practiceSessions'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc'),
            limit(3)
          );
          const sessionSnap = await getDocs(sessionsQuery);
          const sessions = sessionSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as PracticeSession));
          setRecentSessions(sessions);

          const allSessionsQuery = query(collection(db, 'practiceSessions'), where('userId', '==', user.uid));
          const allSnap = await getDocs(allSessionsQuery);
          const total = allSnap.size;
          const totalScore = allSnap.docs.reduce((acc, d) => acc + (d.data().feedback?.overallScore || 0), 0);
          const totalDuration = allSnap.docs.reduce((acc, d) => acc + (d.data().durationSeconds || 0), 0);
          
          setStats({
            total,
            avgScore: total > 0 ? parseFloat((totalScore / total).toFixed(1)) : 0,
            totalDuration
          });
        }
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return (
    <div className="animate-pulse space-y-8 max-w-6xl mx-auto py-10">
      <div className="h-64 glass-dark rounded-4xl w-full"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-40 glass-dark rounded-3xl"></div>
        <div className="h-40 glass-dark rounded-3xl"></div>
        <div className="h-40 glass-dark rounded-3xl"></div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-16 py-10 relative">
      {/* Decorative Background Blob */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
      
      {/* Welcome Header */}
      <section className="glass-dark p-12 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-10 overflow-hidden relative group">
        <div className="relative z-10 text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-center md:justify-start gap-2 mb-4"
          >
            <Sparkles className="w-5 h-5 text-brand-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-brand-400">Personal Evaluation Hub</span>
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-display uppercase leading-none mb-6">
            Welcome back, <span className="text-gradient">{auth.currentUser?.displayName?.split(' ')[0] || 'Speakster'}!</span>
          </h1>
          <p className="text-slate-400 font-light max-w-md text-lg leading-relaxed">
            Your journey to communication excellence continues here. Ready for your next challenge?
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 w-full relative z-10">
          <StatBox value={stats.total} label="TOTAL CHALLENGES" icon={<BookOpen className="w-5 h-5 text-brand-400"/>} />
          <StatBox value={stats.avgScore} label="AVG PERFORMANCE" icon={<Trophy className="w-5 h-5 text-indigo-400"/>} suffix="/10" />
          <StatBox 
            value={stats.totalDuration > 3600 ? Math.floor(stats.totalDuration / 3600) : Math.floor(stats.totalDuration / 60)} 
            label={stats.totalDuration > 3600 ? "HOURS SPOKEN" : "MINUTES SPOKEN"} 
            icon={<Clock className="w-5 h-5 text-brand-400"/>} 
          />
        </div>
        
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 blur-[100px] -mr-48 -mt-48 group-hover:bg-brand-500/20 transition-all duration-700"></div>
      </section>

      {/* Global Performance Zone */}
      {stats.total > 0 && (
        <div className="w-full p-8 glass-dark rounded-[2rem] border-white/5 relative overflow-hidden group">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] mb-2" id="mastery-status-title">Overall Mastery Status</h3>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full animate-pulse shadow-[0_0_15px_rgba(255,255,255,0.3)] ${
                  stats.avgScore >= 9 ? 'bg-emerald-500 shadow-emerald-500/50' : 
                  stats.avgScore >= 5 ? 'bg-amber-500 shadow-amber-500/50' : 
                  'bg-rose-500 shadow-rose-500/50'
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
            
            <div className="flex-grow max-w-xl w-full">
              <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                <span>Proficiency Gauge</span>
                <span className={
                  stats.avgScore >= 9 ? 'text-emerald-400' : 
                  stats.avgScore >= 5 ? 'text-amber-400' : 
                  'text-rose-400'
                }>{stats.avgScore * 10}% ACHIEVED</span>
              </div>
              <div className="h-4 bg-white/5 rounded-full p-1 border border-white/5 relative">
                 <div className="absolute inset-0 flex">
                    <div className="h-full w-1/2 border-r border-white/10"></div>
                    <div className="h-full w-[40%] border-r border-white/10"></div>
                 </div>
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${stats.avgScore * 10}%` }}
                   className={`h-full rounded-full relative z-10 ${
                     stats.avgScore >= 9 ? 'bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 
                     stats.avgScore >= 5 ? 'bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 
                     'bg-gradient-to-r from-rose-600 to-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.3)]'
                   }`}
                 />
              </div>
              <div className="flex justify-between mt-2 text-[8px] font-black text-slate-700 uppercase tracking-[0.2em]">
                <span>Initiate</span>
                <span>Evolved</span>
                <span>Master</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Mission Input */}
      <div className="w-full glass-dark p-1 rounded-[2.5rem] border-white/5 bg-gradient-to-r from-brand-500/20 to-transparent relative z-10">
        <div className="bg-slate-950/40 rounded-[2.4rem] p-8 flex flex-col lg:flex-row items-center gap-8">
          <div className="flex items-center gap-4 flex-shrink-0">
             <div className="w-14 h-14 bg-brand-500/10 rounded-2xl flex items-center justify-center border border-brand-500/20">
                <Edit3 className="w-7 h-7 text-brand-400" />
             </div>
             <div>
                <h3 className="text-xl font-display uppercase tracking-tight text-white leading-none mb-1">Custom Mission</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Define your own arena</p>
             </div>
          </div>
          
          <form onSubmit={handleCreateCustomMission} className="flex-grow w-full flex gap-4">
             <input 
               type="text" 
               value={customTopic}
               onChange={(e) => setCustomTopic(e.target.value)}
               placeholder="Enter a specific topic or scenario you want to prepare for..."
               className="flex-grow bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-white focus:border-brand-500/50 focus:bg-white/10 outline-none transition-all"
             />
             <button 
               disabled={!customTopic.trim() || isCreatingCustom}
               className="px-8 py-4 bg-brand-500 text-slate-950 font-black rounded-2xl uppercase tracking-widest text-xs hover:bg-brand-400 transition-all disabled:opacity-20 flex items-center gap-2 whitespace-nowrap"
             >
               {isCreatingCustom ? 'Booting...' : <><Sparkles className="w-4 h-4" /> Deploy Mission</>}
             </button>
          </form>
        </div>
      </div>

      {/* Recommended Topics */}
      <section className="px-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-brand-500/10 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-brand-400" />
            </div>
            <div>
              <h2 className="text-3xl font-display uppercase tracking-tight">
                {showAllTopics ? 'Practice Arenas' : 'Recommended for You'}
              </h2>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Select your specialized branch</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Category Filter Dropdown */}
            <div className="relative">
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none bg-white/5 border border-white/10 rounded-xl px-6 py-3 text-xs font-bold uppercase tracking-widest text-white outline-none focus:border-brand-500/50 transition-all cursor-pointer pr-12 min-w-[200px]"
              >
                {["All Missions", "Basic", "Common", "History", "Current", "Technology", "Social Issues", "Economy", "Environment", "Custom Mission"].map(cat => (
                  <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-30">
                <ChevronRight className="w-4 h-4 rotate-90" />
              </div>
            </div>

            <button 
              onClick={() => setShowAllTopics(!showAllTopics)}
              className="flex items-center gap-2 text-brand-400 text-sm font-bold uppercase tracking-widest hover:text-brand-300 transition-all group px-4 py-3 bg-brand-500/5 rounded-xl border border-brand-500/10"
            >
              {showAllTopics ? 'View Less' : 'View All'}
              <ChevronRight className={`w-4 h-4 group-hover:translate-x-1 transition-transform ${showAllTopics ? 'rotate-90' : ''}`} />
            </button>
          </div>
        </div>

        <motion.div 
          initial="hidden"
          animate="show"
          key={selectedCategory} // Re-animate on filter change
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {topics
            .filter(t => selectedCategory === "All Missions" || t.category === selectedCategory)
            .slice(0, showAllTopics ? undefined : 4).map((topic) => (
            <motion.div
              key={topic.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 }
              }}
            >
              <TopicCard topic={topic} />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Recent History & Quick Start */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 px-2">
        <section className="lg:col-span-2">
           <div className="flex items-center gap-3 mb-10">
             <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center">
               <motion.div
                 animate={{ rotate: [0, 10, -10, 0] }}
                 transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
               >
                 <Clock className="w-6 h-6 text-indigo-400" />
               </motion.div>
             </div>
             <h2 className="text-3xl font-display uppercase tracking-tight">Mission History</h2>
           </div>
           <div className="space-y-6">
             {recentSessions.length > 0 ? recentSessions.map((session, i) => (
               <motion.div
                 key={session.id}
                 initial={{ opacity: 0, x: -30 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: i * 0.15 }}
               >
                 <SessionCard session={session} />
               </motion.div>
             )) : (
               <div className="p-16 text-center glass-dark rounded-[2rem] border-2 border-dashed border-white/5 text-slate-500 font-light text-lg">
                 No missions completed yet. Initiate your first practice!
               </div>
             )}
           </div>
        </section>

        <section className="flex flex-col gap-8">
          <div className="bg-gradient-to-br from-brand-600 to-blue-800 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-brand-500/20 group">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-3xl font-display uppercase leading-none mb-4">Random Challenge</h3>
              <p className="text-blue-100/80 mb-10 text-sm font-medium leading-relaxed opacity-80">
                Put your adaptability to the test. Let the AI select a random topic to simulate high-pressure environment.
              </p>
              <button 
                onClick={() => {
                  const random = topics[Math.floor(Math.random() * topics.length)];
                  if (random) navigate(`/practice/${random.id}`);
                }}
                className="w-full py-5 bg-slate-950 text-white font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-900 transition-all shadow-xl"
              >
                 INITIATE QUICK START <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            {/* Shapes */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl -mr-10 -mt-10 group-hover:scale-125 transition-transform duration-700"></div>
          </div>

          <div className="glass-dark p-8 rounded-[2rem] border-brand-500/10">
            <h4 className="text-xs font-bold text-brand-400 uppercase tracking-[0.2em] mb-4">Daily Goal</h4>
            <div className="flex items-end justify-between mb-2">
               <span className="text-3xl font-display leading-none">{recentSessions.length}<span className="text-lg opacity-30 mx-1">/</span>3</span>
               <span className="text-xs font-bold text-slate-500">{(recentSessions.length / 3 * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${(recentSessions.length / 3) * 100}%` }}
                 className="h-full bg-gradient-to-r from-brand-500 to-blue-500"
               />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatBox({ value, label, icon, suffix = "" }: { value: any, label: string, icon: any, suffix?: string }) {
  return (
    <div className="p-6 glass rounded-3xl min-w-[180px] border-white/5 hover:border-white/10 transition-colors">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-black/40 rounded-lg flex items-center justify-center">
          {icon}
        </div>
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</div>
      </div>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-display leading-none"
      >
        {value}<span className="text-lg opacity-40 font-sans font-black ml-0.5">{suffix}</span>
      </motion.div>
    </div>
  );
}

function TopicCard({ topic }: { topic: Topic }) {
  const difficultyColors = {
    Easy: 'text-emerald-400 bg-emerald-400/10',
    Medium: 'text-brand-400 bg-brand-400/10',
    Hard: 'text-rose-400 bg-rose-400/10'
  };

  return (
    <motion.div 
      whileHover={{ y: -10, scale: 1.02 }}
      className="glass-dark p-8 rounded-[2rem] border-white/5 hover:border-brand-500/30 transition-all group flex flex-col h-full relative overflow-hidden shadow-2xl hover:shadow-brand-500/10"
    >
      <div className="flex justify-between items-start mb-6 relative z-10">
        <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${difficultyColors[topic.difficulty]}`}>
          {topic.difficulty}
        </span>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{topic.category}</span>
      </div>
      <h3 className="text-xl font-bold text-white mb-10 flex-grow leading-tight relative z-10 group-hover:text-brand-400 transition-colors">
        {topic.title}
      </h3>
      <Link 
        to={`/practice/${topic.id}`}
        className="w-full py-4 glass text-white font-bold rounded-xl text-center text-xs uppercase tracking-widest group-hover:bg-brand-500 group-hover:text-slate-950 group-hover:border-transparent transition-all relative z-10"
      >
        Initiate Training
      </Link>
      
      {/* Texture background */}
      <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none group-hover:opacity-10 transition-opacity">
        <Sparkles className="w-24 h-24 rotate-12" />
      </div>
    </motion.div>
  );
}

function SessionCard({ session }: { session: PracticeSession }) {
  return (
    <motion.div
      whileHover={{ scale: 1.01, x: 5 }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Link to={`/result/${session.id}`} className="block p-6 glass-dark rounded-3xl border-transparent hover:border-brand-500/20 hover:bg-white/5 transition-all group shadow-lg hover:shadow-brand-500/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-brand-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Star className="w-7 h-7 text-brand-400" />
          </div>
          <div>
            <h4 className="text-xl font-bold text-white mb-2 group-hover:text-brand-400 transition-colors uppercase tracking-tight">{session.topicTitle}</h4>
            <div className="flex items-center gap-4">
               <span className="text-xs text-slate-500 flex items-center gap-1.5 font-bold uppercase tracking-widest">
                 <Clock className="w-3.5 h-3.5"/> {session.durationSeconds} SECONDS
               </span>
               <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
               <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                 {new Date(session.createdAt.seconds * 1000).toLocaleDateString()}
               </span>
            </div>
          </div>
        </div>
        <div className="text-right flex items-center gap-4">
          <div className="w-px h-12 bg-white/5 mx-2 md:mx-4"></div>
          <div>
            <div className="text-3xl font-display leading-none text-brand-400">
              {session.feedback?.overallScore || 0}<span className="text-sm opacity-30 font-sans ml-1">/10</span>
            </div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">PERFORMANCE</div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-brand-400 group-hover:translate-x-1 transition-all ml-4" />
        </div>
      </div>
    </Link>
    </motion.div>
  );
}
