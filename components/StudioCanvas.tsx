
import React, { useRef, useState, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { RotateCcw, Trash2, ZoomIn, ZoomOut, X, ImageIcon } from 'lucide-react';
import { ApparelBase, ApparelView, DesignElement } from '../types';

interface StudioCanvasProps {
  view: ApparelView;
  apparel: ApparelBase;
  designs: DesignElement[];
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  onUpdateDesign: (id: string, updates: Partial<DesignElement>) => void;
  onRemoveDesign: (id: string) => void;
}

export interface StudioCanvasHandle {
  getCompositeImage: () => Promise<string>;
}

type TransformMode = 'none' | 'moving' | 'resizing' | 'rotating';

const StudioCanvas = forwardRef<StudioCanvasHandle, StudioCanvasProps>(({ 
  view, 
  apparel, 
  designs, 
  activeId,
  setActiveId,
  onUpdateDesign, 
  onRemoveDesign 
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transformMode, setTransformMode] = useState<TransformMode>('none');
  const [apparelScale, setApparelScale] = useState(1);
  
  const dragRef = useRef({
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
    initialScale: 1,
    initialRotation: 0,
    activeId: ''
  });

  const activeDesign = designs.find(d => d.id === activeId);
  const currentViewImage = apparel.views[view];

  useImperativeHandle(ref, () => ({
    getCompositeImage: async () => {
      if (!currentViewImage) throw new Error("View missing.");
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Context failed");

      const loadImage = (src: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
        const img = new Image();
        if (src.startsWith('http')) {
          img.crossOrigin = "anonymous";
        }
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image`));
        img.src = src;
      });

      const baseImg = await loadImage(currentViewImage);
      canvas.width = baseImg.width;
      canvas.height = baseImg.height;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);

      const UI_WIDTH = 600;
      const UI_HEIGHT = 800;
      const imageRatio = baseImg.width / baseImg.height;
      const containerRatio = UI_WIDTH / UI_HEIGHT;
      let renderWidth, renderHeight, offsetX, offsetY;
      if (imageRatio > containerRatio) {
        renderWidth = UI_WIDTH;
        renderHeight = UI_WIDTH / imageRatio;
        offsetX = 0;
        offsetY = (UI_HEIGHT - renderHeight) / 2;
      } else {
        renderHeight = UI_HEIGHT;
        renderWidth = UI_HEIGHT * imageRatio;
        offsetY = 0;
        offsetX = (UI_WIDTH - renderWidth) / 2;
      }

      for (const design of designs) {
        const dImg = await loadImage(design.src);
        const uiCenterX = (design.x / 100) * UI_WIDTH;
        const uiCenterY = (design.y / 100) * UI_HEIGHT;
        const canvasCenterX = ((uiCenterX - offsetX) / renderWidth) * canvas.width;
        const canvasCenterY = ((uiCenterY - offsetY) / renderHeight) * canvas.height;
        const designWidthOnCanvas = (128 * design.scale / renderWidth) * canvas.width;
        const designHeightOnCanvas = (dImg.height / dImg.width) * designWidthOnCanvas;

        ctx.save();
        ctx.translate(canvasCenterX, canvasCenterY);
        ctx.rotate((design.rotation * Math.PI) / 180);
        ctx.globalAlpha = design.opacity;
        ctx.drawImage(dImg, -designWidthOnCanvas / 2, -designHeightOnCanvas / 2, designWidthOnCanvas, designHeightOnCanvas);
        ctx.restore();
      }
      return canvas.toDataURL('image/png');
    }
  }));

  const startTransform = (id: string, mode: TransformMode, e: React.MouseEvent | React.TouchEvent) => {
    // Crucial: Stop propagation so the canvas background doesn't catch this event
    e.stopPropagation();
    
    const design = designs.find(d => d.id === id);
    if (!design) return;
    
    setActiveId(id);
    setTransformMode(mode);
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    dragRef.current = {
      startX: clientX,
      startY: clientY,
      initialX: design.x,
      initialY: design.y,
      initialScale: design.scale,
      initialRotation: design.rotation,
      activeId: id
    };
  };

  const handleRemoveClick = (id: string, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    onRemoveDesign(id);
    setActiveId(null);
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (transformMode === 'none' || !containerRef.current) return;
      
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const rect = containerRef.current.getBoundingClientRect();
      
      // Calculate delta relative to movement starts
      const dx = (clientX - dragRef.current.startX) / apparelScale;
      const dy = (clientY - dragRef.current.startY) / apparelScale;
      
      if (transformMode === 'moving') {
        onUpdateDesign(dragRef.current.activeId, { 
          x: Math.max(0, Math.min(100, dragRef.current.initialX + (dx / rect.width) * 100)), 
          y: Math.max(0, Math.min(100, dragRef.current.initialY + (dy / rect.height) * 100)) 
        });
      } else if (transformMode === 'resizing') {
        const dist = Math.sqrt(dx * dx + dy * dy);
        // Simple scale logic: if moving away from center, increase
        const direction = (dx + dy) > 0 ? 1 : -1;
        const scale = Math.max(0.1, Math.min(5, dragRef.current.initialScale + (direction * dist / 200)));
        onUpdateDesign(dragRef.current.activeId, { scale });
      } else if (transformMode === 'rotating') {
        const cx = rect.left + (rect.width * dragRef.current.initialX) / 100;
        const cy = rect.top + (rect.height * dragRef.current.initialY) / 100;
        const angle = Math.atan2(clientY - cy, clientX - cx) * 180 / Math.PI + 90;
        onUpdateDesign(dragRef.current.activeId, { rotation: angle });
      }
    };

    const stop = () => setTransformMode('none');

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', stop);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', stop);
    
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', stop);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', stop);
    };
  }, [transformMode, onUpdateDesign, apparelScale]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      <div 
        ref={containerRef}
        onMouseDown={() => transformMode === 'none' && setActiveId(null)}
        onTouchStart={() => transformMode === 'none' && setActiveId(null)}
        className="relative w-full max-w-[90vw] md:max-w-[600px] aspect-[3/4] bg-white dark:bg-zinc-900 shadow-2xl rounded-3xl overflow-hidden ring-1 ring-gray-100 dark:ring-white/10 flex items-center justify-center transition-colors"
      >
        {currentViewImage ? (
          <div 
            className="absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-out"
            style={{ transform: `scale(${apparelScale})` }}
          >
            <div className="relative w-full h-full p-6 md:p-8 flex items-center justify-center">
              <img src={currentViewImage} className="w-full h-full object-contain pointer-events-none opacity-90 dark:brightness-110" />
              <div className="absolute inset-0 p-6 md:p-8">
                <div className="relative w-full h-full">
                  {designs.map(design => (
                    <div 
                      key={design.id}
                      onMouseDown={(e) => startTransform(design.id, 'moving', e)}
                      onTouchStart={(e) => startTransform(design.id, 'moving', e)}
                      className={`absolute group cursor-move transition-shadow ${activeId === design.id ? 'z-[100]' : 'z-10'}`}
                      style={{
                        left: `${design.x}%`,
                        top: `${design.y}%`,
                        transform: `translate(-50%, -50%) scale(${design.scale}) rotate(${design.rotation}deg)`,
                        opacity: design.opacity
                      }}
                    >
                      {activeId === design.id && (
                        <div className="absolute -inset-4 md:-inset-6 border-2 border-zinc-900 dark:border-white border-dashed pointer-events-none rounded-lg">
                          {/* Rotation Handle */}
                          <button 
                            onMouseDown={(e) => startTransform(design.id, 'rotating', e)}
                            onTouchStart={(e) => startTransform(design.id, 'rotating', e)}
                            className="absolute -top-12 left-1/2 -translate-x-1/2 w-10 h-10 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center shadow-lg pointer-events-auto hover:scale-110 transition-transform"
                          >
                            <RotateCcw size={16} />
                          </button>
                          
                          {/* Delete Handle */}
                          <button 
                            onMouseDown={(e) => handleRemoveClick(design.id, e)}
                            onTouchStart={(e) => handleRemoveClick(design.id, e)}
                            className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg pointer-events-auto hover:scale-110 transition-transform"
                          >
                            <Trash2 size={16} />
                          </button>

                          {/* Resize Handles */}
                          {['nw', 'ne', 'sw', 'se'].map(pos => (
                            <button 
                              key={pos}
                              onMouseDown={(e) => startTransform(design.id, 'resizing', e)}
                              onTouchStart={(e) => startTransform(design.id, 'resizing', e)}
                              className={`absolute w-6 h-6 bg-white dark:bg-zinc-800 border-2 border-zinc-900 dark:border-white rounded-full shadow-md pointer-events-auto hover:scale-125 transition-transform
                                ${pos === 'nw' ? '-top-3 -left-3 cursor-nw-resize' : ''}
                                ${pos === 'ne' ? '-top-3 -right-3 cursor-ne-resize' : ''}
                                ${pos === 'sw' ? '-bottom-3 -left-3 cursor-sw-resize' : ''}
                                ${pos === 'se' ? '-bottom-3 -right-3 cursor-se-resize' : ''}
                              `}
                            />
                          ))}
                        </div>
                      )}
                      <img src={design.src} className="w-24 h-24 md:w-32 md:h-32 object-contain pointer-events-none select-none" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center px-8">
            <ImageIcon className="text-gray-200" size={48} />
            <p className="text-sm font-semibold uppercase tracking-widest text-gray-400">Preview Not Ready</p>
          </div>
        )}

        {currentViewImage && (
          <div className="absolute bottom-4 left-4 flex items-center gap-1 md:gap-2 bg-white/80 dark:bg-zinc-800/80 border border-gray-100 dark:border-white/10 p-1 rounded-full shadow-lg backdrop-blur-md">
            <button onClick={(e) => { e.stopPropagation(); setApparelScale(s => Math.max(0.5, s - 0.1)) }} className="p-1.5 md:p-2 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-full"><ZoomOut size={14} /></button>
            <span className="text-[9px] md:text-[10px] font-bold w-7 md:w-8 text-center">{Math.round(apparelScale * 100)}%</span>
            <button onClick={(e) => { e.stopPropagation(); setApparelScale(s => Math.min(3, s + 0.1)) }} className="p-1.5 md:p-2 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-full"><ZoomIn size={14} /></button>
          </div>
        )}
      </div>

      {activeDesign && (
        <div className="fixed lg:absolute bottom-4 lg:bottom-auto lg:-right-72 lg:top-1/2 lg:-translate-y-1/2 w-full lg:w-64 max-w-[calc(100vw-2rem)] bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/10 p-5 md:p-6 rounded-[2rem] shadow-2xl z-[90] animate-in slide-in-from-bottom-4 lg:slide-in-from-left-4 transition-colors">
          <div className="flex items-center justify-between mb-6">
            <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Adjustment</h5>
            <button onClick={() => setActiveId(null)} className="lg:hidden p-1 text-gray-400"><X size={16} /></button>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase"><span>Scale</span><span className="text-zinc-400">{Math.round(activeDesign.scale * 100)}%</span></div>
              <input type="range" min="0.1" max="5.0" step="0.05" value={activeDesign.scale} onChange={(e) => onUpdateDesign(activeDesign.id, { scale: parseFloat(e.target.value) })} className="w-full accent-zinc-900 dark:accent-white h-1 bg-gray-100 dark:bg-zinc-800 rounded-full appearance-none" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase"><span>Rotate</span><span className="text-zinc-400">{Math.round(activeDesign.rotation)}°</span></div>
              <input type="range" min="0" max="360" step="1" value={activeDesign.rotation} onChange={(e) => onUpdateDesign(activeDesign.id, { rotation: parseInt(e.target.value) })} className="w-full accent-zinc-900 dark:accent-white h-1 bg-gray-100 dark:bg-zinc-800 rounded-full appearance-none" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase"><span>Opacity</span><span className="text-zinc-400">{Math.round(activeDesign.opacity * 100)}%</span></div>
              <input type="range" min="0" max="1.0" step="0.01" value={activeDesign.opacity} onChange={(e) => onUpdateDesign(activeDesign.id, { opacity: parseFloat(e.target.value) })} className="w-full accent-zinc-900 dark:accent-white h-1 bg-gray-100 dark:bg-zinc-800 rounded-full appearance-none" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default StudioCanvas;
