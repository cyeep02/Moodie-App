import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  startOfMonth, endOfMonth, eachDayOfInterval, format, 
  isSameDay, startOfWeek, endOfWeek 
} from 'date-fns';
import { DataService } from '../services/dataService';
import { MoodLog, MOOD_CONFIG } from '../types';
import { Card } from '../components/ui';
import { Calendar as CalendarIcon, Activity, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

export const MoodCharts = () => {
  const user = DataService.getCurrentUser();
  const [logs, setLogs] = useState<MoodLog[]>([]);
  const [view, setView] = useState<'chart' | 'calendar'>('chart');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (user) {
      DataService.getMoodLogs(user.user_id).then(setLogs);
    }
  }, [user]);

  // Chart Logic
  const chartData = [...logs].reverse().map(l => ({
    displayDate: format(new Date(l.date), 'MMM d'),
    score: l.mood_score,
    label: l.mood_label,
    emoji: l.mood_emoji
  }));

  // Calendar Logic
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth)),
    end: endOfWeek(endOfMonth(currentMonth))
  });

  const getMoodForDay = (date: Date) => {
    const dayLogs = logs.filter(l => isSameDay(new Date(l.date), date));
    if (dayLogs.length === 0) return null;
    
    const avgScore = Math.round(dayLogs.reduce((acc, curr) => acc + curr.mood_score, 0) / dayLogs.length);
    const moodEntry = Object.entries(MOOD_CONFIG).find(([_, config]) => config.score === avgScore);
    
    return {
      emoji: moodEntry?.[1].emoji || '😶',
      score: avgScore,
      label: moodEntry?.[0] || 'Unknown'
    };
  };

  const getMonthStats = () => {
    const monthLogs = logs.filter(l => format(new Date(l.date), 'M') === format(currentMonth, 'M'));
    if (monthLogs.length === 0) return null;
    
    const avgScore = Math.round(monthLogs.reduce((acc, curr) => acc + curr.mood_score, 0) / monthLogs.length);
    const moodEntry = Object.entries(MOOD_CONFIG).find(([_, config]) => config.score === avgScore);
    
    return {
      emoji: moodEntry?.[1].emoji || '😶',
      label: moodEntry?.[0] || 'Unknown',
      count: monthLogs.length
    };
  };

  const monthStats = getMonthStats();

  return (
    <div className="p-6 space-y-6 pb-24">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Mood Trends</h2>
          <p className="text-gray-500 text-sm">See your emotional journey.</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button 
            onClick={() => setView('chart')}
            className={cn(
              "p-2 rounded-lg transition-all",
              view === 'chart' ? "bg-white shadow-sm text-[#FF9EAA]" : "text-gray-400"
            )}
          >
            <Activity size={18} />
          </button>
          <button 
            onClick={() => setView('calendar')}
            className={cn(
              "p-2 rounded-lg transition-all",
              view === 'calendar' ? "bg-white shadow-sm text-[#FF9EAA]" : "text-gray-400"
            )}
          >
            <CalendarIcon size={18} />
          </button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {view === 'chart' ? (
          <motion.div
            key="chart"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <Card className="h-64 px-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis 
                    dataKey="displayDate" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    stroke="#94a3b8"
                  />
                  <YAxis 
                    domain={[0, 5]} 
                    ticks={[0, 1, 2, 3, 4, 5]}
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    stroke="#94a3b8"
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 rounded-2xl shadow-lg border border-gray-100">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{data.displayDate}</p>
                            <p className="font-bold text-gray-800 flex items-center gap-2">
                              <span>{data.emoji}</span> {data.label}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#FF9EAA" 
                    strokeWidth={4} 
                    dot={{ fill: '#FF9EAA', r: 4, strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, fill: '#FF9EAA' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <section className="bg-white/50 p-4 rounded-3xl border border-white/80">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Score Guide</h4>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                {Object.entries(MOOD_CONFIG).sort((a,b) => b[1].score - a[1].score).map(([label, config]) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className="text-xs w-4 font-bold text-gray-400">{config.score}</span>
                    <span className="text-sm">{config.emoji}</span>
                    <span className="text-xs text-gray-600 font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-3 px-2">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Key Insights</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-3xl">
                  <p className="text-3xl font-black text-blue-500">
                    {logs.length > 0 ? (logs.reduce((a,b) => a+b.mood_score,0)/logs.length).toFixed(1) : '–'}
                  </p>
                  <p className="text-[10px] uppercase font-bold text-blue-400 mt-1">Average Score</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-3xl">
                  <p className="text-3xl font-black text-orange-500">{logs.length}</p>
                  <p className="text-[10px] uppercase font-bold text-orange-400 mt-1">Total Logs</p>
                </div>
              </div>
            </section>
          </motion.div>
        ) : (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Calendar Header */}
            <div className="flex items-center justify-between px-2">
              <h3 className="font-bold text-gray-700">{format(currentMonth, 'MMMM yyyy')}</h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))}
                  className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))}
                  className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {monthStats && (
              <Card className="p-4 bg-white/40 border-dashed border-2 border-[#FF9EAA]/20 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Month Summary</p>
                  <p className="text-lg font-bold text-gray-700">Mostly <span className="text-[#FF9EAA]">{monthStats.label}</span></p>
                  <p className="text-[10px] text-gray-400 font-medium">Based on {monthStats.count} entries</p>
                </div>
                <div className="text-4xl bg-white p-3 rounded-2xl shadow-sm border border-gray-50">
                  {monthStats.emoji}
                </div>
              </Card>
            )}

            <Card className="p-4">
              <div className="grid grid-cols-7 gap-1">
                {['S','M','T','W','T','F','S'].map((d, i) => (
                  <div key={`${d}-${i}`} className="text-center text-[10px] font-bold text-gray-300 py-2">{d}</div>
                ))}
                {days.map((day, i) => {
                  const mood = getMoodForDay(day);
                  const isCurrentMonth = format(day, 'M') === format(currentMonth, 'M');
                  const isCalm = mood && mood.score >= 3;
                  const isLowEnergy = mood && mood.score < 3;

                  return (
                    <div 
                      key={day.toISOString()} 
                      className={cn(
                        "aspect-square rounded-xl flex flex-col items-center justify-center text-xs relative",
                        !isCurrentMonth && "opacity-20",
                        isCalm && "bg-blue-50/80",
                        isLowEnergy && "bg-orange-50/80"
                      )}
                    >
                      <span className="text-[10px] font-medium text-gray-400 z-10">{format(day, 'd')}</span>
                      {mood && (
                        <div className="absolute inset-0 flex items-center justify-center pt-2">
                          <span className="text-lg">{mood.emoji}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            <div className="flex gap-4 justify-center text-[10px] text-gray-400 font-medium">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-100" /> Calm days
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-100" /> Low energy
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
