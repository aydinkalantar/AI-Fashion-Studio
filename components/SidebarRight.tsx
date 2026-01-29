
import React, { useState, useRef } from 'react';
import { User, Globe, Sliders, Trash2, Heart, Users, ChevronDown, Sparkles, Upload, X, Camera } from 'lucide-react';
import { ModelDna, SavedModelProfile } from '../types';
import { MODEL_OPTIONS } from '../constants';
import FaceCapture from './FaceCapture';

interface SidebarRightProps {
  dna: ModelDna;
  setDna: (dna: ModelDna) => void;
  savedProfiles: SavedModelProfile[];
  onSaveProfile: (name: string) => void;
  onDeleteProfile: (id: string) => void;
  onApplyProfile: (dna: ModelDna) => void;
}

const SidebarRight: React.FC<SidebarRightProps> = ({ 
  dna, 
  setDna, 
  savedProfiles, 
  onSaveProfile, 
  onDeleteProfile, 
  onApplyProfile 
}) => {
  const [profileName, setProfileName] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const faceInputRef = useRef<HTMLInputElement>(null);

  const updateDna = (key: keyof ModelDna, value: any) => {
    setDna({ ...dna, [key]: value });
  };

  const handleFaceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      updateDna('faceImage', url);
    };
    reader.readAsDataURL(file);
  };

  const handleFaceCapture = (base64: string) => {
    updateDna('faceImage', base64);
    setShowCamera(false);
  };

  const handleSave = () => {
    if (profileName.trim()) {
      onSaveProfile(profileName.trim());
      setProfileName('');
      setShowSaveForm(false);
    }
  };

  const CustomSelect = ({ label, value, options, onChange }: { label: string, value: string, options: string[], onChange: (val: string) => void }) => (
    <div className="space-y-2">
      <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</label>
      <div className="relative group">
        <select 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 text-[11px] px-3 py-2.5 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white dark:text-white outline-none rounded-xl appearance-none cursor-pointer transition-all pr-10"
        >
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
          <ChevronDown size={14} />
        </div>
      </div>
    </div>
  );

  return (
    <aside className="w-full h-full border-l border-gray-100 dark:border-white/10 bg-white dark:bg-black flex flex-col transition-colors overflow-hidden">
      <div className="p-6 md:p-8 flex-1 overflow-y-auto custom-scrollbar">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-8">Model DNA Attributes</h3>

        <div className="space-y-10">
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-zinc-900 dark:text-white">
                <User size={14} className="text-zinc-400" />
                <h4 className="text-xs font-semibold">Identity</h4>
              </div>
              <button 
                onClick={() => setShowSaveForm(true)}
                className="text-[10px] font-bold text-blue-500 uppercase tracking-tight flex items-center gap-1"
              >
                <Heart size={12} className="fill-current" /> Save
              </button>
            </div>

            {showSaveForm && (
              <div className="mb-6 p-4 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-2xl">
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Profile Name..." 
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-[11px] px-3 py-2 rounded-xl outline-none focus:ring-1 focus:ring-blue-500 mb-2 dark:text-white"
                />
                <div className="flex gap-2">
                  <button onClick={handleSave} className="flex-1 py-1.5 bg-blue-500 text-white text-[10px] font-bold rounded-lg">Save</button>
                  <button onClick={() => setShowSaveForm(false)} className="px-3 py-1.5 bg-gray-200 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 text-[10px] font-bold rounded-lg">Cancel</button>
                </div>
              </div>
            )}
            
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-4 p-4 bg-gray-50/50 dark:bg-zinc-900/50 rounded-2xl border border-gray-100 dark:border-white/5">
                <div className="relative">
                  <button 
                    onClick={() => dna.faceImage ? null : faceInputRef.current?.click()}
                    className={`w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden transition-all ${dna.faceImage ? 'border-zinc-900 dark:border-white' : 'border-gray-200 dark:border-zinc-800'}`}
                  >
                    {dna.faceImage ? (
                      <img src={dna.faceImage} alt="Face" className="w-full h-full object-cover" />
                    ) : (
                      <Upload size={20} className="text-gray-300" />
                    )}
                  </button>
                  {dna.faceImage ? (
                    <button onClick={() => updateDna('faceImage', undefined)} className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"><X size={12} /></button>
                  ) : (
                    <button onClick={() => setShowCamera(true)} className="absolute -bottom-1 -right-1 w-8 h-8 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center shadow-lg"><Camera size={14} /></button>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-zinc-900 dark:text-white uppercase tracking-widest">Face Identity</p>
                </div>
                <input type="file" ref={faceInputRef} className="hidden" accept="image/*" onChange={handleFaceUpload} />
              </div>

              <CustomSelect label="Gender" value={dna.gender} options={MODEL_OPTIONS.gender} onChange={(val) => updateDna('gender', val)} />
              <CustomSelect label="Ethnicity" value={dna.race} options={MODEL_OPTIONS.race} onChange={(val) => updateDna('race', val)} />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Age Range</label>
                  <span className="text-[10px] font-semibold text-zinc-900 dark:text-zinc-200">{dna.age} yrs</span>
                </div>
                <input type="range" min="18" max="60" value={dna.age} onChange={(e) => updateDna('age', parseInt(e.target.value))} className="w-full accent-zinc-900 dark:accent-white h-1 bg-gray-100 dark:bg-zinc-800 rounded-full appearance-none" />
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-6">
              <Sliders size={14} className="text-zinc-400" />
              <h4 className="text-xs font-semibold">Physicality</h4>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Body Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {MODEL_OPTIONS.bodyType.map(bt => (
                    <button 
                      key={bt}
                      onClick={() => updateDna('bodyType', bt)}
                      className={`py-2 text-[10px] font-semibold rounded-xl border transition-all ${dna.bodyType === bt ? 'border-zinc-900 dark:border-white bg-zinc-900 dark:bg-white text-white dark:text-black shadow-md' : 'border-gray-100 dark:border-zinc-800 text-zinc-500'}`}
                    >
                      {bt}
                    </button>
                  ))}
                </div>
              </div>
              <CustomSelect label="Action / Pose" value={dna.pose} options={MODEL_OPTIONS.pose} onChange={(val) => updateDna('pose', val)} />
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-6 text-zinc-900 dark:text-white">
              <Globe size={14} className="text-zinc-400" />
              <h4 className="text-xs font-semibold">Environment</h4>
            </div>
            <div className="space-y-5 pb-10">
              <CustomSelect label="Accessories" value={dna.accessories} options={MODEL_OPTIONS.accessories} onChange={(val) => updateDna('accessories', val)} />
              <CustomSelect label="Scene Context" value={dna.environment} options={MODEL_OPTIONS.environment} onChange={(val) => updateDna('environment', val)} />
            </div>
          </section>
        </div>

        {savedProfiles.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-100 dark:border-white/10 pb-10">
            <div className="flex items-center gap-2 mb-6">
              <Users size={14} className="text-blue-500" />
              <h4 className="text-xs font-semibold tracking-tight">Model Library</h4>
            </div>
            <div className="space-y-2">
              {savedProfiles.map(profile => (
                <div key={profile.id} className="group relative flex items-center gap-2">
                  <button 
                    onClick={() => onApplyProfile(profile.dna)}
                    className="flex-1 flex flex-col p-3 bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-white/8 rounded-xl text-left"
                  >
                    <span className="text-[11px] font-bold text-zinc-900 dark:text-white">{profile.name}</span>
                    <span className="text-[9px] text-gray-400 uppercase tracking-tighter">{profile.dna.gender} • {profile.dna.race}</span>
                  </button>
                  <button onClick={() => onDeleteProfile(profile.id)} className="p-2 text-gray-300 hover:text-red-500"><Trash2 size={12} /></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showCamera && (
        <FaceCapture 
          onCapture={handleFaceCapture} 
          onClose={() => setShowCamera(false)} 
        />
      )}
    </aside>
  );
};

export default SidebarRight;
