
import React, { useState, useRef } from 'react';
import { Shirt, Image as ImageIcon, Box, Upload, Plus, X, Trash2, Brush, Palette } from 'lucide-react';
import { ApparelBase, Asset, ModelDna } from '../types';
import { MODEL_OPTIONS } from '../constants';

interface SidebarLeftProps {
  apparels: ApparelBase[];
  graphics: Asset[];
  modelDna: ModelDna;
  setModelDna: (dna: ModelDna) => void;
  onSelectApparel: (apparel: ApparelBase) => void;
  onAddGraphic: (url: string) => void;
  onUploadGraphic: (url: string) => void;
  onDeleteGraphic: (id: string) => void;
  onUploadApparel: (apparel: ApparelBase) => void;
  onDeleteApparel: (id: string) => void;
  activeApparelId?: string;
}

const SidebarLeft: React.FC<SidebarLeftProps> = ({ 
  apparels, 
  graphics, 
  modelDna,
  setModelDna,
  onSelectApparel, 
  onAddGraphic, 
  onUploadGraphic,
  onDeleteGraphic,
  onUploadApparel,
  onDeleteApparel,
  activeApparelId
}) => {
  const [activeTab, setActiveTab] = useState<'apparel' | 'graphics' | 'technique'>('apparel');
  const [isAddingApparel, setIsAddingApparel] = useState(false);
  
  const [customApparel, setCustomApparel] = useState<{
    name: string;
    front: string;
    back: string;
    side: string;
  }>({ name: '', front: '', back: '', side: '' });

  const graphicInputRef = useRef<HTMLInputElement>(null);
  const colorPickerRef = useRef<HTMLInputElement>(null);
  const apparelInputRefs = {
    front: useRef<HTMLInputElement>(null),
    back: useRef<HTMLInputElement>(null),
    side: useRef<HTMLInputElement>(null)
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'graphic' | 'front' | 'back' | 'side') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      if (type === 'graphic') {
        onUploadGraphic(url);
      } else {
        setCustomApparel(prev => ({ ...prev, [type]: url }));
      }
    };
    reader.readAsDataURL(file);
  };

  const submitCustomApparel = () => {
    if (!customApparel.front || !customApparel.name) return;
    
    const newApparel: ApparelBase = {
      id: `custom-${Date.now()}`,
      name: customApparel.name,
      type: 'Custom',
      color: 'Custom',
      views: {
        front: customApparel.front,
        back: customApparel.back,
        side: customApparel.side
      }
    };
    onUploadApparel(newApparel);
    onSelectApparel(newApparel); // Automatically select newly uploaded apparel
    setIsAddingApparel(false);
    setCustomApparel({ name: '', front: '', back: '', side: '' });
  };

  const updateDna = (key: keyof ModelDna, value: any) => {
    setModelDna({ ...modelDna, [key]: value });
  };

  const getColorHex = (colorName: string) => {
    switch (colorName) {
      case 'Black': return '#1a1a1a';
      case 'White': return '#ffffff';
      case 'Gray': return '#808080';
      case 'Green': return '#228B22';
      case 'Blue': return '#0000FF';
      case 'Navy Blue': return '#000080';
      case 'Red': return '#FF0000';
      case 'Yellow': return '#FFFF00';
      default: return colorName.startsWith('#') ? colorName : 'transparent';
    }
  };

  return (
    <aside className="w-full h-full border-r border-gray-100 dark:border-white/10 bg-white dark:bg-black flex flex-col transition-colors overflow-hidden">
      <div className="p-4 md:p-6 h-full flex flex-col">
        <div className="flex bg-gray-100/60 dark:bg-zinc-900/60 p-1 rounded-xl mb-6 shrink-0">
          <button 
            onClick={() => setActiveTab('apparel')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-semibold rounded-lg transition-all ${activeTab === 'apparel' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}
          >
            <Shirt size={12} /> Apparel
          </button>
          <button 
            onClick={() => setActiveTab('graphics')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-semibold rounded-lg transition-all ${activeTab === 'graphics' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}
          >
            <ImageIcon size={12} /> Graphics
          </button>
          <button 
            onClick={() => setActiveTab('technique')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-semibold rounded-lg transition-all ${activeTab === 'technique' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}
          >
            <Brush size={12} /> Finish
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 -mr-1 custom-scrollbar">
          {activeTab === 'apparel' && (
            <div className="space-y-6 pb-6">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Inventory</h4>
                <button 
                  onClick={() => setIsAddingApparel(true)}
                  className="w-7 h-7 flex items-center justify-center bg-gray-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors shadow-sm"
                >
                  <Plus size={14} />
                </button>
              </div>

              {isAddingApparel && (
                <div className="p-4 border border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-zinc-900/50 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2 shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-zinc-900 dark:text-white uppercase">New Apparel Mockup</span>
                    <button onClick={() => setIsAddingApparel(false)}><X size={14} className="text-gray-400" /></button>
                  </div>
                  
                  <input 
                    type="text" 
                    placeholder="Apparel Name..." 
                    value={customApparel.name}
                    onChange={(e) => setCustomApparel({ ...customApparel, name: e.target.value })}
                    className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs px-3 py-2.5 outline-none rounded-xl dark:text-white"
                  />

                  <div className="grid grid-cols-3 gap-2">
                    {(['front', 'back', 'side'] as const).map(v => (
                      <div key={v} className="space-y-1">
                        <button 
                          onClick={() => apparelInputRefs[v].current?.click()}
                          className={`aspect-square w-full bg-white dark:bg-zinc-900 border border-dashed rounded-xl flex items-center justify-center overflow-hidden transition-all ${customApparel[v] ? 'border-zinc-900 dark:border-white' : 'border-gray-200 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800'}`}
                        >
                          {customApparel[v] ? (
                            <img src={customApparel[v]} className="w-full h-full object-cover pointer-events-none" alt="" />
                          ) : (
                            <div className="flex flex-col items-center gap-1">
                              <Upload size={12} className="text-gray-300" />
                              <span className="text-[8px] font-bold text-gray-400 uppercase">{v}</span>
                            </div>
                          )}
                        </button>
                        <input type="file" ref={apparelInputRefs[v]} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, v)} />
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={submitCustomApparel}
                    disabled={!customApparel.name || !customApparel.front}
                    className={`w-full py-2.5 text-[11px] font-semibold rounded-xl transition-all ${(!customApparel.name || !customApparel.front) ? 'bg-gray-100 dark:bg-zinc-800 text-gray-400 cursor-not-allowed' : 'bg-zinc-900 dark:bg-white text-white dark:text-black'}`}
                  >
                    Add to Collection
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setIsAddingApparel(true)}
                  className="aspect-[3/4] w-full bg-gray-50/50 dark:bg-zinc-900/30 rounded-2xl border-2 border-dashed border-gray-200 dark:border-zinc-800 flex flex-col items-center justify-center gap-2 group"
                >
                  <Plus size={18} className="text-gray-400" />
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">Upload New</p>
                </button>

                {apparels.map(app => (
                  <div key={app.id} className="group relative">
                    <button 
                      onClick={() => onSelectApparel(app)}
                      className={`aspect-[3/4] w-full bg-gray-50 dark:bg-zinc-900/50 rounded-2xl overflow-hidden transition-all border-2 ${activeApparelId === app.id ? 'border-blue-500 dark:border-white ring-2 ring-blue-500/20 shadow-lg scale-[0.98]' : 'border-transparent hover:border-gray-200 dark:hover:border-zinc-700'}`}
                    >
                      <img 
                        src={app.views.front} 
                        alt={app.name} 
                        className="w-full h-full object-cover opacity-90 pointer-events-none" 
                      />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDeleteApparel(app.id); }}
                      className="absolute top-2 right-2 p-1.5 bg-white dark:bg-zinc-800 shadow-xl border border-gray-100 dark:border-white/10 text-gray-400 hover:text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10"
                    >
                      <Trash2 size={12} />
                    </button>
                    <div className="mt-2 px-1">
                      <p className={`text-[10px] font-medium truncate ${activeApparelId === app.id ? 'text-blue-500 font-bold' : 'text-zinc-900 dark:text-white'}`}>{app.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'graphics' && (
            <div className="space-y-6 pb-6">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Artwork Bank</h4>
                <button 
                  onClick={() => graphicInputRef.current?.click()}
                  className="w-7 h-7 flex items-center justify-center bg-gray-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors shadow-sm"
                >
                  <Plus size={14} />
                </button>
              </div>
              
              <input type="file" ref={graphicInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'graphic')} />

              <div className="grid grid-cols-3 gap-3">
                {graphics.map(asset => (
                  <div key={asset.id} className="group relative aspect-square bg-gray-50 dark:bg-zinc-900/50 rounded-xl overflow-hidden border border-transparent hover:border-gray-200 dark:hover:border-zinc-700 transition-all shadow-sm">
                    <button onClick={() => onAddGraphic(asset.url)} className="w-full h-full p-2">
                      <img src={asset.url} alt={asset.name} className="w-full h-full object-contain pointer-events-none" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDeleteGraphic(asset.id); }}
                      className="absolute top-1 right-1 p-1.5 bg-white/90 dark:bg-zinc-800/90 text-gray-400 hover:text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-sm z-10"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'technique' && (
            <div className="space-y-10 pb-6">
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <Palette size={14} className="text-gray-400" />
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Garment Color</h4>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {MODEL_OPTIONS.garmentColors.map(color => (
                    <button
                      key={color}
                      onClick={() => updateDna('garmentColor', color)}
                      className={`relative flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all ${modelDna.garmentColor === color ? 'border-zinc-900 dark:border-white bg-zinc-50 dark:bg-zinc-900' : 'border-gray-100 dark:border-zinc-800'}`}
                    >
                      <div 
                        className={`w-5 h-5 rounded-full border border-gray-100 dark:border-white/10 ${color === 'Default' ? 'bg-gradient-to-tr from-gray-400 to-white' : ''}`}
                        style={{ backgroundColor: color === 'Default' ? undefined : getColorHex(color) }}
                      />
                      <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter truncate w-full text-center">{color}</span>
                    </button>
                  ))}
                  <button
                    onClick={() => colorPickerRef.current?.click()}
                    className={`relative flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all ${!MODEL_OPTIONS.garmentColors.includes(modelDna.garmentColor) ? 'border-zinc-900 dark:border-white bg-zinc-50 dark:bg-zinc-900' : 'border-gray-100 dark:border-zinc-800'}`}
                  >
                    <div 
                      className="w-5 h-5 rounded-full border border-gray-100 flex items-center justify-center"
                      style={{ background: !MODEL_OPTIONS.garmentColors.includes(modelDna.garmentColor) ? modelDna.garmentColor : '#ffffff' }}
                    />
                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter truncate w-full text-center">Custom</span>
                    <input type="color" ref={colorPickerRef} className="hidden" onChange={(e) => updateDna('garmentColor', e.target.value)} />
                  </button>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-6">
                  <Brush size={14} className="text-gray-400" />
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Decoration Technique</h4>
                </div>
                <div className="space-y-2">
                  {MODEL_OPTIONS.decorationType.map(type => (
                    <button 
                      key={type}
                      onClick={() => updateDna('decorationType', type)}
                      className={`w-full px-4 py-3 text-left text-[11px] font-semibold rounded-2xl border transition-all ${modelDna.decorationType === type ? 'border-zinc-900 dark:border-white bg-zinc-900 dark:bg-white text-white dark:text-black' : 'border-gray-100 dark:border-zinc-800 text-gray-500'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default SidebarLeft;
