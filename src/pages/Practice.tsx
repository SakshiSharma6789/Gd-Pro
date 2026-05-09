import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Topic, Feedback } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Send, Clock, AlertCircle, Edit3, Save, RotateCcw, Power, Terminal, X } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

// const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function Practice() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isTimeOver, setIsTimeOver] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const fetchTopic = async () => {
      if (!topicId) return;
      const docSnap = await getDoc(doc(db, 'topics', topicId));
      if (docSnap.exists()) {
        setTopic({ id: docSnap.id, ...docSnap.data() } as Topic);
      }
    };
    fetchTopic();

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let finalSegment = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalSegment += event.results[i][0].transcript;
          }
        }
        if (finalSegment) {
          setTranscript(prev => (prev + ' ' + finalSegment).trim());
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };
    }
  }, [topicId]);

  useEffect(() => {
    let timer: any;
    if (hasStarted && !hasFinished && timeLeft > 0 && !isSubmitting) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (hasStarted && !hasFinished && timeLeft === 0) {
      handleAutoSubmit();
    }
    return () => clearInterval(timer);
  }, [hasStarted, hasFinished, timeLeft, isSubmitting]);

  const toggleRecording = () => {
    if (!hasStarted) setHasStarted(true);
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
    setIsRecording(!isRecording);
  };

  const handleAutoSubmit = async () => {
    if (hasFinished) return;
    setHasFinished(true);

    // 1. Force stop recording
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    }

    // 2. Trigger vibrant animation
    setIsTimeOver(true);

    // 3. Display overlay and proceed
    try {
      if (transcript.trim().length > 20) {
        await handleSubmit();
      } else {
        await handleFailedSession();
      }
    } catch (err) {
      setError("SESSION_AUTO_FINALIZE_FAILURE: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleFailedSession = async () => {
    setIsSubmitting(true);
    setIsTimeOver(false); // Double check overlay is off
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('AUTH_FAIL');

      const failedFeedback: Feedback = {
        overallScore: 0,
        relevance: 0,
        clarity: 0,
        structure: 0,
        confidence: 0,
        strengths: ["Transmission failed - insufficient input"],
        mistakes: ["No verbal or textual data detected before signal timeout"],
        missingPoints: ["Analysis incomplete due to lack of data"],
        improvedAnswer: "Gather more data and re-transmit for tactical analysis.",
        tips: ["Ensure microphone clearance and maintain consistent commentary throughout the buffer"]
      };

      const sessionDoc = await addDoc(collection(db, 'practiceSessions'), {
        userId: user.uid,
        topicId: topic?.id,
        topicTitle: topic?.title,
        topicCategory: topic?.category,
        answerText: transcript || "EMPTY_BUFFER",
        durationSeconds: 120,
        createdAt: serverTimestamp(),
        feedback: failedFeedback,
        status: 'FAILED'
      });

      navigate(`/result/${sessionDoc.id}`);
    } catch (err: any) {
      setError("SESSION_FINALIZATION_ERROR: Critical failure in local buffer dump.");
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (transcript.trim().length < 50) {
      setError('TRANSMISSION_ERROR: Data packets too small (min 50 chars required).');
      return;
    }

    setHasFinished(true);
    setIsSubmitting(true);
    setError('');
    
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('AUTH_FAIL: Session not established.');

      const prompt = `
        You are an expert Group Discussion (GD) evaluator. 
        Evaluate the following response for the topic: "${topic?.title}".
        
        User Answer: "${transcript}"
        
        Provide a detailed evaluation in JSON format.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallScore: { type: Type.NUMBER, description: "Overall score out of 10" },
              relevance: { type: Type.NUMBER, description: "Relevance score out of 10" },
              clarity: { type: Type.NUMBER, description: "Clarity score out of 10" },
              structure: { type: Type.NUMBER, description: "Structure score out of 10" },
              confidence: { type: Type.NUMBER, description: "Confidence score out of 10" },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              mistakes: { type: Type.ARRAY, items: { type: Type.STRING } },
              missingPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
              improvedAnswer: { type: Type.STRING },
              tips: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["overallScore", "relevance", "clarity", "structure", "confidence", "strengths", "mistakes", "missingPoints", "improvedAnswer", "tips"]
          }
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error('AI_EMPTY_RESPONSE: Signal lost during interpretation.');
      }

      const feedback: Feedback = JSON.parse(text);

      const sessionDoc = await addDoc(collection(db, 'practiceSessions'), {
        userId: user.uid,
        topicId: topic?.id,
        topicTitle: topic?.title,
        topicCategory: topic?.category,
        answerText: transcript,
        durationSeconds: 120 - timeLeft,
        createdAt: serverTimestamp(),
        feedback
      });

      navigate(`/result/${sessionDoc.id}`);
    } catch (err: any) {
      console.error('AI Evaluation Error Details:', err);
      setError(err.message || 'EVAL_SYS_FAIL: Processing error.');
      setIsSubmitting(false);
    }
  };

  if (!topic) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4">
      <div className="w-12 h-12 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
      <div className="text-xs font-mono text-brand-400 uppercase tracking-widest">Booting Challenge Core...</div>
    </div>
  );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 py-10 px-4">
      {/* Time's Over Overlay */}
      <AnimatePresence>
        {isTimeOver && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl"
          >
            <button 
              onClick={() => setIsTimeOver(false)}
              className="absolute top-10 right-10 p-4 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-all z-[110]"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.div 
              initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 12, stiffness: 200 }}
              className="text-center"
            >
              <div className="relative">
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="absolute inset-0 bg-red-500 blur-3xl rounded-full"
                />
                <h2 className="relative text-7xl md:text-9xl font-display font-black text-white uppercase tracking-tighter leading-none mb-4">
                  TIME'S <span className="text-red-500">OVER</span>
                </h2>
              </div>
              <p className="text-red-400 font-mono text-sm uppercase tracking-[0.5em] animate-pulse">Syncing Buffer to Core Hub...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Simulation Header */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 glass-dark p-10 rounded-[2rem] border-white/5 relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
               <div className={`w-2 h-2 rounded-full ${hasStarted ? 'bg-brand-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-slate-700'}`}></div>
               <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-400">
                 {hasStarted ? 'Live Simulation Active' : 'System Standby - Ready'}
               </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display uppercase leading-tight tracking-tight text-white mb-4">
              {topic.title}
            </h1>
            <div className="flex items-center gap-4 text-xs font-mono text-slate-500 uppercase">
               <span>ID: {topic.id?.slice(0, 8)}</span>
               <span className="opacity-30">|</span>
               <span>Cat: {topic.category}</span>
               <span className="opacity-30">|</span>
               <span>Diff: {topic.difficulty}</span>
            </div>
          </div>
          <div className="absolute top-0 right-0 p-10 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
            <Terminal className="w-64 h-64" />
          </div>
        </div>

        <div className={`glass-dark p-10 rounded-[2rem] flex flex-col items-center justify-center gap-2 border-2 transition-all duration-500 ${timeLeft < 20 ? 'border-red-500/30 bg-red-500/5' : 'border-brand-500/10'}`}>
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-2">
            <Clock className={`w-8 h-8 ${timeLeft < 20 ? 'text-red-500 animate-pulse' : 'text-brand-400'}`} />
          </div>
          <div className={`text-5xl font-mono tracking-tighter ${timeLeft < 20 ? 'text-red-500' : 'text-white'}`}>
            {formatTime(timeLeft)}
          </div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2 text-center">Remaining Buffer</span>
        </div>
      </div>

      {/* Control Deck */}
      <div className="glass-dark p-1 rounded-[2.5rem] border-white/5 bg-gradient-to-b from-white/5 to-transparent">
        <div className="bg-slate-950/80 rounded-[2.2rem] p-8 md:p-12">
           <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-brand-500/10 rounded-xl flex items-center justify-center">
                 <Edit3 className="w-5 h-5 text-brand-400" />
               </div>
               <h2 className="text-xl font-bold text-white uppercase tracking-tight">Input Stream</h2>
             </div>
             <div className="flex items-center gap-6">
               <div className="flex flex-col items-end">
                  <span className={`text-xs font-mono ${transcript.length >= 50 ? 'text-emerald-400' : 'text-slate-500'}`}>
                    LEN_{transcript.length.toString().padStart(4, '0')}
                  </span>
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">MIN_REQ: 0050</span>
               </div>
               <div className="w-px h-8 bg-white/5"></div>
               <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-700'}`}></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{isRecording ? 'SYNCED' : 'STANDBY'}</span>
               </div>
             </div>
           </div>

           <div className="relative">
             <textarea 
               value={transcript}
               onChange={(e) => setTranscript(e.target.value)}
               className="w-full h-80 p-8 bg-white/5 rounded-3xl border border-white/5 focus:border-brand-500/30 focus:bg-white/10 outline-none text-xl text-slate-100 leading-relaxed transition-all resize-none mb-10 font-mono"
               placeholder="Initiate recording to stream audio data, or input manually via terminal..."
             />
             {isRecording && (
               <motion.div 
                 animate={{ top: ["0%", "100%", "0%"] }}
                 transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                 className="absolute left-0 right-0 h-px bg-brand-500/20 pointer-events-none z-20"
               />
             )}
           </div>

           <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
             <div className="flex items-center gap-6">
               <button 
                 onClick={toggleRecording}
                 className={`group relative w-20 h-20 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 text-white' : 'bg-brand-500 text-slate-950 shadow-[0_0_30px_rgba(245,158,11,0.2)] hover:scale-110 active:scale-95'}`}
               >
                 {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                 {isRecording && (
                    <motion.div 
                      className="absolute inset-0 rounded-full border-4 border-red-500/50"
                      initial={{ scale: 1, opacity: 0.8 }}
                      animate={{ scale: 1.6, opacity: 0 }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                 )}
               </button>
               <div>
                  <div className={`text-lg font-bold uppercase tracking-tight ${isRecording ? 'text-red-500' : 'text-white'}`}>
                    {isRecording ? "Transmitting..." : "Mic Control"}
                  </div>
                  <div className="text-xs text-slate-500 uppercase font-bold tracking-[0.2em]">{isRecording ? "High Fidelity Stream" : "System Ready"}</div>
               </div>
             </div>

             <div className="flex items-center gap-4 w-full sm:w-auto">
               <button 
                  onClick={() => setTranscript('')}
                  className="p-5 bg-white/5 text-slate-400 rounded-2xl hover:bg-white/10 hover:text-white transition-all border border-white/5"
                  title="PURGE CACHE"
               >
                 <RotateCcw className="w-6 h-6" />
               </button>
               <button 
                  disabled={isSubmitting || transcript.trim().length < 10}
                  onClick={handleSubmit}
                  className="flex-grow sm:flex-grow-0 px-12 py-5 bg-white text-slate-950 font-black rounded-2xl shadow-xl hover:bg-brand-400 transition-all disabled:opacity-20 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
               >
                 {isSubmitting ? 'ANALYZING...' : <><Send className="w-5 h-5"/> UPLOAD TO AI</>}
               </button>
             </div>
           </div>

           <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-10 p-6 bg-red-500/10 border border-red-500/20 rounded-[2rem] flex items-center gap-4 text-red-500 text-sm font-bold animate-shake"
              >
                  <AlertCircle className="w-6 h-6 flex-shrink-0" />
                  <span className="font-mono tracking-tight uppercase">{error}</span>
              </motion.div>
            )}
           </AnimatePresence>
        </div>
      </div>

      {/* Operator Guidelines */}
      <div className="glass-dark rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center gap-10 border border-white/5 relative overflow-hidden group">
        <div className="w-20 h-20 bg-brand-500/10 rounded-3xl flex items-center justify-center flex-shrink-0 border border-brand-500/20">
           <Power className="w-10 h-10 text-brand-400 group-hover:rotate-12 transition-transform" />
        </div>
        <div className="relative z-10 text-center md:text-left">
          <h3 className="text-2xl font-display uppercase tracking-tight text-white mb-3">Tactical Protocol</h3>
          <p className="text-slate-400 max-w-2xl leading-relaxed font-light">
            Structure your transmission: <strong className="text-brand-400 font-bold uppercase tracking-tighter">Phase 01: Core Thesis</strong> (Set context), <strong className="text-brand-400 font-bold uppercase tracking-tighter">Phase 02: Analytical Points</strong> (Deep dive), and <strong className="text-brand-400 font-bold uppercase tracking-tighter">Phase 03: Final Synthesis</strong> (Summarize). 
          </p>
        </div>
        <div className="absolute top-0 right-0 p-8 opacity-[0.02] text-9xl font-display uppercase select-none pointer-events-none">PROTO</div>
      </div>
    </div>
  );
}
