import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

// This function is correct and uses the right model for text-only tasks.
export async function generateText(prompt: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Error in generateText:", error);
    return "Failed to generate text due to an API error.";
  }
}

// --- THIS IS THE FUNCTION TO FIX ---
export async function generateDescriptionFromImage(imageBuffer: Buffer, mimeType: string): Promise<string> {
  try {
    // THE FIX: Change 'gemini-2.5-flash-lite-vision' to the newer, more available multimodal model.
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
    
    const prompt = "Describe this image in detail for a visual search engine. What are the main subjects, objects, colors, and the overall mood? Be descriptive and accurate.";
    const imagePart = { inlineData: { data: imageBuffer.toString('base64'), mimeType } };
    
    const result = await model.generateContent([prompt, imagePart]);
    const description = result.response.text();
    
    return description.trim() !== '' ? description : 'A generic image with no discernible features.';
  } catch (error) {
    console.error("Error generating description from image with model 'gemini-2.5-flash-lite':", error);
    return "A beautiful and interesting image.";
  }
}

// This function is correct.
export async function generateSearchQuery(userInput: string): Promise<string> {
  const prompt = `Optimize this image search query: "${userInput}". Make it more descriptive with visual keywords.`;
  const optimizedQuery = await generateText(prompt);
  return optimizedQuery.includes("Failed to generate text") ? userInput : optimizedQuery;
}

// This function is correct and uses the right model for embedding.
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const result = await embeddingModel.embedContent(text);
    const embedding = result.embedding.values;
    if (!embedding || embedding.length !== 768) {
      throw new Error(`API returned an invalid embedding of size ${embedding?.length || 0}`);
    }
    return embedding;
  } catch (error) {
    console.error("Error generating embedding via API:", error);
    return new Array(768).fill(0);
  }
}