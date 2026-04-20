import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, PlayCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '../../components/ui';
import { DataService } from '../../services/dataService';

interface Balloon {
  id: string;
  x: number;
  y: number;
  color: string;
  speed: number;
  size: number;
}

interface PopEffect {
  id: string;
  x: number;
  y: number;
}

export const BalloonPopActivity = () => {
  const navigate = useNavigate();
  const user = DataService.getCurrentUser();
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [popEffects, setPopEffects] = useState<PopEffect[]>([]);
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);
  const startTime = useRef(Date.now());
  const gameInterval = useRef<any>(null);

  const colors = ['#93C5FD', '#60A5FA', '#FF9EAA', '#D8B4FE', '#86EFAC'];

  const spawnBalloon = () => {
    const id = Math.random().toString(36).substring(2, 9);
    const newBalloon: Balloon = {
      id,
      x: Math.random() * 80 + 10, // 10% to 90%
      y: 110, // Start below screen
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: Math.random() * 2 + 1,
      size: Math.random() * 20 + 60 // 60px to 80px
    };
    setBalloons(prev => [...prev, newBalloon]);
  };

  useEffect(() => {
    if (gameActive && timeLeft > 0) {
      gameInterval.current = setInterval(() => {
        spawnBalloon();
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameActive) {
      clearInterval(gameInterval.current);
      endGame();
    }
    return () => clearInterval(gameInterval.current);
  }, [gameActive, timeLeft]);

  // Balloon animation loop
  useEffect(() => {
    if (!gameActive) return;
    const interval = setInterval(() => {
      setBalloons(prev => 
        prev
          .map(b => ({ ...b, y: b.y - b.speed }))
          .filter(b => b.y > -20) // Filter out if off screen
      );
    }, 30);
    return () => clearInterval(interval);
  }, [gameActive]);

  const pop = (id: string, x: number, y: number) => {
    setBalloons(prev => prev.filter(b => b.id !== id));
    setScore(s => s + 1);
    
    // Add pop effect (X)
    const effectId = Math.random().toString(36).substring(7);
    setPopEffects(prev => [...prev, { id: effectId, x, y }]);
    
    // Auto-remove effect after 500ms
    setTimeout(() => {
      setPopEffects(prev => prev.filter(e => e.id !== effectId));
    }, 500);
  };

  const endGame = async () => {
    if (!gameActive) return; // Prevent double call
    setGameActive(false);
    const duration = Math.floor((Date.now() - startTime.current) / 1000);
    if (user && score > 0) {
      await DataService.saveActivityLog({
        user_id: user.user_id,
        result_name: `Balloon Pop (${score} popped)`,
        duration: duration
      });
    }
  };

  const finish = () => {
    navigate('/activities');
  };

  return (
    <div className="h-full bg-blue-50 flex flex-col items-center justify-center p-6 overflow-hidden relative">
      <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50">
        <button onClick={finish} className="p-2 bg-white/80 rounded-full shadow-sm">
          <ArrowLeft size={24} className="text-blue-400" />
        </button>
        <div className="bg-white/80 px-4 py-2 rounded-full shadow-sm flex items-center gap-4">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Time: {timeLeft}s</span>
          <span className="text-xl font-bold text-blue-500">{score}</span>
        </div>
      </header>

      {!gameActive && timeLeft > 0 ? (
        <div className="z-50 space-y-6 text-center">
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto shadow-lg mb-4">
                <span className="text-6xl animate-bounce">🎈</span>
            </div>
          <h2 className="text-2xl font-bold text-blue-500 uppercase tracking-widest">Pop The Balloons!</h2>
          <p className="text-gray-400 text-sm px-10">Tap the floating balloons to flick away your worries.</p>
          <Button onClick={() => setGameActive(true)} size="lg" className="bg-blue-400">
            Start Flicking
          </Button>
        </div>
      ) : timeLeft === 0 ? (
        <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="z-50 text-center space-y-6"
        >
          <h2 className="text-4xl font-bold text-blue-500">Time's Up!</h2>
          <Card className="p-8">
            <p className="text-sm font-bold text-gray-300 uppercase">Your Score</p>
            <p className="text-7xl font-black text-blue-500 my-2">{score}</p>
            <p className="text-gray-400 text-xs mt-4">Great focus! You're getting stronger.</p>
          </Card>
          <div className="flex flex-col gap-3">
              <Button onClick={() => { setTimeLeft(20); setScore(0); setBalloons([]); setGameActive(true); }}>Play Again</Button>
              <Button variant="ghost" onClick={finish}>Back to Menu</Button>
          </div>
        </motion.div>
      ) : null}

      {/* Balloons Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <AnimatePresence>
          {balloons.map(b => (
            <motion.div
              key={b.id}
              initial={{ scale: 0.8 }}
              exit={{ scale: 1.5, opacity: 0 }}
              style={{
                left: `${b.x}%`,
                top: `${b.y}%`,
                width: b.size,
                height: b.size * 1.2,
                backgroundColor: b.color
              }}
              className="absolute rounded-full shadow-lg cursor-pointer flex flex-col items-center pointer-events-auto transition-transform"
              onClick={() => pop(b.id, b.x, b.y)}
            >
                {/* Balloon Tie (Knot) */}
                <div 
                  className="w-4 h-3 absolute -bottom-1.5 opacity-90" 
                  style={{ 
                    clipPath: 'polygon(50% 100%, 0% 0%, 100% 0%)',
                    backgroundColor: b.color 
                  }} 
                />
                
                {/* Balloon String (Curved SVG) */}
                <svg 
                  className="absolute -bottom-12 w-8 h-12 pointer-events-none opacity-40" 
                  viewBox="0 0 20 40" 
                  fill="none"
                >
                  <path 
                    d="M 10 0 C 20 10 0 20 10 30" 
                    stroke={b.color} 
                    strokeWidth="2" 
                    strokeLinecap="round"
                  />
                </svg>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Pop Effects Layer */}
        <AnimatePresence>
          {popEffects.map(effect => (
            <motion.div
              key={effect.id}
              initial={{ scale: 0.5, opacity: 1 }}
              animate={{ scale: 1.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              style={{
                left: `${effect.x}%`,
                top: `${effect.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
              className="absolute pointer-events-none z-20 text-red-500 font-bold"
            >
              <X size={40} strokeWidth={4} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
