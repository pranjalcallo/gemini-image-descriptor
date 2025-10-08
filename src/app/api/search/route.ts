import { NextRequest, NextResponse } from 'next/server';
import { generateEmbedding, generateSearchQuery } from '@/app/libs/gemini-utils';
import { searchSimilarImages, getAllImages } from '@/app/libs/db';
import { addMessage } from '@/app/libs/chat-db';

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'No search query provided' }, { status: 400 });
    }

    console.log('🔍 Search request for:', query);
    
    // Save search query as user message
    await addMessage('user', `I want to search for: ${query}`, {
      type: 'image_search',
      query: query
    });

    // First, check if we have any images in the database
    const allImages = await getAllImages();
    console.log('📊 Total images in database:', allImages.length);

    if (allImages.length === 0) {
      const noImagesMessage = `🔍 No images found in database for "${query}".\n\nPlease upload some images first using the upload button.`;
      
      await addMessage('assistant', noImagesMessage, {
        type: 'search_no_results',
        query: query,
        resultsCount: 0
      });

      return NextResponse.json({
        success: true,
        originalQuery: query,
        optimizedQuery: query,
        results: [],
        message: 'No images found in database. Please upload some images first.'
      });
    }

    // Generate optimized search query
    console.log('🔄 Optimizing search query...');
    const optimizedQuery = await generateSearchQuery(query);
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

    let responseMessage = '';
    let searchResults: any[] = [];

    if (results.length > 0) {
      responseMessage = `🔍 Found ${results.length} similar images for "${query}":\n\n`;
      results.forEach((img, index) => {
        responseMessage += `${index + 1}. **${img.filename}** (${(img.similarity * 100).toFixed(1)}% match)\n`;
      });
      searchResults = results.map(img => ({
        ...img,
        similarity: (img.similarity * 100).toFixed(1) + '%'
      }));
    } else {
      responseMessage = `🔍 No similar images found for "${query}".\n\nTry:\n• Using different keywords\n• Uploading more images to your collection\n• Being more specific in your description`;
    }

    // Save search results as assistant message
    await addMessage('assistant', responseMessage, {
      type: 'search_results',
      query: query,
      resultsCount: results.length,
      searchResults: searchResults
    });

    return NextResponse.json({
      success: true,
      originalQuery: query,
      optimizedQuery,
      results: searchResults,
      totalImagesInDatabase: allImages.length
    });

  } catch (error) {
    console.error('❌ Search error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to perform search: ' + (error instanceof Error ? error.message : 'Unknown error') 
      },
      { status: 500 }
    );
  }
}