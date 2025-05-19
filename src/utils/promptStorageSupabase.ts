import { supabase } from './supabase';
import { Prompt } from './promptStorage';
import { v4 as uuidv4 } from 'uuid';

// Convert Prompt to Supabase format
const toSupabaseFormat = (prompt: Prompt) => {
  return {
    id: prompt.id,
    email: prompt.email,
    prompt: prompt.prompt,
    frequency: prompt.frequency,
    start_time: prompt.startTime,
    end_time: prompt.endTime,
    slider_value: prompt.sliderValue,
    created_at: new Date(prompt.createdAt).toISOString(),
    last_processed: prompt.lastProcessed ? new Date(prompt.lastProcessed).toISOString() : null,
    is_active: prompt.isActive,
  };
};

// Convert from Supabase format to Prompt
const fromSupabaseFormat = (data: any): Prompt => {
  return {
    id: data.id,
    email: data.email,
    prompt: data.prompt,
    frequency: data.frequency,
    startTime: data.start_time,
    endTime: data.end_time,
    sliderValue: data.slider_value,
    createdAt: new Date(data.created_at).getTime(),
    lastProcessed: data.last_processed ? new Date(data.last_processed).getTime() : undefined,
    isActive: data.is_active !== undefined ? data.is_active : true, // Default to true if not specified
  };
};

// Get all prompts from Supabase
export const getPromptsFromSupabase = async (): Promise<Prompt[]> => {
  const { data, error } = await supabase
    .from('prompts')
    .select('*');
  
  if (error) {
    console.error('Error fetching prompts from Supabase:', error);
    return [];
  }
  
  return data.map(fromSupabaseFormat);
};

// Save a new prompt to Supabase
export const savePromptToSupabase = async (promptData: Omit<Prompt, 'id' | 'createdAt'>): Promise<Prompt | null> => {
  const newPrompt: Prompt = {
    ...promptData,
    id: uuidv4(),
    createdAt: Date.now(),
    isActive: promptData.isActive !== undefined ? promptData.isActive : true, // Default to active
  };
  
  const { data, error } = await supabase
    .from('prompts')
    .insert(toSupabaseFormat(newPrompt))
    .select()
    .single();
  
  if (error) {
    console.error('Error saving prompt to Supabase:', error);
    return null;
  }
  
  return fromSupabaseFormat(data);
};

// Update an existing prompt in Supabase
export const updatePromptInSupabase = async (id: string, promptData: Omit<Prompt, 'id' | 'createdAt'>): Promise<Prompt | null> => {
  // First get the existing prompt to preserve createdAt
  const { data: existingData, error: fetchError } = await supabase
    .from('prompts')
    .select('*')
    .eq('id', id)
    .single();
  
  if (fetchError) {
    console.error('Error fetching prompt for update:', fetchError);
    return null;
  }
  
  const updatedPrompt: Prompt = {
    ...promptData,
    id,
    createdAt: new Date(existingData.created_at).getTime(),
  };
  
  const { data, error } = await supabase
    .from('prompts')
    .update(toSupabaseFormat(updatedPrompt))
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating prompt in Supabase:', error);
    return null;
  }
  
  return fromSupabaseFormat(data);
};

// Delete a prompt from Supabase
export const deletePromptFromSupabase = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('prompts')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting prompt from Supabase:', error);
    return false;
  }
  
  return true;
};

// Update the last processed time for a prompt in Supabase
export const updatePromptLastProcessedInSupabase = async (id: string, timestamp: number = Date.now()): Promise<Prompt | null> => {
  const { data, error } = await supabase
    .from('prompts')
    .update({
      last_processed: new Date(timestamp).toISOString()
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating last processed time in Supabase:', error);
    return null;
  }
  
  return fromSupabaseFormat(data);
};
// Toggle prompt active status in Supabase
export const togglePromptActiveStatus = async (id: string, isActive: boolean): Promise<Prompt | null> => {
  const { data, error } = await supabase
    .from('prompts')
    .update({
      is_active: isActive
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error toggling prompt active status in Supabase:', error);
    return null;
  }
  
  return fromSupabaseFormat(data);
};