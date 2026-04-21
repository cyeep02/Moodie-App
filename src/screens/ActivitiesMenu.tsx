import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Card } from '../components/ui';
import { Wind, Palette, Ghost, Sparkles, MessageCircle, Clock } from 'lucide-react';
import { DataService } from '../services/dataService';
import { ActivityLog } from '../types';

const ACTIVITIES = [
  {
    id: 'breathing',
    title: 'Mindful Breathing',
    desc: 'Take a deep breath and relax.',
    icon: <Wind size={32} />,
    color: 'bg-blue-50 text-blue-500',
    path: '/activities/breathing'
  },
  {
    id: 'doodle',
    title: 'Creative Doodle',
    desc: 'Draw your feelings away.',
    icon: <Palette size={32} />,
    color: 'bg-orange-50 text-orange-500',
    path: '/activities/doodle'
  },
  {
    id: 'balloon',
    title: 'Balloon Pop',
    desc: 'Flick away the blue balloons!',
    icon: <Sparkles size={32} />,
    color: 'bg-purple-50 text-purple-500',
    path: '/activities/balloon-pop'
  },
  {
    id: 'panda',
    title: 'Panda Talk AI',
    desc: 'Chat with your supportive panda friend.',
    icon: <MessageCircle size={32} />,
    color: 'bg-green-50 text-green-600',
    path: '/activities/panda'
  }
];

export const ActivitiesMenu = () => {
  const navigate = useNavigate();
  const user = DataService.getCurrentUser();
  const [lastActivity, setLastActivity] = useState<ActivityLog | null>(null);

  useEffect(() => {
    if (user) {
      DataService.getActivityLogs(user.user_id).then(logs => {
        if (logs.length > 0) {
          // Sort by date and time to get the absolute last one
          const sorted = [...logs].sort((a, b) => {
            const dateComp = b.date.localeCompare(a.date);
            if (dateComp !== 0) return dateComp;
            return b.time.localeCompare(a.time);
          });
          setLastActivity(sorted[0]);
        }
      });
    }
  }, [user]);

  return (
    <div className="p-6 space-y-8 pb-24 overflow-y-auto max-h-screen">
      <header className="space-y-1 text-center pt-4">
        <h2 className="text-2xl font-bold text-gray-800">Mind Ease Menu</h2>
        <p className="text-gray-500">Pick an activity to help you regulate</p>
      </header>

      {/* Activity Container 2x2 */}
      <Card className="bg-slate-200 border-none p-6 rounded-[40px] shadow-inner">
        <div className="grid grid-cols-2 gap-4">
          {ACTIVITIES.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(activity.path)}
              className="aspect-square flex flex-col items-center justify-center p-4 bg-white rounded-3xl shadow-sm cursor-pointer hover:shadow-md active:scale-95 transition-all text-center"
            >
              <div className={`p-3 rounded-2xl mb-3 ${activity.color.split(' ')[0]}`}>
                {React.cloneElement(activity.icon as React.ReactElement, { size: 28 })}
              </div>
              <h3 className="font-bold text-[11px] leading-tight text-gray-700">{activity.title}</h3>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Your Last Game Section - Now below the grid */}
      {lastActivity && (
        <section className="space-y-3">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">Your Last Game</h4>
          <Card className="flex items-center gap-4">
            <div className="p-3 bg-gray-100 rounded-2xl text-gray-400">
              <Clock size={24} />
            </div>
            <div>
              <p className="font-bold text-gray-700">
                {lastActivity.result_name.includes('(') 
                  ? lastActivity.result_name.split('(')[0].trim() 
                  : lastActivity.result_name}
              </p>
              {lastActivity.result_name.includes('(') && (
                <p className="text-[10px] text-gray-500 font-medium leading-none mb-1">
                  ({lastActivity.result_name.split('(')[1]}
                </p>
              )}
              <p className="text-[10px] text-gray-400 font-medium tabular-nums">
                {lastActivity.date} {lastActivity.time}
              </p>
            </div>
          </Card>
        </section>
      )}

      <section className="bg-yellow-50 p-6 rounded-[2rem] border border-yellow-100 mt-4 space-y-2 text-center">
        <div className="flex items-center justify-center gap-2 text-yellow-800 font-bold mb-1">
          <Sparkles size={18} />
          <span>Why do these?</span>
        </div>
        <p className="text-[10px] text-yellow-700 leading-relaxed px-2">
          Doing something creative or focused helps our brain calm down. It's like giving your heart a little hug!
        </p>
      </section>
    </div>
  );
};
