import { NextRequest, NextResponse } from 'next/server';
import { processPromptsOnServer } from '../../lib/services/serverActions';
import { shouldProcessPrompt } from '../../lib/services/schedulerService';
import { getPromptsFromSupabase } from '@/app/lib/storage/promptStorageSupabase';

export async function POST(request: NextRequest) {
  try {
    console.log('POST request received');
    
    // Check for API key if needed
    const apiKey = request.headers.get('x-api-key');
    const configuredApiKey = process.env.SCHEDULER_API_KEY;
    console.log(apiKey)
    console.log(configuredApiKey)

    if (configuredApiKey && apiKey !== configuredApiKey) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get prompt ID from request body
    const body = await request.json();
    const { promptId } = body;
    
    if (!promptId) {
      return NextResponse.json(
        { error: 'Prompt ID is required' },
        { status: 400 }
      );
    }
    
    // Find the prompt in Supabase
    try {
      // Get all prompts from Supabase
      const allPrompts = await getPromptsFromSupabase();
      console.log(`Retrieved ${allPrompts.length} prompts from Supabase`);
      
      const promptToProcess = allPrompts.find(p => p.id === promptId);
      
      if (!promptToProcess) {
        return NextResponse.json(
          { error: `Prompt with ID ${promptId} not found` },
          { status: 404 }
        );
      }
      
      // Process the specific prompt
      const result = await processPromptsOnServer([promptToProcess]);
      
      return NextResponse.json({
        processedCount: result.processedPrompts.length,
        errors: result.errors
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Database error: ' + (dbError instanceof Error ? dbError.message : 'Unknown database error') },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing prompt:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}