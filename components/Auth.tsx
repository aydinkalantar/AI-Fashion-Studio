
import React, { useState } from 'react';
import { Zap, ArrowRight, Mail, Lock, User, ShieldCheck, Loader2, Play } from 'lucide-react';
import { User as UserType } from '../types';

interface AuthProps {
  onLogin: (user: UserType) => void;
  onGuest?: () => void;
  theme: 'light' | 'dark';
  isModal?: boolean;
}

const Auth: React.FC<AuthProps> = ({ onLogin, onGuest, theme, isModal = false }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const mockUser: UserType = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        name: mode === 'signup' ? name : 'Creative Director',
        credits: 5, // New users receive 5 FREE CREDITS
        plan: 'Starter',
        createdAt: Date.now()
      };
      onLogin(mockUser);
      setIsLoading(false);
    }, 1500);
  };

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    // Simulate Google OAuth Redirect/Popup
    setTimeout(() => {
      const mockUser: UserType = {
        id: 'google_' + Math.random().toString(36).substr(2, 9),
        email: 'user@gmail.com',
        name: 'Google User',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GoogleUser',
        credits: 5, // New users receive 5 FREE CREDITS
        plan: 'Starter',
        createdAt: Date.now()
      };
      onLogin(mockUser);
      setIsGoogleLoading(false);
    }, 1200);
  };

  const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.20455C17.64 8.56636 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z" fill="#4285F4"/>
      <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4205 9 14.4205C6.65591 14.4205 4.67182 12.8373 3.96409 10.71H0.957273V13.0418C2.43818 15.9832 5.48182 18 9 18Z" fill="#34A853"/>
      <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957273C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957273 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
      <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957273 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335"/>
    </svg>
  );

  const containerClasses = isModal 
    ? `bg-white dark:bg-zinc-900 rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-white/10`
    : `min-h-screen flex ${theme === 'dark' ? 'bg-black' : 'bg-[#fbfbfb]'} transition-colors duration-500`;

  return (
    <div className={containerClasses}>
      {/* Editorial Side Panel - Only for Full Page */}
      {!isModal && (
        <div className="hidden lg:flex flex-1 relative bg-zinc-900 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=1200" 
            className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
            alt="Editorial Fashion"
          />
          <div className="relative z-10 flex flex-col justify-between p-16 text-white w-full bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                <Zap className="text-black fill-current" size={20} />
              </div>
              <span className="text-xl font-bold tracking-tight">AI Fashion Studio</span>
            </div>
            <div className="max-w-md">
              <h2 className="text-5xl font-semibold tracking-tight leading-tight mb-6">The Future of <br/>Virtual Try-On.</h2>
              <p className="text-zinc-400 text-lg leading-relaxed">Synthesize high-end editorial content using professional design blueprints and photorealistic AI motion.</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-zinc-500">
              <span>Production v2.5</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
              <span>Enterprise Secure</span>
            </div>
          </div>
        </div>
      )}

      {/* Auth Form Panel */}
      <div className={`${isModal ? 'w-full' : 'w-full lg:w-[480px]'} flex flex-col items-center justify-center p-8 md:p-16`}>
        <div className="w-full max-w-sm space-y-8">
          <header className="text-center">
            <h3 className="text-2xl font-semibold tracking-tight mb-2">
              {isModal ? 'Claim Your 5 Free Credits' : mode === 'login' ? 'Welcome Back' : 'Get Started'}
            </h3>
            <p className="text-zinc-500 text-sm leading-relaxed">
              {isModal 
                ? 'Register now to claim your free credits, download assets, and save your collection permanently.' 
                : 'Enter your credentials to access the Studio.'}
            </p>
          </header>

          <div className="space-y-3">
            <button 
              onClick={handleGoogleLogin} 
              disabled={isGoogleLoading}
              className="w-full h-12 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-2xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all flex items-center justify-center gap-3 shadow-sm"
            >
              {isGoogleLoading ? <Loader2 className="w-4 h-4 animate-spin text-zinc-400" /> : <><GoogleIcon /> Continue with Google</>}
            </button>
            
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100 dark:border-zinc-800"></div></div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold text-gray-400"><span className="bg-white dark:bg-zinc-900 px-4">Or continue with email</span></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors"><User size={16} /></div>
                <input required type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full h-12 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl pl-12 pr-4 text-sm focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white outline-none transition-all dark:text-white" />
              </div>
            )}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors"><Mail size={16} /></div>
              <input required type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-12 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl pl-12 pr-4 text-sm focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white outline-none transition-all dark:text-white" />
            </div>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors"><Lock size={16} /></div>
              <input required type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full h-12 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl pl-12 pr-4 text-sm focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white outline-none transition-all dark:text-white" />
            </div>

            <button disabled={isLoading} className="w-full h-12 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl mt-2">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>{mode === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight size={16} /></>}
            </button>

            {!isModal && onGuest && (
              <button type="button" onClick={onGuest} className="w-full h-12 bg-gray-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-2xl font-bold text-sm hover:bg-gray-200 transition-all flex items-center justify-center gap-2 mt-4">
                Continue as Guest <Play size={14} className="fill-current" />
              </button>
            )}
          </form>

          <footer className="text-center space-y-8">
            <button onClick={() => setMode(m => m === 'login' ? 'signup' : 'login')} className="text-xs font-bold text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors uppercase tracking-widest">
              {mode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
            </button>
            <div className="pt-8 border-t border-gray-100 dark:border-white/10 flex items-center justify-center gap-2 text-zinc-400">
               <ShieldCheck size={14} className="text-green-500" />
               <span className="text-[10px] font-bold uppercase tracking-widest">SSL Encrypted Synthesis</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Auth;
