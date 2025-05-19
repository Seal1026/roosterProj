import { NextRequest, NextResponse } from 'next/server';
import { processPromptsOnServer } from '../../lib/services/serverActions';
import { shouldProcessPrompt } from '../../lib/services/schedulerService';
import { getPromptsFromSupabase } from '@/app/lib/storage/promptStorageSupabase';

/**
 * API route to process scheduled prompts
 * This can be called by a cron job or similar to trigger the scheduled operations
 */
export async function GET(request: NextRequest) {
  try {
    // Check for API key if needed
    const apiKey = request.headers.get('x-api-key');
    const configuredApiKey = process.env.SCHEDULER_API_KEY;
    console.log(apiKey)
    console.log(configuredApiKey)
    
    // if (configuredApiKey && apiKey !== configuredApiKey) {
    //   return NextResponse.json(
    //     { error: 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }
    
    // Get all prompts that should be processed
    const allPrompts = await getPromptsFromSupabase();
    console.log(allPrompts)
    const promptsToProcess = allPrompts.filter(shouldProcessPrompt);
    
    // Process the prompts
    const result = await processPromptsOnServer(promptsToProcess);
    console.log(result)
    
    return NextResponse.json({
      processedCount: result.processedPrompts.length,
      errors: result.errors
    });
  } catch (error) {
    console.error('Error processing prompts:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}