import { NextRequest, NextResponse } from 'next/server';
// --- FIX 1: Import the correct function name ---
import { generateDescriptionFromImage, generateEmbedding } from '@/app/libs/gemini-utils';
import { storeImage } from '@/app/libs/db';
import { addMessage } from '@/app/libs/chat-db';

const MAX_FILE_SIZE_MB = 4;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File | null;

    if (!file) return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    if (!file.type.startsWith('image/')) return NextResponse.json({ error: 'File must be an image.' }, { status: 400 });
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return NextResponse.json({ error: `File is too large. Max size is ${MAX_FILE_SIZE_MB}MB.` }, { status: 400 });
    }

    // These variables are needed for the corrected function call
    const buffer = Buffer.from(await file.arrayBuffer());
    const uniqueFilename = `image_${Date.now()}.${file.name.split('.').pop()}`;
    const imageDataUrl = `data:${file.type};base64,${buffer.toString('base64')}`;

    await addMessage('user', `Uploaded image: "${file.name}"`, { type: 'upload_request', filename: file.name });
    
    // --- FIX 2: Call the new function with the correct arguments (buffer and file type) ---
    console.log(`👁️ Generating visual description for ${file.name}...`);
    const description = await generateDescriptionFromImage(buffer, file.type);
    console.log(`✅ Visual Description: "${description}"`);

    const embedding = await generateEmbedding(description);
    const imageId = await storeImage(uniqueFilename, description, embedding, imageDataUrl);

    await addMessage('assistant', `Image "${uniqueFilename}" uploaded. Description: ${description}`, {
      type: 'upload_success',
      imageId,
      filename: uniqueFilename,
      description,
      imageUrl: imageDataUrl,
    });

    return NextResponse.json({ success: true, imageId, filename: uniqueFilename, description });

  } catch (error) {
    console.error('Upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error.';
    return NextResponse.json({ error: `Upload failed: ${errorMessage}` }, { status: 500 });
  }
}