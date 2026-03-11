import React from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Briefcase, 
  CreditCard, 
  Calendar, 
  Settings,
  LogOut,
  Target
} from 'lucide-react';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { useAuth } from '../AuthContext';

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tasks', label: 'PROJECT/TASK', icon: Briefcase },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage }) => {
  const { logout } = useAuth();

  return (
    <motion.aside 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-64 glass h-[calc(100vh-2rem)] m-4 rounded-3xl flex flex-col p-6 z-10"
    >
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue to-neon-gold flex items-center justify-center neon-glow-blue">
          <Target className="text-black w-6 h-6" />
        </div>
        <span className="font-bold text-xl tracking-tighter text-glow-blue">3 LEGENDS</span>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group",
                isActive 
                  ? "bg-neon-blue/10 text-neon-blue border border-neon-blue/20" 
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className={cn(
                "w-5 h-5 transition-transform duration-300 group-hover:scale-110",
                isActive && "text-neon-blue"
              )} />
              <span className="font-medium">{item.label}</span>
              {isActive && (
                <motion.div 
                  layoutId="active-pill"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-neon-blue neon-glow-blue"
                />
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-white/10">
        <div className="px-4 py-2 text-[10px] text-white/20 font-bold uppercase tracking-widest text-center">
          The 3 Legends v1.0
        </div>
      </div>
    </motion.aside>
  );
};
