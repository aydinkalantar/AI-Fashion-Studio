
import { ApparelBase, Asset, MotionPreset } from './types';

export const APPAREL_BASES: ApparelBase[] = [
  {
    id: 'base-hoodie-1',
    name: 'Oversized Studio Hoodie',
    type: 'Hoodie',
    color: 'White',
    views: {
      front: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800',
      back: '',
      side: ''
    }
  },
  {
    id: 'base-tee-1',
    name: 'Essential Boxy Tee',
    type: 'T-Shirt',
    color: 'Black',
    views: {
      front: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800',
      back: '',
      side: ''
    }
  }
];

export const GRAPHIC_ASSETS: Asset[] = [
  { id: 'g1', name: 'Cyber Logo', url: 'https://picsum.photos/seed/cyber/400/400', type: 'graphic' },
  { id: 'g2', name: 'Street Font', url: 'https://picsum.photos/seed/font/400/400', type: 'graphic' },
  { id: 'g3', name: 'Abstract Art', url: 'https://picsum.photos/seed/art/400/400', type: 'graphic' },
  { id: 'g4', name: 'Neon Icon', url: 'https://picsum.photos/seed/neon/400/400', type: 'graphic' },
  { id: 'g5', name: 'Minimalist Wave', url: 'https://picsum.photos/seed/wave/400/400', type: 'graphic' },
  { id: 'g6', name: 'Techno Grid', url: 'https://picsum.photos/seed/grid/400/400', type: 'graphic' }
];

export const MOTION_PRESETS: MotionPreset[] = [
  { 
    id: 'turn_premium', 
    name: '360° Luxury Turn', 
    duration: '8s',
    prompt: 'Professional fashion TURN-IN-PLACE motion. Starts facing forward, slowly rotates 180 degrees over 8 seconds. Ends facing slightly angled. Neutral facial expression, confident posture, static camera, cinematic studio lighting.' 
  },
  { 
    id: 'turn_dynamic', 
    name: 'Editorial Pivot', 
    duration: '4s',
    prompt: 'Professional fashion TURN-IN-PLACE motion. Fast but smooth rotation showcasing garment details. Static camera, no zoom, cinematic framing, luxury brand aesthetic.' 
  },
  { 
    id: 'breathe', 
    name: 'Static Showcase', 
    duration: '6s',
    prompt: 'Model standing still in a confident pose. Subtle breathing motion, realistic fabric physics, static camera, cinematic studio composition.' 
  }
];

export const MODEL_OPTIONS = {
  gender: ['Male', 'Female', 'Non-Binary', 'Androgynous'],
  race: [
    'Black / African Descent', 
    'East Asian', 
    'South Asian', 
    'Southeast Asian', 
    'White / Caucasian', 
    'Hispanic / Latinx', 
    'Middle Eastern', 
    'Indigenous / Native American', 
    'Pacific Islander',
    'Mixed Heritage',
    'Afro-Latino'
  ],
  bodyType: ['Slim', 'Athletic', 'Curvy / Plus Size', 'Muscular', 'Petite', 'Tall & Lean'],
  pose: [
    'Standing - Neutral', 
    'Dynamic Walking', 
    'Looking Back over Shoulder', 
    'High Fashion Squat', 
    'Leaning against Wall', 
    'Runway Turn', 
    'Sitting on Stool', 
    'Hands in Pockets', 
    'Studio Cross-arms', 
    'Adjusting Sunglasses',
    'Streetwear Crouch'
  ],
  environment: [
    'Studio Grey - Minimal', 
    'Tokyo Night Market - Neon', 
    'Parisian Balcony - Sunset', 
    'Brutalist Concrete Gallery', 
    'Lush Botanical Garden', 
    'Cyberpunk Underground', 
    'Luxury Penthouse Loft', 
    'Industrial Warehouse Loft', 
    'Nordic Snowy Peaks', 
    'Golden Hour Desert',
    'Mid-Century Modern Interior',
    'Metropolitan Crosswalk'
  ],
  decorationType: [
    'No Decoration Technique',
    'Screen Printing',
    'DTG (Direct to Garment)',
    'DTF (Direct to Film)',
    'Embroidery',
    'Embossing'
  ],
  garmentColors: [
    'Default',
    'Black',
    'White',
    'Gray',
    'Green',
    'Blue',
    'Navy Blue',
    'Red',
    'Yellow'
  ],
  accessories: [
    'No Accessories',
    'Sunglasses - Black',
    'Sunglasses - Clear',
    'Beanie - Knit',
    'Baseball Cap',
    'Chain Necklace - Silver',
    'Chain Necklace - Gold',
    'Wireless Headphones',
    'Tote Bag',
    'Designer Backpack'
  ]
};
