
import React from 'react';
import { X, User, CreditCard, ShieldCheck, Mail, LogOut, PieChart, Zap, History, ChevronRight } from 'lucide-react';
import { User as UserType } from '../types';

interface DashboardProps {
  user: UserType;
  onClose: () => void;
  onLogout: () => void;
  onResetCredits: () => void;
  stats: {
    totalRenders: number;
  };
}

const Dashboard: React.FC<DashboardProps> = ({ user, onClose, onLogout, onResetCredits, stats }) => {
  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in" 
        onClick={onClose}
      />
      <aside className="relative w-full max-w-md h-full bg-white dark:bg-zinc-900 shadow-2xl animate-in slide-in-from-right duration-500 transition-colors">
        <header className="p-8 border-b border-gray-100 dark:border-white/10 flex justify-between items-center">
          <h2 className="text-lg font-semibold tracking-tight">Account Hub</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
            <X size={20} />
          </button>
        </header>

        <div className="p-8 space-y-10 overflow-y-auto h-[calc(100vh-80px)]">
          {/* User Profile Info */}
          <section className="flex items-center gap-5">
            <div className="w-20 h-20 bg-gray-100 dark:bg-zinc-800 rounded-[2rem] flex items-center justify-center overflow-hidden border border-gray-200 dark:border-white/5 shadow-inner">
               {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <User size={32} className="text-zinc-400" />}
            </div>
            <div>
              <h3 className="text-xl font-semibold tracking-tight">{user.name}</h3>
              <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5 font-medium">
                <Mail size={12} /> {user.email}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="px-2 py-0.5 bg-blue-500 text-white text-[9px] font-bold uppercase tracking-widest rounded-full">{user.plan}</span>
                <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">Active since 2024</span>
              </div>
            </div>
          </section>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-4">
            <div className="p-5 bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-3xl">
              <PieChart size={16} className="text-blue-500 mb-4" />
              <p className="text-2xl font-bold tracking-tighter">{stats.totalRenders}</p>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Total Renders Vaulted</p>
            </div>
          </div>

          {/* Credits Panel */}
          <section className="p-6 bg-zinc-900 dark:bg-white rounded-[2rem] text-white dark:text-black shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Synthesis Balance</p>
                <h4 className="text-3xl font-bold tracking-tighter mt-1">{user.credits} CR</h4>
              </div>
              <Zap size={24} className="fill-current text-blue-400 dark:text-blue-600" />
            </div>
            <button 
              onClick={() => { onResetCredits(); onClose(); }}
              className="w-full py-3 bg-white/20 dark:bg-black/5 hover:bg-white/30 dark:hover:bg-black/10 transition-all rounded-2xl text-xs font-bold uppercase tracking-widest border border-white/20 dark:border-black/10"
            >
              Reset / Top Up Credits
            </button>
          </section>

          {/* Settings List */}
          <section className="space-y-2">
            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Enterprise Management</h4>
            <button className="w-full flex items-center justify-between p-4 bg-gray-50/50 dark:bg-white/5 rounded-2xl group hover:scale-[1.02] transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white dark:bg-zinc-800 rounded-xl shadow-sm"><CreditCard size={14} /></div>
                <span className="text-xs font-semibold">Subscription & Billing</span>
              </div>
              <ChevronRight size={14} className="text-zinc-400" />
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-gray-50/50 dark:bg-white/5 rounded-2xl group hover:scale-[1.02] transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white dark:bg-zinc-800 rounded-xl shadow-sm"><History size={14} /></div>
                <span className="text-xs font-semibold">Usage History</span>
              </div>
              <ChevronRight size={14} className="text-zinc-400" />
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-gray-50/50 dark:bg-white/5 rounded-2xl group hover:scale-[1.02] transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white dark:bg-zinc-800 rounded-xl shadow-sm"><ShieldCheck size={14} /></div>
                <span className="text-xs font-semibold">Privacy & Security</span>
              </div>
              <ChevronRight size={14} className="text-zinc-400" />
            </button>
          </section>

          <footer className="pt-10">
            <button 
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 p-4 text-red-500 font-bold text-xs uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-all"
            >
              <LogOut size={16} /> Sign Out Account
            </button>
            <p className="text-center text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-6">
              AI Fashion Studio © 2025 All Rights Reserved
            </p>
          </footer>
        </div>
      </aside>
    </div>
  );
};

export default Dashboard;
