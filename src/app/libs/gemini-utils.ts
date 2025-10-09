import { GoogleGenerativeAI } from '@google/generative-ai';
import { pipeline } from '@xenova/transformers';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);


class EmbeddingPipeline {
  static task = 'feature-extraction';
  static model = 'Xenova/all-mpnet-base-v2'; // 768-dim model
  static instance: any = null;

  static async getInstance(progress_callback?: Function) {
    if (this.instance === null) {
      this.instance = await pipeline(this.task as any, this.model, { progress_callback });
    }
    return this.instance;
  }
}

export async function generateText(prompt: string, retries = 2): Promise<string> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {

      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
      
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error: any) {
      console.error(`Gemini API attempt ${attempt} failed with model 'gemini-2.5-flash-lite':`, error.message);
      if (attempt < retries) await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  return "Failed to get a response from the generative model.";
}


export async function generateImageDescription(filename: string): Promise<string> {
  const prompt = `Generate a detailed, creative description for an image named "${filename}". Focus on visual elements for search.`;
  const description = await generateText(prompt);
  
  if (description.includes("Failed to get a response")) {
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
    return `A standard image titled: ${nameWithoutExt.replace(/[_-]/g, ' ')}.`;
  }
  return description;
}

export async function generateSearchQuery(userInput: string): Promise<string> {
  const prompt = `Optimize this image search query: "${userInput}". Make it more descriptive with visual keywords.`;
  const optimizedQuery = await generateText(prompt);
  return optimizedQuery.includes("Failed to get a response") ? userInput : optimizedQuery;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const extractor = await EmbeddingPipeline.getInstance();
    const output = await extractor(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
  } catch (error) {
    console.error("Error generating embedding:", error);
    return new Array(768).fill(0);
  }
}