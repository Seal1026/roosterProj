import { Prompt, getPrompts, updatePromptLastProcessed } from './promptStorage';
import { processPromptsOnServer } from './serverActions';

/**
 * Interface for scheduler result
 */
export interface SchedulerResult {
  processedCount: number;
  errors: Array<{
    promptId: string;
    error: string;
  }>;
}

/**
 * Checks if a prompt should be processed based on its schedule
 * 
 * @param prompt The prompt to check
 * @returns Whether the prompt should be processed
 */
export function shouldProcessPrompt(prompt: Prompt): boolean {
  // First check if the prompt is active
  if (prompt.isActive === false) {
    return false;
  }
  
  const now = new Date();
  const startTime = new Date(prompt.startTime);
  const endTime = new Date(prompt.endTime);
  
  // Check if current time is within the scheduled time range
  if (now < startTime || now > endTime) {
    return false;
  }
  
  // Get the last processed time from somewhere (could be stored in the prompt object)
  // For now, we'll assume it's not processed yet
  const lastProcessed = prompt.lastProcessed ? new Date(prompt.lastProcessed) : null;
  
  // Check based on frequency
  switch (prompt.frequency) {
    case 'hourly':
      // Process if not processed in the last hour
      return !lastProcessed || (now.getTime() - lastProcessed.getTime() >= 60 * 60 * 1000);
    
    case 'daily':
      // Process if not processed today
      return !lastProcessed || 
        (now.getDate() !== lastProcessed.getDate() || 
         now.getMonth() !== lastProcessed.getMonth() || 
         now.getFullYear() !== lastProcessed.getFullYear());
    
    case 'bi-daily':
      // Process if not processed in the last 2 days
      return !lastProcessed || (now.getTime() - lastProcessed.getTime() >= 2 * 24 * 60 * 60 * 1000);
    
    case 'weekly':
      // Process if not processed in the last 7 days
      return !lastProcessed || (now.getTime() - lastProcessed.getTime() >= 7 * 24 * 60 * 60 * 1000);
    
    case 'monthly':
      // Process if not processed this month
      return !lastProcessed || 
        (now.getMonth() !== lastProcessed.getMonth() || 
         now.getFullYear() !== lastProcessed.getFullYear());
    
    default:
      return false;
  }
}

/**
 * Process a single prompt by sending it to the server
 * 
 * @param prompt The prompt to process
 * @returns Whether the processing was successful
 */
export async function processPrompt(prompt: Prompt): Promise<boolean> {
  try {
    // Process the prompt on the server
    const result = await processPromptsOnServer([prompt]);
    
    // Update the last processed time if successful
    if (result.processedPrompts.includes(prompt.id)) {
      await updatePromptLastProcessed(prompt.id);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing prompt ${prompt.id}:`, error);
    return false;
  }
}

/**
 * Processes all prompts that are due according to their schedules
 * 
 * @returns The result of the processing
 */
export async function processScheduledPrompts(): Promise<SchedulerResult> {
  const result: SchedulerResult = {
    processedCount: 0,
    errors: [],
  };
  
  try {
    // Get all prompts from database
    const prompts = await getPrompts();
    
    // Filter prompts that should be processed
    const promptsToProcess = prompts.filter(shouldProcessPrompt);
    
    if (promptsToProcess.length === 0) {
      return result;
    }
    
    // Process the prompts on the server
    const serverResult = await processPromptsOnServer(promptsToProcess);
    
    // Update the last processed time for successfully processed prompts
    for (const promptId of serverResult.processedPrompts) {
      await updatePromptLastProcessed(promptId);
    }
    
    // Return the result
    return {
      processedCount: serverResult.processedPrompts.length,
      errors: serverResult.errors.map(error => ({
        promptId: error.promptId,
        error: error.message
      }))
    };
  } catch (error) {
    console.error('Error processing scheduled prompts:', error);
    return result;
  }
}
