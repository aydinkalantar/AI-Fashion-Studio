
import { GoogleGenAI } from "@google/genai";
import { ModelDna, ApparelBase, ApparelView } from "../types";

async function resizeImage(dataUrl: string, maxWidth = 1536): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error("Canvas failure"));
        return;
      }
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.98).split(',')[1]);
    };
    img.onerror = () => reject(new Error("Image Load Failure"));
    img.src = dataUrl;
  });
}

export const generateFashionModel = async (
  compositeImageUrl: string,
  dna: ModelDna,
  apparel: ApparelBase,
  view: ApparelView
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const base64Composite = await resizeImage(compositeImageUrl);
  let base64Face: string | undefined = undefined;

  if (dna.faceImage) {
    base64Face = await resizeImage(dna.faceImage, 1024);
  }

  const decorationGuidance = {
    'No Decoration Technique': 'Flat prints, high-quality, blending smoothly with ambient studio light.',
    'Screen Printing': 'Flat ink finish, opaque, minimal texture, solid colors.',
    'DTG (Direct to Garment)': 'Artwork absorbed into fibers, garment texture visible through ink.',
    'DTF (Direct to Film)': 'Vibrant, slightly glossy, sharply defined plastic layer finish.',
    'Embroidery': '3D stitched texture, tight satin patterns, thread sheen, physical elevation.',
    'Embossing': 'Physical 3D relief, raised out of fabric, ton-sur-ton color, realistic shadows.'
  }[dna.decorationType] || '';

  const targetColor = dna.garmentColor === 'Default' ? apparel.color : dna.garmentColor;

  // STRICT SYSTEM INSTRUCTION: Sets the mechanical constraints.
  const systemInstruction = `
ROLE: Senior AI Fashion Synthesis Engine (Vogue/Editorial Standard).
MISSION: Synthesize the design blueprint (Image 1) onto a specific human model defined by the DNA PROFILE below.

DNA CONSTRAINTS (MANDATORY):
- GENDER: ${dna.gender} (Strictly follow this, ignore any gender-cues from the garment blueprint).
- ETHNICITY: ${dna.race}.
- PHYSIQUE: ${dna.bodyType}.
- AGE: ${dna.age} years old.

TECHNICAL SPECS:
- Maintain EXACT spatial ratio of the artwork from Image 1.
- Garment Color: ${targetColor}.
- Texture Finish: ${dna.decorationType} (${decorationGuidance}).
${dna.faceImage ? 'TARGET IDENTITY: Use Image 2 for facial structure and likeness.' : ''}
`;

  // NARRATIVE PROMPT: Reinforces the visual attributes for the model's generation.
  const visualPrompt = `
High-end editorial fashion photography. 
SUBJECT: A ${dna.age}-year-old ${dna.race} ${dna.gender} fashion model with a ${dna.bodyType} body type.
CLOTHING: The model is wearing the ${targetColor} garment with custom artwork exactly as mapped in the blueprint.
ACCESSORIES: ${dna.accessories}.
POSE: ${dna.pose}.
SCENE: ${dna.environment}.
STYLING: Professional studio lighting, 8k resolution, cinematic composition, highly detailed fabric textures, photorealistic skin and hair.
`;

  const contentsParts: any[] = [
    { inlineData: { data: base64Composite, mimeType: 'image/jpeg' } }
  ];

  if (base64Face) {
    contentsParts.push({ inlineData: { data: base64Face, mimeType: 'image/jpeg' } });
  }

  contentsParts.push({ text: visualPrompt });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: contentsParts },
    config: {
      systemInstruction: systemInstruction,
      temperature: 0.4, // Slightly higher temperature allows for more natural human posing
      imageConfig: { 
        aspectRatio: "3:4" 
      }
    }
  });

  if (!response.candidates?.[0]?.content?.parts) throw new Error("Synthesis failed - Check API permissions.");
  const part = response.candidates[0].content.parts.find(p => p.inlineData);
  if (!part) throw new Error("No image output returned from engine.");
  return `data:image/png;base64,${part.inlineData.data}`;
};

export const generateFashionVideo = async (
  sourceImageUrl: string,
  motionPrompt: string,
  onProgress?: (status: string) => void
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const base64Data = sourceImageUrl.split(',')[1];

  onProgress?.("Initializing motion director...");
  
  const specializedPrompt = `
HIGH-FIDELITY MOTION DIRECTOR PROTOCOL:
- ACTION: ${motionPrompt}
- CONSTRAINT: Clothing design MUST remain EXACTLY identical to the source image.
- QUALITY: Photorealistic luxury fashion commercial aesthetic.
- CAMERA: Static camera. No zoom. No shake. Cinematic composition.
- NEGATIVE: No garment warping, melting, or AI hallucinations. No extra limbs. No face morphing.
- PHYSICS: Natural body balance and subtle fabric weight follow realistic gravity.
`;

  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: specializedPrompt,
    image: {
      imageBytes: base64Data,
      mimeType: 'image/png',
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '9:16'
    }
  });

  while (!operation.done) {
    onProgress?.("Rendering frames...");
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({operation: operation});
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Video generation failed.");

  const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};
