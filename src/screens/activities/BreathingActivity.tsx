import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui';
import { DataService } from '../../services/dataService';

export const BreathingActivity = () => {
  const navigate = useNavigate();
  const user = DataService.getCurrentUser();
  const [phase, setPhase] = useState<'In' | 'Hold' | 'Out'>('In');
  const [count, setCount] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const startTime = useRef(Date.now());
  const isFinished = useRef(false);

  useEffect(() => {
    if (count >= 5 && !isFinished.current) {
      setIsActive(false);
      finish();
      return;
    }

    let timer: any;
    if (isActive) {
      if (phase === 'In') {
        timer = setTimeout(() => setPhase('Hold'), 4000);
      } else if (phase === 'Hold') {
        timer = setTimeout(() => setPhase('Out'), 2000);
      } else if (phase === 'Out') {
        timer = setTimeout(() => {
          setPhase('In');
          setCount(c => c + 1);
        }, 4000);
      }
    }
    return () => clearTimeout(timer);
  }, [phase, isActive, count]);

  const finish = async () => {
    if (isFinished.current) return;
    isFinished.current = true;
    
    const duration = Math.floor((Date.now() - startTime.current) / 1000);
    // Use the latest count
    if (user && count > 0) {
      await DataService.saveActivityLog({
        user_id: user.user_id,
        result_name: `Mindful Breathing (${count} cycles)`,
        duration: duration
      });
    }
    navigate('/activities');
  };

  const phaseColors = {
    'In': 'bg-blue-300',
    'Hold': 'bg-green-300',
    'Out': 'bg-blue-200'
  };

  return (
    <div className="flex flex-col h-full bg-[#EBF5FF] p-6 text-center overflow-y-auto">
      {/* Centered Constrained Container */}
      <div className="max-w-md mx-auto w-full flex flex-col h-full">
        <header className="flex items-center justify-between mb-2">
          <button onClick={finish} className="p-2 bg-white rounded-full shadow-sm text-blue-400">
            <ArrowLeft size={20} />
          </button>
          <span className="text-sm font-bold text-blue-800 uppercase tracking-widest">Mindful breath</span>
          <div className="w-9" />
        </header>

        <section className="space-y-4 pt-4 mb-14">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-blue-900">Breath Connection</h2>
            <p className="text-[11px] text-blue-500 font-medium px-4 leading-relaxed">
              Follow the expanding circle. 4s Inhale, 2s Hold, 4s Exhale. <br/>
              Complete <span className="font-bold">5 cycles</span> to feel more centered.
            </p>
          </div>
        </section>

        <div className="flex-1 flex flex-col items-center justify-start space-y-6">
          {/* Ball Section with fixed height and no overlap */}
          <div className="relative flex items-center justify-center p-8 h-44 w-44 mx-auto mb-6">
            <motion.div
              animate={{
                scale: phase === 'In' || phase === 'Hold' ? 1.45 : 0.85,
              }}
              transition={{
                duration: 4,
                ease: "easeInOut"
              }}
              className={`w-30 h-30 rounded-full shadow-2xl opacity-90 ${phaseColors[phase]} border-[6px] border-white/20`}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white font-black text-lg uppercase tracking-[0.2em] drop-shadow-lg">
              {isActive ? phase : 'Ready?'}
            </div>
          </div>

          <div className="space-y-1 bg-white/40 py-4 px-8 rounded-3xl backdrop-blur-sm border border-white/20 inline-block mx-auto">
            <p className="text-blue-500 font-bold uppercase tracking-widest text-[9px]">Cycles Completed</p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-black text-blue-800">{count}</span>
              <span className="text-sm font-bold text-blue-800/40">/ 5</span>
            </div>
          </div>

          <div className="w-full max-w-[220px] mx-auto pt-8 pb-4 space-y-6">
            {!isActive ? (
              <Button onClick={() => setIsActive(true)} size="lg" className="w-full bg-blue-500 shadow-lg text-white font-bold h-14 rounded-2xl">
                Start Activity
              </Button>
            ) : (
              <div className="space-y-4">
                <p className="text-blue-400/60 text-xs font-medium animate-pulse tracking-wide">Flow with your breath...</p>
                <Button 
                  onClick={() => setIsActive(false)} 
                  variant="outline" 
                  className="w-full border-blue-200 bg-white/50 text-blue-500 font-bold h-12 rounded-2xl"
                >
                  Stop & Rest
                </Button>
              </div>
            )}
            
            <Button variant="ghost" onClick={finish} className="text-blue-400 font-bold text-xs w-full">
              Exit Game
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
