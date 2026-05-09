import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, BarChart3, History, Sparkles, Play, X } from 'lucide-react';

export default function Landing() {
  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Dynamic Background Blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            x: [0, 100, 0],
            y: [0, 50, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-500/10 blur-[150px] rounded-full"
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [0, -90, 0],
            x: [0, -100, 0],
            y: [0, -50, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full"
        />

        {/* Floating Icons */}
        <motion.div 
          animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] left-[15%] text-brand-500/20"
        >
          <Mic className="w-12 h-12" />
        </motion.div>
        <motion.div 
          animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-[30%] right-[20%] text-blue-500/20"
        >
          <Sparkles className="w-16 h-16" />
        </motion.div>
        <motion.div 
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[20%] left-[25%] text-blue-500/10 text-9xl font-display uppercase select-none"
        >
          Speak
        </motion.div>
      </div>

      {/* Hero Section */}
      <section className="w-full pt-24 pb-44 px-6 relative">
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ duration: 1 }}
           className="relative z-10 text-center max-w-5xl mx-auto"
        >
          <motion.span 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-block px-4 py-1.5 mb-8 text-xs font-bold tracking-[0.2em] uppercase bg-brand-500/10 text-brand-400 border border-brand-500/20 rounded-full"
          >
            The Future of Group Discussions
          </motion.span>
          
          <div className="overflow-hidden">
            <motion.h1 
              initial={{ y: 150 }}
              animate={{ y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="text-6xl md:text-9xl font-display uppercase leading-[0.85] mb-8 tracking-tight text-white"
            >
              Master the <br /> <span className="text-gradient">Art of Speaking</span>
            </motion.h1>
          </div>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="max-w-xl mx-auto text-lg md:text-xl text-slate-400 mb-12 font-light leading-relaxed"
          >
            Practice dynamically, receive AI-powered feedback in real-time, and refine your speaking skills with the world's most advanced GD coach.
          </motion.p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8, type: "spring" }}
            >
              <Link to="/auth" className="group relative px-12 py-6 bg-brand-500 text-slate-950 font-black rounded-2xl shadow-[0_0_50px_rgba(59,130,246,0.3)] hover:bg-brand-400 transition-all overflow-hidden flex items-center gap-3 text-sm uppercase tracking-widest">
                <span className="relative z-10">Initiate Training</span>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <BarChart3 className="w-5 h-5" />
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </motion.div>
        
      {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05)_0%,transparent_70%)]"></div>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-7xl px-6 pb-20">
        {[
          { icon: <Mic className="w-8 h-8 text-brand-400" />, title: "Speech-to-Text", description: "Speak your mind naturally. Our real-time transcription captures every word with high precision." },
          { icon: <Sparkles className="w-8 h-8 text-indigo-400" />, title: "AI Evaluation", description: "Powered by Gemini to provide deep insights on structure, clarity, and relevance after each session." },
          { icon: <BarChart3 className="w-8 h-8 text-indigo-500" />, title: "Growth Analytics", description: "Track your progress over time with visual dashboards and historical scorecards that never forget." }
        ].map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.2 }}
          >
            <FeatureCard 
              icon={f.icon}
              title={f.title}
              description={f.description}
            />
          </motion.div>
        ))}
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5, scale: 1.02 }}
      className="p-10 glass-dark rounded-4xl hover:border-brand-500/30 transition-all group cursor-default shadow-xl hover:shadow-brand-500/5"
    >
      <div className="w-16 h-16 bg-white/5 flex items-center justify-center rounded-2xl mb-8 group-hover:bg-brand-500/10 transition-colors group-hover:rotate-6">
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-4 text-white uppercase tracking-tight">{title}</h3>
      <p className="text-slate-400 leading-relaxed font-light">{description}</p>
    </motion.div>
  );
}
