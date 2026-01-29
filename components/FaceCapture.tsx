
import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, Zap } from 'lucide-react';

interface FaceCaptureProps {
  onCapture: (base64: string) => void;
  onClose: () => void;
}

const FaceCapture: React.FC<FaceCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: { ideal: 1024 }, height: { ideal: 1024 } }, 
          audio: false 
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.onloadedmetadata = () => {
            setIsReady(true);
          };
        }
      } catch (err) {
        console.error("Camera access error:", err);
        setError("Camera access denied. Please check your browser permissions.");
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    // Use square crop for face
    const size = Math.min(video.videoWidth, video.videoHeight);
    const startX = (video.videoWidth - size) / 2;
    const startY = (video.videoHeight - size) / 2;

    canvas.width = 1024;
    canvas.height = 1024;
    
    // Draw mirrored
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, startX, startY, size, size, 0, 0, 1024, 1024);
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    onCapture(dataUrl);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-xl p-8 animate-in fade-in duration-300">
      <div className="relative bg-white dark:bg-zinc-900 rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100 dark:border-white/10">
        <div className="p-8 border-b border-gray-100 dark:border-white/10 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold tracking-tight">Virtual Identity Transfer</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Capture your features for virtual try-on</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="relative aspect-square bg-black">
          {!error && (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover scale-x-[-1]"
            />
          )}
          
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center text-zinc-400">
              <Camera size={48} className="mb-4 opacity-20" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {isReady && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-64 h-64 border-2 border-white/30 rounded-full border-dashed animate-pulse"></div>
              <div className="absolute top-8 left-8 text-[8px] font-bold text-white/50 uppercase tracking-widest">Studio Cam Feed Active</div>
            </div>
          )}
        </div>

        <div className="p-10 flex flex-col items-center gap-6">
          <p className="text-center text-xs text-gray-500 dark:text-zinc-400 leading-relaxed max-w-xs">
            Position your face within the circle. Ensure good lighting for high-fidelity identity synthesis.
          </p>
          
          <div className="flex items-center gap-4 w-full">
             <button 
              onClick={takePhoto}
              disabled={!isReady}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-full text-sm font-bold transition-all ${isReady ? 'bg-zinc-900 dark:bg-white text-white dark:text-black hover:scale-[1.02] shadow-xl' : 'bg-gray-100 dark:bg-zinc-800 text-gray-400 cursor-not-allowed'}`}
            >
              <Zap size={16} className="fill-current" /> Capture Identity
            </button>
            <button 
              onClick={onClose}
              className="px-6 py-4 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 rounded-full text-sm font-bold hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default FaceCapture;
