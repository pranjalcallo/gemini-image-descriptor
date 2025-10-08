import { NextRequest, NextResponse } from 'next/server';
import { generateEmbedding, generateSearchQuery } from '@/app/libs/gemini-utils';
import { searchSimilarImages, getAllImages } from '@/app/libs/db';
import { addMessage } from '@/app/libs/chat-db';

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    console.log('💬 New chat message:', message);

    // Save user message to database
    await addMessage('user', message, {
      type: 'message'
    });

    // First, check if we have any images in the database
    const allImages = await getAllImages();
    console.log('📊 Total images in database:', allImages.length);

    let responseContent = '';
    let searchResults: any[] = [];

    if (allImages.length === 0) {
      // No images in database
      responseContent = `🔍 I understand you're looking for: "${message}"\n\nBut there are no images in the database yet. Please upload some images first using the upload button above!`;
    } else {
      // We have images, perform search
      console.log('🔄 Optimizing search query...');
      const optimizedQuery = await generateSearchQuery(message);
      console.log('✅ Optimized query:', optimizedQuery);

      // Generate embedding for search query
      console.log('🔄 Generating search embedding...');
      const queryEmbedding = await generateEmbedding(optimizedQuery);
      console.log('✅ Search embedding generated, dimensions:', queryEmbedding.length);

      // Validate embedding before search
      if (!Array.isArray(queryEmbedding)) {
        throw new Error('Generated embedding is not an array');
      }

      // Search for similar images
      console.log('🔄 Performing vector similarity search...');
      const results = await searchSimilarImages(queryEmbedding, 5);
      console.log('✅ Search completed, found:', results.length, 'results');

      searchResults = results.map(img => ({
        ...img,
        similarity: (img.similarity * 100).toFixed(1) + '%'
      }));

      if (results.length > 0) {
        responseContent = `🔍 I found ${results.length} similar images for "${message}":\n\n`;
        results.forEach((img, index) => {
          responseContent += `${index + 1}. **${img.filename}** (${(img.similarity * 100).toFixed(1)}% match)\n`;
        });
      } else {
        responseContent = `🔍 No similar images found for "${message}".\n\nTry:\n• Using different keywords\n• Uploading more images to your collection\n• Being more specific in your description`;
      }
    }

    // Save assistant response to database
    await addMessage('assistant', responseContent, {
      type: 'search_response',
      originalQuery: message,
      resultsCount: searchResults.length,
      searchResults: searchResults,
      totalImagesInDatabase: allImages.length
    });

    return NextResponse.json({ 
      success: true,
      message: {
        role: 'assistant',
        content: responseContent
      },
      searchResults: searchResults
    });

  } catch (error) {
    console.error('❌ Chat API error:', error);
    
    // Save error message to database
    await addMessage('assistant', 'Sorry, I encountered an error while processing your request. Please try again.', {
      type: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}

// GET endpoint to load all messages
export async function GET() {
  try {
    console.log('📖 Loading all chat messages');
    
    const { getMessages } = await import('@/app/libs/chat-db');
    const messages = await getMessages();
    
    return NextResponse.json({
      success: true,
      messages
    });

  } catch (error) {
    console.error('❌ Error loading messages:', error);
    return NextResponse.json(
      { error: 'Failed to load messages' },
      { status: 500 }
    );
  }
}

// DELETE endpoint to clear all messages
export async function DELETE() {
  try {
    const { clearMessages } = await import('@/app/libs/chat-db');
    await clearMessages();
    
    return NextResponse.json({
      success: true,
      message: 'Chat cleared successfully'
    });

  } catch (error) {
    console.error('❌ Error clearing chat:', error);
    return NextResponse.json(
      { error: 'Failed to clear chat' },
      { status: 500 }
    );
  }
}