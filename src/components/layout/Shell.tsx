import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, BarChart2, Heart, MessageCircle, LogOut } from 'lucide-react';
import { DataService } from '../../services/dataService';
import { cn } from '../../lib/utils';

export const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const user = DataService.getCurrentUser();

  const handleLogout = () => {
    DataService.logout();
    navigate('/login');
  };

  if (!user) return <>{children}</>;

  return (
    <div className="flex flex-col h-screen bg-[#FDFCFB]">
      {/* Header */}
      <header className="px-6 py-4 flex justify-between items-center bg-white shadow-sm shrink-0">
        <div>
          <h1 className="text-xl font-bold text-[#FF9EAA]">Moodie</h1>
          <p className="text-xs text-gray-400">Welcome, {user.full_name?.split(' ')[0] || 'User'}!</p>
        </div>
        <button 
          onClick={handleLogout}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <LogOut size={20} className="text-gray-400" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        {children}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-around items-center shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
        <NavLink 
          to="/" 
          className={({ isActive }) => cn(
            "flex flex-col items-center gap-1 transition-colors",
            isActive ? "text-[#FF9EAA]" : "text-gray-400"
          )}
        >
          <Home size={24} />
          <span className="text-[10px] font-medium">Home</span>
        </NavLink>
        
        <NavLink 
          to="/activities" 
          className={({ isActive }) => cn(
            "flex flex-col items-center gap-1 transition-colors",
            isActive ? "text-[#FF9EAA]" : "text-gray-400"
          )}
        >
          <Heart size={24} />
          <span className="text-[10px] font-medium">Activities</span>
        </NavLink>

        <NavLink 
          to="/charts" 
          className={({ isActive }) => cn(
            "flex flex-col items-center gap-1 transition-colors",
            isActive ? "text-[#FF9EAA]" : "text-gray-400"
          )}
        >
          <BarChart2 size={24} />
          <span className="text-[10px] font-medium">Trends</span>
        </NavLink>
      </nav>
    </div>
  );
};
