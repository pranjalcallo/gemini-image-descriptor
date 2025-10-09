import { NextRequest, NextResponse } from 'next/server';
import { generateImageDescription, generateEmbedding } from '@/app/libs/gemini-utils';
import { storeImage } from '@/app/libs/db';
import { addMessage } from '@/app/libs/chat-db';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Check file size (limit to 2MB for data URLs)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Please upload an image smaller than 2MB.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const uniqueFilename = `image_${timestamp}.${fileExtension}`;

    // Create data URL for preview (works on Render)
    const imageDataUrl = `data:${file.type};base64,${buffer.toString('base64')}`;
    
    // Save upload event as user message
    await addMessage('user', `I've uploaded an image: "${file.name}"`, {
      type: 'image_upload',
      filename: file.name,
      originalFilename: file.name,
      imageUrl: imageDataUrl,
      preview: true,
      fileSize: file.size
    });

    // Generate image description using AI
    console.log('🔄 Generating AI description for:', file.name);
    const description = await generateImageDescription(file.name);
    console.log('✅ AI Description:', description);

    // Generate embedding for similarity search
    console.log('🔄 Generating embedding vector...');
    const embedding = await generateEmbedding(description);
    console.log('✅ Embedding generated, dimensions:', embedding.length);

    // Store in database with data URL
    console.log('🔄 Storing in database...');
    const imageId = await storeImage(uniqueFilename, description, embedding, imageDataUrl);
    console.log('✅ Image stored in database with ID:', imageId);

    // Save upload success as assistant message
    const successMessage = `✅ Image uploaded successfully!\n\n**Filename:** ${uniqueFilename}\n**Description:** ${description}\n\nYou can now search for this image by typing descriptions in the chat.`;
    
    await addMessage('assistant', successMessage, {
      type: 'upload_success',
      imageId,
      filename: uniqueFilename,
      description,
      imageUrl: imageDataUrl,
      preview: true
    });

    return NextResponse.json({
      success: true,
      imageId,
      filename: uniqueFilename,
      originalFilename: file.name,
      description,
      imageUrl: imageDataUrl,
      message: 'Image uploaded and processed successfully'
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process image upload: ' + (error instanceof Error ? error.message : 'Unknown error') 
      },
      { status: 500 }
    );
  }
}