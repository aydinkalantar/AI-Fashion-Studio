import React from 'react';

interface IntroAnimationProps {
  theme?: 'light' | 'dark';
}

const IntroAnimation: React.FC<IntroAnimationProps> = ({ theme = 'light' }) => {
  return (
    <div className={`fixed inset-0 z-[1000] ${theme === 'dark' ? 'bg-black' : 'bg-white'} flex items-center justify-center overflow-hidden transition-colors duration-500`}>
      <div className="flex flex-col items-center gap-8">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-white' : 'bg-zinc-900'} rounded-2xl animate-in zoom-in-50 duration-700`}></div>
          <div className={`relative ${theme === 'dark' ? 'text-black' : 'text-white'} font-bold text-2xl tracking-tighter`}>S</div>
        </div>
        <div className="overflow-hidden">
          <p className="text-zinc-400 text-[11px] font-medium tracking-[0.4em] uppercase animate-in slide-in-from-bottom-full duration-1000 delay-300">
            Studio — Infinite Fashion
          </p>
        </div>
      </div>
    </div>
  );
};

export default IntroAnimation;