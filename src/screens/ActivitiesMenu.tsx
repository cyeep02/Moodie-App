import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Card } from '../components/ui';
import { Wind, Palette, Ghost, Sparkles, MessageCircle } from 'lucide-react';

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
    path: '/panda'
  }
];

export const ActivitiesMenu = () => {
  const navigate = useNavigate();

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
