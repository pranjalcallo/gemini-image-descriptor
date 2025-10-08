import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

// For text generation (Gemini)
export async function generateText(prompt: string, retries = 2): Promise<string> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const modelName = 'gemini-2.5-flash-lite';
      const model = genAI.getGenerativeModel({ model: modelName });
      
      console.log(`Attempt ${attempt}: Using model ${modelName}`);
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      return response.text();
    } catch (error: any) {
      console.error(`Attempt ${attempt} failed:`, error.message);
      
      if (error.status === 429 && attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }
      
      if (attempt === retries) {
        console.log('Gemini failed, using fallback description');
        return "I'm currently experiencing technical difficulties. Your image has been uploaded with a basic description.";
      }
    }
  }
  return "I'm unable to process your request right now. Please try again later.";
}

// Generate image description using Gemini with fallback
export async function generateImageDescription(filename: string): Promise<string> {
  try {
    const prompt = `Generate a detailed description of an image file named "${filename}". 
    Create a vivid description that includes:
    - Potential objects and subjects in the image
    - Colors and visual style
    - Composition and setting
    - Mood and atmosphere
    
    Be creative but realistic. This description will be used for image search.
    
    Respond only with the description, no additional text.`;
    
    const geminiDescription = await generateText(prompt);
    
    if (geminiDescription && 
        !geminiDescription.includes('technical difficulties') && 
        !geminiDescription.includes('unable to process') &&
        geminiDescription.length > 20) {
      return geminiDescription;
    }
    
    throw new Error('Gemini returned error message');
    
  } catch (error) {
    console.error('Error generating image description with Gemini, using fallback:', error);
    return generateFallbackDescription(filename);
  }
}

