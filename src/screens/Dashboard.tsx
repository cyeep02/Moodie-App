import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { DataService, AlertService } from '../services/dataService';
import { Card, Button } from '../components/ui';
import { cn } from '../lib/utils';
import { MoodLog, MOOD_CONFIG } from '../types';
import { Star, AlertCircle, Clock } from 'lucide-react';
import { formatDistanceToNow, parseISO, format } from 'date-fns';

export const Dashboard = () => {
  const navigate = useNavigate();
  const user = DataService.getCurrentUser();
  const [recentLogs, setRecentLogs] = useState<MoodLog[]>([]);
  const [supportStatus, setSupportStatus] = useState<'idle' | 'confirming' | 'sending' | 'sent' | 'error'>('idle');

  useEffect(() => {
    if (user) {
      DataService.getMoodLogs(user.user_id).then(setRecentLogs);
    }
  }, [user]);

  const latestMood = recentLogs[0];

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };

  const timeDay = getTimeOfDay();
  const themeStyles = {
    morning: {
      card: "bg-gradient-to-br from-[#FF9EAA] to-[#FFD1DA]",
      buttonText: "text-[#FF9EAA]"
    },
    afternoon: {
      card: "bg-gradient-to-br from-blue-400 to-indigo-500",
      buttonText: "text-blue-500"
    },
    evening: {
      card: "bg-gradient-to-br from-zinc-800 to-black",
      buttonText: "text-zinc-800"
    }
  }[timeDay];

  const handleManualSupport = async () => {
    if (!user) return;
    
    if (supportStatus === 'idle') {
      setSupportStatus('confirming');
      return;
    }

    if (supportStatus === 'confirming') {
      setSupportStatus('sending');
      try {
        await AlertService.triggerManualSupportNotification(user.user_id);
        setSupportStatus('sent');
        // Reset after 5 seconds
        setTimeout(() => setSupportStatus('idle'), 5000);
      } catch (err) {
        console.error(err);
        setSupportStatus('error');
        setTimeout(() => setSupportStatus('idle'), 5000);
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Hero Greeting */}
      <section className="space-y-1 text-center py-4">
        <h2 className="text-3xl font-extrabold text-gray-800">Hi, {user?.full_name?.split(' ')[0] || 'Friend'}!</h2>
        <p className="text-gray-500 text-lg">How's your heart feeling?</p>
      </section>

      {/* Mood Check-in CTA */}
      <div className="flex justify-center px-4">
        <Card className={cn(
          themeStyles.card, 
          "text-white border-none relative overflow-hidden w-full max-w-[500px] flex flex-col items-center justify-center shadow-xl shadow-gray-100 min-h-[220px]"
        )}>
          <div className="relative z-10 space-y-4 flex flex-col items-center text-center p-8">
            <div className="flex flex-col items-center gap-1">
              <Star size={20} fill="currentColor" className="text-white/80" />
              <span className="font-bold text-[9px] uppercase tracking-[0.2em] opacity-70">Daily Ritual</span>
            </div>
            
            <h3 className="text-2xl font-black leading-tight tracking-tight">
              Start your {timeDay} <br/>Mood Check-in
            </h3>
            
            <div className="flex flex-col items-center gap-3 w-full">
              <Button 
                onClick={() => navigate('/check-in')}
                className={cn("bg-white hover:bg-gray-50 border-none px-10 py-5 rounded-2xl shadow-lg font-bold text-sm transition-transform active:scale-95", themeStyles.buttonText)}
              >
                Go!
              </Button>
              
              {user?.last_login && (
                <div className="flex items-center gap-1.5 opacity-60 text-[10px]">
                  <Clock size={10} strokeWidth={3} />
                  <span>Last visit: {formatDistanceToNow(parseISO(user.last_login), { addSuffix: true })}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Decorative elements - adjusted for square layout */}
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -top-10 -left-10 w-24 h-24 bg-white/10 rounded-full blur-xl" />
        </Card>
      </div>

      {/* Latest Mood Summary */}
      {latestMood && (
        <section className="space-y-3">
          <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Your last entry</h4>
          <Card className="flex items-center gap-4">
            <span className="text-4xl">{latestMood.mood_emoji}</span>
            <div>
              <p className="font-bold text-gray-700">{latestMood.mood_label}</p>
              <p className="text-[10px] text-gray-400 font-medium">
                {format(parseISO(latestMood.created_at || `${latestMood.date}T${latestMood.time}`), 'yyyy-MM-dd HH:mm')}
              </p>
            </div>
          </Card>
        </section>
      )}

      {/* Need Support Section */}
      <section className="pt-4">
        <motion.div 
          onClick={handleManualSupport}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer",
            supportStatus === 'idle' && "bg-orange-50 border-orange-100 hover:bg-orange-100",
            supportStatus === 'confirming' && "bg-orange-100 border-orange-300 ring-2 ring-orange-200",
            supportStatus === 'sending' && "bg-orange-50 border-orange-200 opacity-70",
            supportStatus === 'sent' && "bg-green-50 border-green-200",
            supportStatus === 'error' && "bg-red-50 border-red-200"
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-xl transition-colors",
              supportStatus === 'sent' ? "bg-green-200 text-green-600" : 
              supportStatus === 'error' ? "bg-red-200 text-red-600" : "bg-orange-200 text-orange-600"
            )}>
              <AlertCircle size={20} />
            </div>
            <div>
              <p className={cn(
                "font-bold text-sm",
                supportStatus === 'sent' ? "text-green-800" : 
                supportStatus === 'error' ? "text-red-800" : "text-orange-800"
              )}>
                {supportStatus === 'idle' && "I need support"}
                {supportStatus === 'confirming' && "Are you sure?"}
                {supportStatus === 'sending' && "Sending alert..."}
                {supportStatus === 'sent' && "Alert Sent!"}
                {supportStatus === 'error' && "Error sending alert"}
              </p>
              <p className={cn(
                "text-[10px]",
                supportStatus === 'sent' ? "text-green-600" : 
                supportStatus === 'error' ? "text-red-600" : "text-orange-600"
              )}>
                {supportStatus === 'idle' && "Tap here to notify a guardian"}
                {supportStatus === 'confirming' && "Tap again to confirm notification"}
                {supportStatus === 'sending' && "Getting help for you..."}
                {supportStatus === 'sent' && "A trusted adult is on their way"}
                {supportStatus === 'error' && "Please talk to an adult directly"}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            {supportStatus === 'idle' && <span className="text-orange-300">→</span>}
            {supportStatus === 'confirming' && <span className="text-orange-500 font-bold text-xs uppercase tracking-widest bg-white/50 px-2 py-1 rounded-lg">Confirm</span>}
            {supportStatus === 'sent' && <span className="text-green-500">✓</span>}
          </div>
        </motion.div>
      </section>

      {/* Safety Reminder */}
      <p className="text-[10px] text-center text-gray-300 px-6">
        Moodie is here to support your feelings. If you are in immediate danger, please talk to an adult or call emergency services.
      </p>
    </div>
  );
};
