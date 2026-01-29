
export type ApparelView = 'front' | 'back' | 'side';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  credits: number;
  plan: 'Starter' | 'Pro' | 'Enterprise';
  createdAt: number;
}

export interface DesignElement {
  id: string;
  src: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  scale: number;
  rotation: number;
  opacity: number;
}

export interface ModelDna {
  gender: string;
  race: string;
  age: number;
  bodyType: string;
  pose: string;
  environment: string;
  decorationType: string;
  garmentColor: string;
  accessories: string;
  faceImage?: string; // Base64 face identity
}

export interface SavedModelProfile {
  id: string;
  ownerId: string;
  name: string;
  dna: ModelDna;
}

export interface ApparelBase {
  id: string;
  name: string;
  type: string;
  color: string;
  views: Record<ApparelView, string>;
}

export interface Asset {
  id: string;
  name: string;
  url: string;
  type: 'apparel' | 'graphic';
}

export interface GalleryItem {
  id: string;
  ownerId: string;
  type: 'image' | 'video';
  url: string;
  timestamp: number;
  dna: ModelDna;
  apparelName: string;
}

export interface MotionPreset {
  id: string;
  name: string;
  prompt: string;
  duration: '4s' | '6s' | '8s';
}