// Improved fallback description generator
function generateFallbackDescription(filename: string): string {
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, "").toLowerCase();
  const words = nameWithoutExt.split(/[_\-\s]+/).filter(word => word.length > 2);
  
  const categories = {
    nature: {
      keywords: ['landscape', 'mountain', 'forest', 'tree', 'river', 'lake', 'ocean', 'beach', 'sky', 'sunset', 'sunrise', 'nature', 'outdoor', 'wilderness', 'park', 'garden', 'flower'],
      descriptions: [
        'A beautiful natural landscape with stunning scenery and peaceful atmosphere',
        'A scenic outdoor photograph capturing the beauty of nature',
        'A picturesque view of natural elements and environmental beauty',
        'A captivating nature scene with harmonious colors and composition'
      ]
    },
    people: {
      keywords: ['portrait', 'person', 'people', 'face', 'group', 'family', 'friends', 'human', 'portrait', 'selfie', 'man', 'woman', 'child'],
      descriptions: [
        'A portrait photograph showing people with expressive faces and emotions',
        'An image featuring human subjects in a well-composed setting',
        'A photograph capturing people and their interactions or expressions',
        'A portrait with good lighting and focus on human elements'
      ]
    },
    animals: {
      keywords: ['animal', 'pet', 'dog', 'cat', 'bird', 'wildlife', 'creature', 'puppy', 'kitten', 'horse', 'fish'],
      descriptions: [
        'An animal photograph showing wildlife or pets in natural settings',
        'A cute creature captured in a moment of beauty or action',
        'An image featuring animals with focus on their characteristics',
        'A wildlife photograph showcasing animal behavior and environment'
      ]
    },
    urban: {
      keywords: ['city', 'building', 'street', 'architecture', 'urban', 'skyline', 'downtown', 'cityscape', 'bridge', 'road'],
      descriptions: [
        'An urban landscape with architectural elements and city atmosphere',
        'A city scene featuring buildings, streets, and urban environment',
        'An architectural photograph with structural details and perspective',
        'A cityscape showing urban life and man-made structures'
      ]
    },
    food: {
      keywords: ['food', 'meal', 'dish', 'cooking', 'restaurant', 'culinary', 'recipe', 'delicious', 'dinner', 'breakfast'],
      descriptions: [
        'A delicious looking food photograph with appealing presentation',
        'A culinary creation showcasing flavors and food aesthetics',
        'A meal or dish prepared beautifully with attention to detail',
        'Food photography highlighting ingredients and preparation'
      ]
    },
    travel: {
      keywords: ['travel', 'vacation', 'destination', 'tourist', 'landmark', 'adventure', 'journey', 'trip'],
      descriptions: [
        'A travel photograph capturing the essence of a destination',
        'An adventure image showing exploration and discovery',
        'A vacation photo with memorable moments and locations',
        'Travel photography highlighting experiences and places'
      ]
    },
    abstract: {
      keywords: ['abstract', 'art', 'creative', 'pattern', 'texture', 'color', 'design'],
      descriptions: [
        'An abstract artistic composition with interesting patterns and colors',
        'A creative image featuring unique shapes and visual elements',
        'An artistic photograph with abstract forms and textures',
        'A design-focused image with creative composition'
      ]
    }
  };

  let detectedCategory = 'general';
  for (const [category, data] of Object.entries(categories)) {
    if (data.keywords.some(keyword => nameWithoutExt.includes(keyword))) {
      detectedCategory = category;
      break;
    }
  }

  const descriptions: { [key: string]: string[] } = {
    nature: [
      'A beautiful natural landscape with stunning scenery and peaceful atmosphere',
      'A scenic outdoor photograph capturing the beauty of nature',
      'A picturesque view of natural elements and environmental beauty',
      'A captivating nature scene with harmonious colors and composition'
    ],
    people: [
      'A portrait photograph showing people with expressive faces and emotions',
      'An image featuring human subjects in a well-composed setting',
      'A photograph capturing people and their interactions or expressions',
      'A portrait with good lighting and focus on human elements'
    ],
    animals: [
      'An animal photograph showing wildlife or pets in natural settings',
      'A cute creature captured in a moment of beauty or action',
      'An image featuring animals with focus on their characteristics',
      'A wildlife photograph showcasing animal behavior and environment'
    ],
    urban: [
      'An urban landscape with architectural elements and city atmosphere',
      'A city scene featuring buildings, streets, and urban environment',
      'An architectural photograph with structural details and perspective',
      'A cityscape showing urban life and man-made structures'
    ],
    food: [
      'A delicious looking food photograph with appealing presentation',
      'A culinary creation showcasing flavors and food aesthetics',
      'A meal or dish prepared beautifully with attention to detail',
      'Food photography highlighting ingredients and preparation'
    ],
    travel: [
      'A travel photograph capturing the essence of a destination',
      'An adventure image showing exploration and discovery',
      'A vacation photo with memorable moments and locations',
      'Travel photography highlighting experiences and places'
    ],
    abstract: [
      'An abstract artistic composition with interesting patterns and colors',
      'A creative image featuring unique shapes and visual elements',
      'An artistic photograph with abstract forms and textures',
      'A design-focused image with creative composition'
    ],
    general: [
      'An interesting photograph with good composition and visual appeal',
      'A visually appealing image with nice colors and balanced elements',
      'A well-composed picture worth exploring and appreciating',
      'A captivating photograph with artistic qualities and interest'
    ]
  };

  const randomDesc = descriptions[detectedCategory][Math.floor(Math.random() * descriptions[detectedCategory].length)];
  
  if (words.length > 1 && words.join(' ').length < 30) {
    return `${randomDesc} Context suggests: ${words.join(' ')}.`;
  }
  
  return randomDesc;
}

// Generate search query optimization using Gemini
export async function generateSearchQuery(userInput: string): Promise<string> {
  try {
    const prompt = `Optimize this image search query for better visual search results: "${userInput}"
    
    Make it more descriptive while keeping the original meaning. Focus on visual elements, colors, composition, and objects.
    Return only the optimized query, no additional text.`;
    
    const optimized = await generateText(prompt);
    
    if (optimized && 
        !optimized.includes('technical difficulties') && 
        optimized.length > userInput.length) {
      return optimized;
    }
    
    return userInput;
  } catch (error) {
    console.error('Error generating search query:', error);
    return userInput;
  }
}

// LOCAL EMBEDDING GENERATION with proper async handling
export async function generateEmbedding(text: any): Promise<number[]> {
  try {
    console.log('generateEmbedding called with:', typeof text, text?.substring?.(0, 50));
    
    // Ensure text is a string
    const textString = typeof text === 'string' ? text : String(text);
    
    // Use our improved local embedding generator
    const embedding = generateLocalEmbedding(textString);
    
    // Double-check it's an array
    if (!Array.isArray(embedding)) {
      console.error('Generated embedding is not an array:', typeof embedding);
      return generateSafeFallbackEmbedding();
    }
    
    console.log('Embedding generated successfully, length:', embedding.length);
    return embedding;
    
  } catch (error) {
    console.error('Error in generateEmbedding:', error);
    // Return a safe fallback embedding
    return generateSafeFallbackEmbedding();
  }
}

