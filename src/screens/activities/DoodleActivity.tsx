import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Eraser, Download, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui';
import { DataService } from '../../services/dataService';

export const DoodleActivity = () => {
  const navigate = useNavigate();
  const user = DataService.getCurrentUser();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#FF8095');
  const [brushSize, setBrushSize] = useState(5);
  const [showStatus, setShowStatus] = useState<string | null>(null);
  const startTime = useRef(Date.now());

  useEffect(() => {
    if (showStatus) {
      const timer = setTimeout(() => setShowStatus(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [showStatus]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas resolution
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Fill white
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getPos = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: any) => {
    setIsDrawing(true);
    const pos = getPos(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
    }
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    const pos = getPos(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    setShowStatus('Canvas Cleared');
  };

  const saveImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `my-doodle-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
    setShowStatus('Image Saved to Gallery');
  };

  const finish = async () => {
    const duration = Math.floor((Date.now() - startTime.current) / 1000);
    if (user) {
      await DataService.saveActivityLog({
        user_id: user.user_id,
        result_name: 'Creative Doodle',
        duration: duration
      });
    }
    navigate('/activities');
  };

  return (
    <div className="flex flex-col h-full bg-gray-100 overflow-hidden font-sans">
      <header className="px-2 py-2 flex items-center justify-between bg-white shadow-sm shrink-0 z-10">
        <div className="flex items-center">
          <button onClick={finish} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
            <ArrowLeft size={20} />
          </button>
          <span className="font-bold text-gray-800 text-xs hidden sm:inline">Doodle</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={saveImage} title="Save" className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Download size={16} />
          </button>
          <button onClick={clear} title="Clear" className="p-2 bg-red-50 text-red-500 rounded-lg">
            <Eraser size={16} />
          </button>
          <Button onClick={finish} className="h-9 px-6 bg-gray-900 hover:bg-black text-white font-bold rounded-lg text-xs shadow-md">
             Finish Activity
          </Button>
        </div>
      </header>

      <div className="flex-1 relative bg-white m-1 rounded-2xl overflow-hidden shadow-[inset_0_4px_20px_rgba(0,0,0,0.05)] border-2 border-gray-200">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full cursor-crosshair touch-none"
        />
        
        {/* Status Overlay */}
        <AnimatePresence>
          {showStatus && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 bg-gray-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-lg shadow-2xl z-50 pointer-events-none flex items-center gap-2 font-bold text-[9px] uppercase tracking-wider"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              {showStatus}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Compact Palette Section */}
      <div className="bg-white px-3 py-3 shrink-0 border-t border-gray-100 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
        <div className="max-w-2xl mx-auto space-y-3">
          <div className="text-center">
            <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Creative Palette</span>
          </div>
          <div className="grid grid-cols-9 gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {[
              '#FF5C8D', '#FF8095', '#FFD1DA', '#FF7F50', '#FFBD69', '#FFD700',
              '#4CB9E7', '#ADD8E6', '#B2A4FF', '#A084E8', '#90EE90', '#3E517A',
              '#333333', '#888888', '#CCCCCC', '#FFFFFF', '#CD5C5C', '#8B4513'
            ].map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`aspect-square w-full rounded-md border transition-all active:scale-90 ${color === c ? 'border-gray-800 scale-110 shadow-sm ring-1 ring-gray-200' : 'border-gray-50'}`}
                style={{ backgroundColor: c }}
              >
                {color === c && (
                  <div className="flex items-center justify-center">
                    <div className={`w-1.5 h-1.5 rounded-full ${c === '#FFFFFF' ? 'bg-gray-300' : 'bg-white'}`} />
                  </div>
                )}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-lg">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest shrink-0">Size</span>
            <input 
              type="range" min="2" max="40" 
              value={brushSize} 
              onChange={(e) => setBrushSize(parseInt(e.target.value))} 
              className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-800" 
            />
            <div 
              className="w-5 h-5 rounded-full border border-gray-200 shadow-sm shrink-0"
              style={{ backgroundColor: color, width: Math.min(brushSize, 20), height: Math.min(brushSize, 20) }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
