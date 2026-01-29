
import React, { useState } from 'react';
import { Download, Trash2, Eye, Calendar, Maximize2, X, ArrowLeft, Play, Film, UserPlus, ShieldCheck, History, Lock, Loader2 } from 'lucide-react';
import { GalleryItem, MotionPreset, ModelDna, User } from '../types';
import { MOTION_PRESETS } from '../constants';

interface GalleryProps {
  items: GalleryItem[];
  user: User | null;
  onRemove: (id: string) => void;
  onAnimate: (item: GalleryItem, preset: MotionPreset) => void;
  onExtractDna: (dna: ModelDna) => void;
  onLoginRequired: () => void;
  isLoading?: boolean;
}

const Gallery: React.FC<GalleryProps> = ({ items, user, onRemove, onAnimate, onExtractDna, onLoginRequired, isLoading = false }) => {
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [showAnimateModal, setShowAnimateModal] = useState<GalleryItem | null>(null);

  const handleDownloadAttempt = (imageUrl: string, filename: string) => {
    if (!user) {
      onLoginRequired();
      return;
    }
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (ts: number) => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    }).format(new Date(ts));
  };

  if (isLoading) {
    return (
      <section className="flex-1 h-full flex flex-col items-center justify-center bg-[#fbfbfb] dark:bg-black p-12">
        <Loader2 className="animate-spin text-zinc-300 dark:text-zinc-700 mb-4" size={32} />
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Hydrating Vault...</p>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="flex-1 h-full flex flex-col items-center justify-center bg-[#fbfbfb] dark:bg-black p-12 transition-colors duration-300">
        <div className="w-16 h-16 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/10 rounded-3xl flex items-center justify-center mb-6 shadow-sm transition-colors">
          <ShieldCheck className="text-gray-300 dark:text-zinc-700" size={24} />
        </div>
        <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">Your cloud vault is empty</h2>
        <p className="text-gray-500 dark:text-zinc-500 text-xs mt-2 uppercase tracking-widest font-bold">Designs generated in the studio are saved here automatically</p>
      </section>
    );
  }

  return (
    <section className="flex-1 h-full bg-[#fbfbfb] dark:bg-black overflow-y-auto p-8 lg:p-24 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {user ? <ShieldCheck size={14} className="text-green-500" /> : <Lock size={14} className="text-amber-500" />}
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                {user ? 'Private Cloud Storage Active' : 'Temporary Local Session'}
              </span>
            </div>
            <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-2">Account Collection</h2>
            <p className="text-gray-400 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em]">{items.length} Assets Vaulted</p>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold text-zinc-400"><History size={14} /> Recently Rendered</div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12" role="list">
          {items.map((item) => (
            <article key={item.id} role="listitem" className="group flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="aspect-[3/4] relative bg-white dark:bg-zinc-900 rounded-[2rem] overflow-hidden shadow-lg transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2 ring-1 ring-gray-100 dark:ring-white/5">
                {item.type === 'image' ? (
                  <img src={item.url} alt={`AI Generated ${item.apparelName}`} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                ) : (
                  <video src={item.url} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                )}
                <div className="absolute top-4 left-4 p-2 bg-black/50 backdrop-blur-md rounded-full text-white text-[10px] font-bold uppercase tracking-tight flex items-center gap-1.5 px-3">
                  {item.type === 'video' ? <Film size={10} /> : <History size={10} />} {item.type.toUpperCase()}
                </div>
                <div className="absolute inset-0 bg-black/5 dark:bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                   <button onClick={() => setSelectedItem(item)} className="w-12 h-12 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform"><Eye size={18} /></button>
                  {item.type === 'image' && (
                    <button onClick={() => setShowAnimateModal(item)} className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform"><Play size={18} className="fill-current" /></button>
                  )}
                  <button onClick={() => handleDownloadAttempt(item.url, `${item.apparelName}-${item.id}.${item.type === 'image' ? 'png' : 'mp4'}`)} className={`w-12 h-12 rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform backdrop-blur-md ${user ? 'bg-white/20 dark:bg-white/10 text-white' : 'bg-amber-500 text-white'}`}>
                    {user ? <Download size={18} /> : <Lock size={18} />}
                  </button>
                </div>
              </div>
              <div className="px-2">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-white truncate pr-2">{item.apparelName}</h3>
                  <button onClick={() => onRemove(item.id)} className="text-gray-300 dark:text-zinc-700 hover:text-red-500 transition-colors shrink-0"><Trash2 size={14} /></button>
                </div>
                <p className="text-[9px] text-gray-400 dark:text-zinc-600 font-bold uppercase tracking-widest">{formatDate(item.timestamp)}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[100] flex items-center justify-center bg-white/95 dark:bg-black/95 backdrop-blur-2xl p-8 lg:p-16 animate-in fade-in duration-500">
          <div className="absolute top-12 left-12">
            <button onClick={() => setSelectedItem(null)} className="group flex items-center gap-2 text-sm font-semibold text-gray-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"><ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back</button>
          </div>
          <div className="absolute top-12 right-12 flex gap-4">
             <button onClick={() => onExtractDna(selectedItem.dna)} className="hidden md:flex px-8 py-3 bg-white dark:bg-zinc-800 border border-gray-100 dark:border-white/10 text-zinc-900 dark:text-white rounded-full font-semibold text-xs transition-transform hover:scale-105 shadow-xl items-center gap-2"><UserPlus size={14} /> Clone Model DNA</button>
             <button onClick={() => handleDownloadAttempt(selectedItem.url, `fashion-${selectedItem.id}.${selectedItem.type === 'image' ? 'png' : 'mp4'}`)} className={`px-8 py-3 rounded-full font-semibold text-xs transition-transform hover:scale-105 shadow-xl flex items-center gap-2 ${user ? 'bg-zinc-900 dark:bg-white text-white dark:text-black' : 'bg-amber-500 text-white'}`}>
               {!user && <Lock size={14} />} {user ? `Download HD ${selectedItem.type.toUpperCase()}` : 'Login to Unlock Download'}
             </button>
          </div>
          <div className="flex flex-col lg:flex-row max-w-7xl w-full h-full gap-24 items-center overflow-y-auto">
            <div className="flex-1 h-full min-h-[400px] flex items-center justify-center">
              {selectedItem.type === 'image' ? (
                <img src={selectedItem.url} className="max-w-full max-h-full object-contain rounded-[3rem] shadow-2xl ring-1 ring-gray-100 dark:ring-white/10" alt="Full preview" />
              ) : (
                <video src={selectedItem.url} autoPlay loop muted controls className="max-w-full max-h-full object-contain rounded-[3rem] shadow-2xl ring-1 ring-gray-100 dark:ring-white/10" />
              )}
            </div>
            <div className="w-full lg:w-80 space-y-12 animate-in slide-in-from-right duration-700">
               <div>
                 <div className="flex items-center gap-2 mb-4">
                    {user ? <ShieldCheck size={14} className="text-blue-500" /> : <Lock size={14} className="text-amber-500" />}
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{user ? 'Permanent Vault Data' : 'Guest Asset (Unsecured)'}</span>
                 </div>
                 <h2 className="text-3xl font-semibold tracking-tight mb-8 text-zinc-900 dark:text-white">Synthesis Profile</h2>
                 <div className="space-y-6">
                   {Object.entries(selectedItem.dna).map(([key, value]) => (
                     <div key={key} className="flex justify-between items-baseline">
                       <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-600 uppercase tracking-widest">{key}</span>
                       <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-200 truncate pl-4">{String(value)}</span>
                     </div>
                   ))}
                 </div>
               </div>
               {!user && (
                 <div className="p-6 bg-amber-50 dark:bg-amber-900/10 rounded-3xl border border-amber-100 dark:border-amber-900/20">
                    <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-2">Registration Required</p>
                    <p className="text-xs text-amber-700 dark:text-amber-500 leading-relaxed font-medium">Create an account to export high-definition assets and claim 100 synthesis credits.</p>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}

      {/* Animate Selection Modal */}
      {showAnimateModal && (
        <div role="dialog" aria-labelledby="motion-title" className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md p-6">
          <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl border border-gray-100 dark:border-white/10 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-8">
              <h3 id="motion-title" className="text-xl font-semibold tracking-tight">Promote to Motion</h3>
              <button onClick={() => setShowAnimateModal(null)} className="p-2 text-gray-400 hover:text-zinc-900 dark:hover:text-white"><X size={20} /></button>
            </div>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mb-8 leading-relaxed">Use this vaulted image as the starting frame for a high-fidelity video sequence.</p>
            <div className="grid grid-cols-1 gap-3">
              {MOTION_PRESETS.map((preset) => (
                <button key={preset.id} onClick={() => { onAnimate(showAnimateModal, preset); setShowAnimateModal(null); }} className="group flex items-center justify-between p-5 bg-gray-50 dark:bg-zinc-800 hover:bg-blue-500 rounded-2xl transition-all">
                  <div className="text-left">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white group-hover:text-white">{preset.name}</p>
                    <p className="text-[10px] text-gray-400 group-hover:text-white/70 mt-0.5">25 CR • 1080p Editorial Render</p>
                  </div>
                  <Play size={16} className="text-zinc-400 group-hover:text-white" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Gallery;