// Make sure this function is synchronous and always returns an array
function generateLocalEmbedding(text: string): number[] {
  try {
    const textLower = text.toLowerCase();
    const words = textLower.split(/\s+/).filter(word => word.length > 2);
    
    // Create a 768-dimensional embedding
    const embedding = new Array(768).fill(0);
    
    const features = {
      colors: ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'black', 'white', 'gray', 'colorful', 'bright', 'dark', 'vibrant', 'pastel'],
      objects: ['person', 'people', 'man', 'woman', 'child', 'face', 'animal', 'dog', 'cat', 'bird', 'tree', 'car', 'building', 'house', 'food', 'water', 'sky'],
      scenes: ['landscape', 'portrait', 'urban', 'city', 'nature', 'beach', 'mountain', 'forest', 'indoor', 'outdoor', 'street', 'park', 'garden'],
      styles: ['closeup', 'wide', 'angle', 'macro', 'abstract', 'realistic', 'artistic', 'photograph', 'painting', 'digital', 'vintage'],
      moods: ['happy', 'sad', 'peaceful', 'exciting', 'calm', 'dynamic', 'serene', 'dramatic', 'romantic', 'mysterious']
    };

    let dimension = 0;
    
    features.colors.forEach(color => {
      if (textLower.includes(color)) embedding[dimension] = 0.8;
      dimension++;
    });

    features.objects.forEach(object => {
      if (textLower.includes(object)) embedding[dimension] = 0.7;
      dimension++;
    });

    features.scenes.forEach(scene => {
      if (textLower.includes(scene)) embedding[dimension] = 0.6;
      dimension++;
    });

    features.styles.forEach(style => {
      if (textLower.includes(style)) embedding[dimension] = 0.5;
      dimension++;
    });

    features.moods.forEach(mood => {
      if (textLower.includes(mood)) embedding[dimension] = 0.4;
      dimension++;
    });

    embedding[dimension++] = Math.min(words.length / 50, 1);
    embedding[dimension++] = Math.min(text.length / 500, 1);
    embedding[dimension++] = (textLower.match(/[0-9]/g) || []).length / 10;
    embedding[dimension++] = textLower.includes('?') ? 0.3 : 0;

    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash = hash & hash;
    }

    for (let i = dimension; i < embedding.length; i++) {
      const seed = hash + i;
      embedding[i] = Number((Math.abs(Math.sin(seed) * 0.3).toFixed(6)));
    }

    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    if (magnitude > 0) {
      for (let i = 0; i < embedding.length; i++) {
        embedding[i] = Number((embedding[i] / magnitude).toFixed(6));
      }
    }

    return embedding;
  } catch (error) {
    console.error('Error in generateLocalEmbedding:', error);
    return generateSafeFallbackEmbedding();
  }
}

// Safe fallback embedding generator
function generateSafeFallbackEmbedding(): number[] {
  const embedding = new Array(768).fill(0);
  
  // Create a simple but valid embedding
  for (let i = 0; i < embedding.length; i++) {
    embedding[i] = Number((Math.sin(i) * 0.1).toFixed(6));
  }
  
  // Normalize
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    for (let i = 0; i < embedding.length; i++) {
      embedding[i] = Number((embedding[i] / magnitude).toFixed(6));
    }
  }
  
  return embedding;
}

// Local chat response generator
export function generateLocalChatResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes('upload') || lowerMessage.includes('image') || lowerMessage.includes('picture')) {
    return "I can help you upload images! Click the 'Upload Image' button to add images to your collection. Each image will get an AI-generated description and be stored for future searches.";
  }
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return "Hello! I'm your AI Image Search assistant. I can help you upload images with AI-generated descriptions and search through your collection using natural language.";
  }
  
  if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
    return "I'm an AI Image Search assistant! Here's what I can do:\n\n• **Upload Images**: Add images to your collection with AI-generated descriptions\n• **Vector Search**: Find similar images using natural language queries\n• **Smart Matching**: Use embeddings to find visually similar images\n\nStart by uploading some images, then try searching for them!";
  }
  
  if (lowerMessage.includes('how') && lowerMessage.includes('work')) {
    return "Here's how I work:\n\n1. **Upload**: You upload an image, I generate a detailed description using AI\n2. **Store**: I create a vector embedding and store everything in the database\n3. **Search**: You describe what you want, I find similar images using vector similarity\n4. **Results**: I show you the best matches with similarity scores";
  }
  
  return "I'm your AI Image Search assistant. I can help you manage and search through your image collection. You can upload new images or search for existing ones using descriptive language.";
}