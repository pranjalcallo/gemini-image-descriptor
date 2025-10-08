import { NextResponse } from 'next/server';
import { testGeminiModels } from '@/app/libs/gemini-utils';

export async function GET() {
  try {
    console.log('Testing available Gemini models...');
    const availableModels = await testGeminiModels();
    
    return NextResponse.json({
      success: true,
      availableModels,
      message: availableModels.length > 0 
        ? `Found ${availableModels.length} working models` 
        : 'No working models found. Check your API key and model names.'
    });
  } catch (error) {
    console.error('Error testing models:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      availableModels: []
    }, { status: 500 });
  }
}