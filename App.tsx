
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ChevronRight, 
  Zap,
  ArrowRight,
  Sun,
  Moon,
  CheckCircle2,
  Loader2,
  X as XIcon,
  ExternalLink,
  Coins,
  Layout,
  User as UserIcon,
  ShieldCheck,
  CloudCheck,
  Lock,
  Shirt,
  Menu,
  Settings2,
  Palette,
  Sparkles
} from 'lucide-react';
import IntroAnimation from './components/IntroAnimation';
import SidebarLeft from './components/SidebarLeft';
import SidebarRight from './components/SidebarRight';
import StudioCanvas, { StudioCanvasHandle } from './components/StudioCanvas';
import Gallery from './components/Gallery';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import { ApparelBase, ApparelView, DesignElement, ModelDna, Asset, GalleryItem, MotionPreset, SavedModelProfile, User } from './types';
import { APPAREL_BASES, GRAPHIC_ASSETS, MOTION_PRESETS } from './constants';
import { generateFashionModel, generateFashionVideo } from './services/geminiService';

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
  thumbnail?: string;
  item?: GalleryItem;
}

const COSTS = { IMAGE: 5, VIDEO: 25 };
const GUEST_INITIAL_CREDITS = 5;

const App: React.FC = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [guestCredits, setGuestCredits] = useState(GUEST_INITIAL_CREDITS);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const [activeMode, setActiveMode] = useState<'studio' | 'gallery'>('studio');
  const [showAccountDashboard, setShowAccountDashboard] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false); // Guard for storage sync
  const [theme, setTheme] = useState<'light' | 'dark'>(() => 
    (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
  );

  const [hasApiKey, setHasApiKey] = useState<boolean>(true);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);

  // App Resources
  const [apparels, setApparels] = useState<ApparelBase[]>(APPAREL_BASES);
  const [graphics, setGraphics] = useState<Asset[]>(GRAPHIC_ASSETS);
  
  // Design State
  const [activeApparel, setActiveApparel] = useState<ApparelBase | null>(null);
  const [activeView, setActiveView] = useState<ApparelView>('front');
  const [activeDesignId, setActiveDesignId] = useState<string | null>(null);
  const [viewDesigns, setViewDesigns] = useState<Record<ApparelView, DesignElement[]>>({
    front: [], back: [], side: []
  });

  const [modelDna, setModelDna] = useState<ModelDna>({
    gender: 'Male', race: 'Black / African Descent', age: 26, bodyType: 'Athletic',
    pose: 'Standing - Neutral', environment: 'Studio Grey - Minimal',
    decorationType: 'No Decoration Technique', garmentColor: 'Default',
    accessories: 'No Accessories', faceImage: undefined
  });

  const [pendingTasksCount, setPendingTasksCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [savedProfiles, setSavedProfiles] = useState<SavedModelProfile[]>([]);
  const canvasRef = useRef<StudioCanvasHandle>(null);

  // Initialization: Read session
  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 2000);
    const savedSession = localStorage.getItem('studio_session_user');
    if (savedSession) {
      setCurrentUser(JSON.parse(savedSession));
      setIsGuest(false);
    }

    const checkApiKey = async () => {
      if (window.aistudio) {
        const has = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(has);
      }
    };
    checkApiKey();

    return () => clearTimeout(timer);
  }, []);

  // Hydration Logic: Read user data from localStorage
  useEffect(() => {
    if (!currentUser && !isGuest) return;
    
    setIsSyncing(true);
    setIsHydrated(false); // Reset hydration when user changes
    
    setTimeout(() => {
      const ownerId = currentUser ? currentUser.id : 'guest';
      
      const allGallery: GalleryItem[] = JSON.parse(localStorage.getItem('studio_gallery') || '[]');
      const userItems = allGallery.filter(i => i.ownerId === ownerId);
      setGalleryItems(userItems);

      const allProfiles: SavedModelProfile[] = JSON.parse(localStorage.getItem('studio_profiles') || '[]');
      const userProfiles = allProfiles.filter(p => p.ownerId === ownerId);
      setSavedProfiles(userProfiles);
      
      setIsSyncing(false);
      setIsHydrated(true); // Now safe to sync back to storage
    }, 400);
  }, [currentUser?.id, isGuest]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Sync Logic: Write current state to localStorage
  const syncUserStorage = useCallback(() => {
    if (!isHydrated) return; // CRITICAL: Stop sync if we haven't loaded yet
    
    const ownerId = currentUser ? currentUser.id : 'guest';
    if (currentUser) {
      localStorage.setItem('studio_session_user', JSON.stringify(currentUser));
    }
    
    const updateStorage = (key: string, currentItems: any[], uid: string) => {
      const all: any[] = JSON.parse(localStorage.getItem(key) || '[]');
      const others = all.filter(x => x.ownerId !== uid);
      localStorage.setItem(key, JSON.stringify([...others, ...currentItems]));
    };

    updateStorage('studio_gallery', galleryItems, ownerId);
    updateStorage('studio_profiles', savedProfiles, ownerId);
  }, [currentUser, isGuest, galleryItems, savedProfiles, isHydrated]);

  useEffect(() => { syncUserStorage(); }, [syncUserStorage]);

  const handleLogin = (user: User) => {
    // Claim guest designs before switching user
    const guestGallery = galleryItems.map(item => ({ ...item, ownerId: user.id }));
    const guestProfiles = savedProfiles.map(p => ({ ...p, ownerId: user.id }));

    // Force hydration flag for immediate seamless transfer
    setIsHydrated(false);
    
    setCurrentUser(user);
    setIsGuest(false);
    setShowAuthModal(false);
    
    setGalleryItems(prev => [...prev.filter(i => i.ownerId === user.id), ...guestGallery]);
    setSavedProfiles(prev => [...prev.filter(p => p.ownerId === user.id), ...guestProfiles]);
    
    // Resume hydration after state update
    setTimeout(() => setIsHydrated(true), 50);

    addNotification({ 
      title: 'Session Merged', 
      message: 'Your guest designs have been successfully claimed and secured.', 
      type: 'success' 
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('studio_session_user');
    setIsHydrated(false);
    setCurrentUser(null);
    setIsGuest(false);
    setGalleryItems([]);
    setSavedProfiles([]);
    setActiveMode('studio');
  };

  const handleSelectApparel = (apparel: ApparelBase) => {
    setActiveApparel(apparel);
    setIsLeftSidebarOpen(false);
  };

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const addNotification = useCallback((notif: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [{ ...notif, id }, ...prev]);
    if (notif.type !== 'info') {
      setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 8000);
    } else {
      setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 4000);
    }
  }, []);

  const resetCredits = useCallback(() => {
    if (currentUser) {
      setCurrentUser(prev => prev ? { ...prev, credits: 100 } : null);
    } else {
      setGuestCredits(100);
    }
    addNotification({ 
      title: 'Credits Replenished', 
      message: 'Your synthesis balance has been reset to 100 CR.', 
      type: 'success' 
    });
  }, [currentUser, addNotification]);

  const handleGenerate = async () => {
    if (!activeApparel || !canvasRef.current || !activeApparel.views[activeView] || pendingTasksCount > 0) return;
    
    const availableCredits = currentUser ? currentUser.credits : guestCredits;
    if (availableCredits < COSTS.IMAGE) {
      if (!currentUser) {
        addNotification({ title: 'Insufficient Credits', message: 'Sign in to claim 5 free credits.', type: 'error' });
        setShowAuthModal(true);
      } else {
        addNotification({ title: 'Insufficient Credits', message: 'Balance below 5 CR.', type: 'error' });
      }
      return;
    }

    if (currentUser) {
      setCurrentUser(prev => prev ? { ...prev, credits: prev.credits - COSTS.IMAGE } : null);
    } else {
      setGuestCredits(prev => prev - COSTS.IMAGE);
    }
    
    setPendingTasksCount(prev => prev + 1);
    addNotification({
      title: 'Synthesis Initiated',
      message: 'Generating high-fidelity render...',
      type: 'info'
    });

    const currentDna = { ...modelDna };
    const currentApparelName = activeApparel.name;
    const ownerId = currentUser ? currentUser.id : 'guest';
    
    try {
      const compositeImageUrl = await canvasRef.current.getCompositeImage();
      generateFashionModel(compositeImageUrl, currentDna, activeApparel, activeView)
        .then(result => {
          const newItem: GalleryItem = {
            id: Date.now().toString(), ownerId, type: 'image', url: result,
            timestamp: Date.now(), dna: currentDna, apparelName: currentApparelName
          };
          setGalleryItems(prev => [newItem, ...prev]);
          addNotification({
            title: 'Synthesis Successful',
            message: 'Preview added to collection.',
            type: 'success', thumbnail: result, item: newItem
          });
        })
        .catch(err => {
          if (currentUser) setCurrentUser(prev => prev ? { ...prev, credits: prev.credits + COSTS.IMAGE } : null);
          else setGuestCredits(prev => prev + COSTS.IMAGE);
          addNotification({ title: 'Synthesis Failed', message: err.message, type: 'error' });
        })
        .finally(() => setPendingTasksCount(prev => Math.max(0, prev - 1)));
    } catch (err: any) {
      if (currentUser) setCurrentUser(prev => prev ? { ...prev, credits: prev.credits + COSTS.IMAGE } : null);
      else setGuestCredits(prev => prev + COSTS.IMAGE);
      setPendingTasksCount(prev => Math.max(0, prev - 1));
      addNotification({ title: 'Blueprint Error', message: 'Could not prepare design blueprint.', type: 'error' });
    }
  };

  const handleAnimateImage = async (item: GalleryItem, preset: MotionPreset) => {
    const availableCredits = currentUser ? currentUser.credits : guestCredits;
    if (availableCredits < COSTS.VIDEO) {
      addNotification({ title: 'Insufficient Credits', message: 'Video synthesis requires 25 CR.', type: 'error' });
      if (!currentUser) setShowAuthModal(true);
      return;
    }

    if (currentUser) setCurrentUser(prev => prev ? { ...prev, credits: prev.credits - COSTS.VIDEO } : null);
    else setGuestCredits(prev => prev - COSTS.VIDEO);

    setPendingTasksCount(prev => prev + 1);
    addNotification({
      title: 'Motion Rendering Started',
      message: 'Generating high-definition sequence...',
      type: 'info'
    });

    generateFashionVideo(item.url, preset.prompt)
      .then(videoUrl => {
        const newItem: GalleryItem = {
          id: Date.now().toString(), ownerId: currentUser ? currentUser.id : 'guest', 
          type: 'video', url: videoUrl, timestamp: Date.now(), dna: { ...item.dna }, apparelName: item.apparelName
        };
        setGalleryItems(prev => [newItem, ...prev]);
        addNotification({ title: 'Motion Ready', message: 'Video added to collection.', type: 'success', item: newItem });
      })
      .catch(err => {
        if (currentUser) setCurrentUser(prev => prev ? { ...prev, credits: prev.credits + COSTS.VIDEO } : null);
        else setGuestCredits(prev => prev + COSTS.VIDEO);
        if (err.message && err.message.includes("Requested entity was not found.")) {
          setHasApiKey(false);
          addNotification({ title: 'Key Error', message: 'Invalid API key project setup.', type: 'error' });
        } else {
          addNotification({ title: 'Animation Failed', message: err.message, type: 'error' });
        }
      })
      .finally(() => setPendingTasksCount(prev => Math.max(0, prev - 1)));
  };

  const handleRemoveAsset = (id: string) => {
    if (confirm("Permanently delete this asset?")) {
      setGalleryItems(prev => prev.filter(item => item.id !== id));
      addNotification({ title: 'Asset Removed', message: 'Item deleted.', type: 'info' });
    }
  };

  const isGenerateDisabled = !activeApparel || !activeApparel.views[activeView];

  if (showIntro) return <IntroAnimation theme={theme} />;

  if (!hasApiKey) {
    return (
      <div className={`fixed inset-0 z-[2000] flex flex-col items-center justify-center p-6 text-center ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-zinc-900'}`}>
        <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mb-8 shadow-2xl animate-pulse">
          <Zap className="text-white fill-current" size={32} />
        </div>
        <h2 className="text-3xl font-bold tracking-tight mb-4">API Key Required</h2>
        <p className="max-w-md text-zinc-500 mb-8">Advanced video models require a paid Google Cloud API key with billing enabled.</p>
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button 
            onClick={async () => {
              if (window.aistudio) {
                await window.aistudio.openSelectKey();
                setHasApiKey(true);
              }
            }}
            className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold shadow-xl hover:scale-105 transition-all"
          >
            Select API Key
          </button>
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-blue-500 uppercase tracking-widest hover:underline">Billing Docs</a>
        </div>
      </div>
    );
  }
  
  if (!currentUser && !isGuest) {
    return <Auth onLogin={handleLogin} onGuest={() => setIsGuest(true)} theme={theme} />;
  }

  return (
    <div className={`flex flex-col h-screen bg-[#fbfbfb] dark:bg-black text-[#1d1d1f] dark:text-[#f5f5f7] overflow-hidden transition-colors duration-300`}>
      <header className="h-14 bg-white/70 dark:bg-black/70 backdrop-blur-xl z-[60] flex items-center justify-between px-4 md:px-8 border-b border-gray-100/50 dark:border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={() => setIsLeftSidebarOpen(true)} className="p-2 -ml-2 lg:hidden text-zinc-500 hover:text-zinc-900 dark:hover:text-white"><Menu size={20} /></button>
          <div className="w-8 h-8 bg-zinc-900 dark:bg-white flex items-center justify-center rounded-lg shadow-sm shrink-0">
            <Zap className="text-white dark:text-black fill-current" size={16} />
          </div>
          <div className="hidden sm:flex flex-col">
            <h1 className="text-sm font-semibold tracking-tight whitespace-nowrap">AI Fashion Studio</h1>
            <div className="flex items-center gap-1.5">
              {currentUser ? (
                <div className="flex items-center gap-1"><CloudCheck size={10} className="text-zinc-400" /><span className="text-[8px] font-bold text-zinc-400 uppercase tracking-tight">Vault</span></div>
              ) : (
                <div className="flex items-center gap-1"><Lock size={10} className="text-amber-500" /><span className="text-[8px] font-bold text-amber-500 uppercase tracking-tight">Guest</span></div>
              )}
            </div>
          </div>
        </div>

        <nav className="flex items-center gap-1 bg-gray-100/50 dark:bg-zinc-900/50 p-1 rounded-xl">
          <button onClick={() => setActiveMode('studio')} className={`px-3 md:px-4 py-1.5 text-[10px] md:text-xs font-medium rounded-lg transition-all ${activeMode === 'studio' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-zinc-900'}`}>Design</button>
          <button onClick={() => setActiveMode('gallery')} className={`px-3 md:px-4 py-1.5 text-[10px] md:text-xs font-medium rounded-lg transition-all relative ${activeMode === 'gallery' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-zinc-900'}`}>
            Collection
            {pendingTasksCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
            )}
          </button>
        </nav>
        
        <div className="flex items-center gap-2 md:gap-6">
          <div className="flex items-center gap-2 md:gap-3 pr-2 md:pr-6 border-r border-gray-100 dark:border-white/10">
            {pendingTasksCount > 0 && (
              <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full animate-pulse mr-2">
                <Loader2 size={10} className="animate-spin text-zinc-400" />
                <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-400">Rendering</span>
              </div>
            )}
            <button onClick={resetCredits} className="flex items-center gap-1 px-2 md:px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-full hover:bg-blue-100 dark:hover:bg-blue-800/40 transition-all group" title="Replenish credits">
              <Coins className="text-blue-500 group-hover:scale-110 transition-transform" size={12} />
              <span className="text-[10px] md:text-xs font-bold text-blue-600 dark:text-blue-400">{currentUser ? currentUser.credits : guestCredits}</span>
            </button>
            <button onClick={() => currentUser ? setShowAccountDashboard(true) : setShowAuthModal(true)} className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all overflow-hidden border border-zinc-200 dark:border-zinc-700 shrink-0">
              {currentUser?.avatar ? <img src={currentUser.avatar} className="w-full h-full object-cover" /> : <UserIcon size={16} />}
            </button>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button onClick={toggleTheme} className="hidden sm:block p-2 text-gray-400 hover:text-zinc-900 dark:hover:text-white transition-colors">{theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}</button>
            <button onClick={() => setIsRightSidebarOpen(true)} className="p-2 lg:hidden text-zinc-500 hover:text-zinc-900 dark:hover:text-white"><Settings2 size={20} /></button>
            {activeMode === 'studio' && (
              <button onClick={handleGenerate} disabled={isGenerateDisabled || pendingTasksCount > 0} className={`px-3 md:px-6 py-2 rounded-full text-[10px] md:text-xs font-semibold transition-all flex items-center gap-2 shadow-lg ${ (isGenerateDisabled || pendingTasksCount > 0) ? 'bg-gray-100 dark:bg-zinc-800 text-gray-400 cursor-not-allowed' : 'bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200'}`}>
                {pendingTasksCount > 0 ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} className="text-blue-400" />}
                <span className="hidden xs:inline">{pendingTasksCount > 0 ? 'Synthesizing...' : 'Synthesize'}</span>
                {pendingTasksCount === 0 && <ArrowRight size={14} />}
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative overflow-hidden">
        {activeMode === 'studio' ? (
          <>
            <div className={`fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm transition-opacity lg:hidden ${isLeftSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsLeftSidebarOpen(false)} />
            <div className={`fixed inset-y-0 left-0 z-[80] w-80 max-w-[85vw] transform transition-transform duration-300 lg:relative lg:transform-none lg:z-0 shrink-0 ${isLeftSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
              <div className="absolute top-4 right-4 lg:hidden"><button onClick={() => setIsLeftSidebarOpen(false)} className="p-2 text-gray-400"><XIcon size={20} /></button></div>
              <SidebarLeft apparels={apparels} graphics={graphics} modelDna={modelDna} setModelDna={setModelDna} onSelectApparel={handleSelectApparel} onAddGraphic={(url) => {
                const newDesignId = Math.random().toString(36).substr(2, 9);
                setViewDesigns(prev => ({ ...prev, [activeView]: [...prev[activeView], { id: newDesignId, src: url, x: 50, y: 50, scale: 1, rotation: 0, opacity: 1 }] }));
                setActiveDesignId(newDesignId);
              }} onUploadGraphic={(url) => setGraphics(prev => [{ id: Date.now().toString(), name: 'Upload', url, type: 'graphic' }, ...prev])} onDeleteGraphic={(id) => setGraphics(prev => prev.filter(g => g.id !== id))} onUploadApparel={(app) => setApparels(prev => [app, ...prev])} onDeleteApparel={(id) => setApparels(prev => prev.filter(a => a.id !== id))} activeApparelId={activeApparel?.id} />
            </div>

            <main className="flex-1 relative bg-[#fcfcfc] dark:bg-[#0a0a0a] flex flex-col items-center justify-center overflow-hidden p-4">
              {activeApparel ? (
                <>
                  <nav className="absolute top-4 md:top-8 left-1/2 -translate-x-1/2 flex gap-1 p-1 bg-white/80 dark:bg-zinc-900/80 border border-gray-100 dark:border-white/10 rounded-full shadow-lg backdrop-blur-md z-10 scale-90 md:scale-100">
                    {(['front', 'back', 'side'] as ApparelView[]).map(v => (
                      <button key={v} onClick={() => { setActiveView(v); setActiveDesignId(null); }} className={`px-4 md:px-6 py-2 text-[10px] md:text-[11px] font-semibold rounded-full transition-all flex items-center gap-2 ${activeView === v ? 'bg-zinc-900 dark:bg-white text-white dark:text-black' : 'text-gray-500 hover:text-zinc-900'} ${!activeApparel.views[v] ? 'opacity-40 line-through' : ''}`}>{v.toUpperCase()}</button>
                    ))}
                  </nav>
                  <StudioCanvas ref={canvasRef} view={activeView} apparel={activeApparel} designs={viewDesigns[activeView]} activeId={activeDesignId} setActiveId={setActiveDesignId} onUpdateDesign={(id, updates) => setViewDesigns(prev => ({ ...prev, [activeView]: prev[activeView].map(d => d.id === id ? { ...d, ...updates } : d) }))} onRemoveDesign={(id) => setViewDesigns(prev => ({ ...prev, [activeView]: prev[activeView].filter(d => d.id !== id) }))} />
                </>
              ) : (
                <section className="text-center space-y-8 animate-in fade-in duration-700 max-w-sm">
                   <div className="flex flex-col items-center gap-4">
                      <Layout size={40} className="text-gray-200 dark:text-zinc-800" />
                      <div><h2 className="text-lg md:text-xl font-semibold tracking-tight">Studio Preview</h2><p className="text-[10px] md:text-xs text-zinc-400 mt-2">Pick a style to begin.</p></div>
                   </div>
                   <div className="grid grid-cols-1 gap-3 w-full">
                      <button onClick={() => setIsLeftSidebarOpen(true)} className="flex items-center justify-center gap-2 py-3 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/10 rounded-2xl text-xs font-bold shadow-sm hover:scale-105 transition-all"><Shirt className="text-blue-500" size={16} /> Choose a Style</button>
                      {!currentUser && <button onClick={() => setShowAuthModal(true)} className="flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-2xl text-xs font-bold shadow-lg hover:scale-105 transition-all"><ShieldCheck size={16} /> Claim Your 5 Free Credits</button>}
                   </div>
                </section>
              )}
            </main>

            <div className={`fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm transition-opacity lg:hidden ${isRightSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsRightSidebarOpen(false)} />
            <div className={`fixed inset-y-0 right-0 z-[80] w-80 max-w-[85vw] transform transition-transform duration-300 lg:relative lg:transform-none lg:z-0 shrink-0 ${isRightSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
              <div className="absolute top-4 left-4 lg:hidden z-10"><button onClick={() => setIsRightSidebarOpen(false)} className="p-2 text-gray-400"><XIcon size={20} /></button></div>
              <SidebarRight dna={modelDna} setDna={setModelDna} savedProfiles={savedProfiles} onSaveProfile={(name) => currentUser ? setSavedProfiles(prev => [{ id: Date.now().toString(), ownerId: currentUser.id, name, dna: { ...modelDna } }, ...prev]) : setShowAuthModal(true)} onDeleteProfile={(id) => setSavedProfiles(prev => prev.filter(p => p.id !== id))} onApplyProfile={(dna) => setModelDna({ ...dna })} />
            </div>
          </>
        ) : (
          <main className="flex-1 h-full overflow-hidden flex flex-col">
            <Gallery items={galleryItems} onRemove={handleRemoveAsset} onAnimate={handleAnimateImage} onExtractDna={(dna) => { setModelDna({ ...dna }); setActiveMode('studio'); }} user={currentUser} onLoginRequired={() => setShowAuthModal(true)} isLoading={!isHydrated} />
          </main>
        )}
      </div>

      <div className="fixed bottom-4 right-4 left-4 md:bottom-8 md:right-8 md:left-auto z-[100] flex flex-col gap-3 md:w-80">
        {notifications.map((notif) => (
          <div key={notif.id} className={`p-3 md:p-4 bg-white/95 dark:bg-zinc-900/95 border border-gray-100 dark:border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl animate-in slide-in-from-right-full fade-in duration-500 flex gap-4 ring-1 ring-black/5 ${notif.type === 'info' ? 'border-blue-200 dark:border-blue-900/30' : ''}`}>
            {notif.thumbnail ? <img src={notif.thumbnail} className="w-10 h-14 object-cover rounded-lg shadow-sm shrink-0" alt="Preview" /> : (
              <div className={`w-10 h-14 rounded-lg flex items-center justify-center shrink-0 ${notif.type === 'success' ? 'bg-green-100 dark:bg-green-900/20' : notif.type === 'info' ? 'bg-blue-100 dark:bg-blue-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                {notif.type === 'success' ? <CheckCircle2 className="text-green-500" size={16} /> : notif.type === 'info' ? <Loader2 className="text-blue-500 animate-spin" size={16} /> : <XIcon className="text-red-500" size={16} />}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="text-[11px] md:text-xs font-bold truncate">{notif.title}</h4>
              <p className="text-[9px] md:text-[10px] text-zinc-500 mt-0.5 md:mt-1 line-clamp-2">{notif.message}</p>
              {notif.item && <button onClick={() => { setActiveMode('gallery'); setNotifications(prev => prev.filter(n => n.id !== notif.id)); }} className="mt-1.5 text-[9px] font-bold text-blue-500 flex items-center gap-1 hover:underline">View in Collection <ExternalLink size={10} /></button>}
            </div>
            <button onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))} className="text-zinc-300 hover:text-zinc-500"><XIcon size={14} /></button>
          </div>
        ))}
      </div>

      {showAccountDashboard && currentUser && <Dashboard user={currentUser} onClose={() => setShowAccountDashboard(false)} onLogout={handleLogout} onResetCredits={resetCredits} stats={{ totalRenders: galleryItems.length }} />}

      {showAuthModal && (
        <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto rounded-[3rem]">
            <button onClick={() => setShowAuthModal(false)} className="absolute top-6 right-6 p-2 text-white hover:text-gray-300 z-10"><XIcon size={24} /></button>
            <Auth onLogin={handleLogin} onGuest={() => setShowAuthModal(false)} theme={theme} isModal />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
