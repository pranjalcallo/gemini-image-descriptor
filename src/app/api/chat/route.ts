import { NextRequest, NextResponse } from 'next/server';
import { generateEmbedding, generateSearchQuery } from '@/app/libs/gemini-utils';
import { searchSimilarImages, getAllImages } from '@/app/libs/db';
import { addMessage, getMessages, clearMessages } from '@/app/libs/chat-db';

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    if (typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'A valid message is required.' }, { status: 400 });
    }

    await addMessage('user', message);

    const images = await getAllImages();
    if (images.length === 0) {
      const responseContent = "The image database is empty. Please upload some images first.";
      await addMessage('assistant', responseContent);
      return NextResponse.json({ success: true, message: { role: 'assistant', content: responseContent } });
    }

    const optimizedQuery = await generateSearchQuery(message);
    const queryEmbedding = await generateEmbedding(optimizedQuery);
    const searchResults = await searchSimilarImages(queryEmbedding, 5);

    const responseContent = searchResults.length > 0
      ? `Found ${searchResults.length} similar image(s) for "${message}".`
      : `No similar images found for "${message}". Try a different description.`;

    await addMessage('assistant', responseContent, { type: 'search_response', results: searchResults });

    return NextResponse.json({ success: true, searchResults });
  } catch (error) {
    console.error('Chat API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error.';
    await addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
    return NextResponse.json({ error: `Chat failed: ${errorMessage}` }, { status: 500 });
  }
}

export async function GET() {
  try {
    const messages = await getMessages();
    return NextResponse.json({ success: true, messages });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load messages.' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await clearMessages();
    return NextResponse.json({ success: true, message: 'Chat cleared.' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to clear chat.' }, { status: 500 });
  }
}