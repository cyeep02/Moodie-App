import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Card, Button, Input } from '../components/ui';
import { MOOD_CONFIG, MoodLabel } from '../types';
import { DataService, AlertService } from '../services/dataService';
import { Check } from 'lucide-react';

export const MoodCheckIn = () => {
  const navigate = useNavigate();
  const user = DataService.getCurrentUser();
  const [selectedMood, setSelectedMood] = useState<MoodLabel | null>(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!selectedMood || !user) return;

    setLoading(true);
    const moodData = MOOD_CONFIG[selectedMood];
    
    await DataService.saveMoodLog({
      user_id: user.user_id,
      mood_emoji: moodData.emoji,
      mood_label: selectedMood,
      mood_score: moodData.score,
      note: note
    });

    const risk = await AlertService.checkRiskPatterns(user.user_id);
    if (risk.trigger) {
      console.log("Risk detected:", risk.reason);
      // In a real app, this would trigger the actual parent notification logic
    }

    setLoading(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="p-6 h-full flex flex-col items-center justify-center space-y-6 text-center">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center shadow-lg"
        >
          <Check size={48} strokeWidth={3} />
        </motion.div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-800">Check-in Complete!</h2>
          <p className="text-gray-500 px-8">Great job sharing your feelings. It's a brave thing to do.</p>
        </div>
        <div className="flex flex-col w-full gap-3 px-6 pt-6">
          <Button onClick={() => navigate('/activities')}>Try an Activity</Button>
          <Button variant="secondary" onClick={() => navigate('/')}>Back to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 pb-12 overflow-y-auto max-h-screen">
      <header className="space-y-1 text-center pt-4">
        <h2 className="text-2xl font-bold text-gray-800">Mood Check-in</h2>
        <p className="text-gray-500">Pick the emoji that best matches you.</p>
      </header>

      {/* Emoji Selection Box */}
      <Card className="bg-slate-200 border-none p-6 rounded-[40px] shadow-inner">
        <div className="grid grid-cols-3 gap-4">
          {(Object.keys(MOOD_CONFIG) as MoodLabel[]).map((label) => {
            const config = MOOD_CONFIG[label];
            const isActive = selectedMood === label;
            return (
              <motion.div
                key={label}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedMood(label)}
                className={`
                  aspect-square rounded-2xl flex flex-col items-center justify-center border-2 transition-all cursor-pointer
                  ${isActive 
                    ? 'border-[#FF9EAA] bg-white shadow-md' 
                    : 'border-transparent bg-white hover:bg-white/90 hover:border-gray-100'}
                `}
              >
                <span className="text-4xl mb-1">{config.emoji}</span>
                <span className={`text-[10px] font-bold text-center px-1 leading-tight ${isActive ? 'text-[#FF9EAA]' : 'text-gray-400'}`}>
                  {label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </Card>

      {/* Note Section */}
      <section className="space-y-3">
        <h4 className="text-sm font-bold text-gray-700">Add a little note (optional)</h4>
        <textarea 
          placeholder="What's happening in your day?..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full h-32 p-4 rounded-3xl bg-white border-none shadow-sm outline-none text-gray-600 resize-none focus:ring-2 focus:ring-[#FF9EAA]/20"
        />
      </section>

      <Button 
        onClick={handleSubmit}
        disabled={!selectedMood || loading}
        className="w-full shadow-lg h-14"
      >
        {loading ? 'Saving...' : 'Complete Check-in'}
      </Button>
    </div>
  );
};
