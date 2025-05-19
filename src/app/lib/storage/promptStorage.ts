

import { v4 as uuidv4 } from 'uuid';
import { 
  getPromptsFromSupabase, 
  savePromptToSupabase, 
  updatePromptInSupabase, 
  deletePromptFromSupabase, 
  updatePromptLastProcessedInSupabase 
} from './promptStorageSupabase';

// Define the Prompt type
export interface Prompt {
  id: string;
  email: string;
  prompt: string;
  frequency: string;
  startTime: string;
  endTime: string;
  sliderValue: number;
  createdAt: number;
  lastProcessed?: number; // Timestamp of when the prompt was last processed
  isActive: boolean; // Whether the prompt is active (running) or paused
}

// Key for localStorage (for fallback)
const PROMPTS_STORAGE_KEY = 'rooster_prompts';

// Get all prompts - tries Supabase first, falls back to localStorage
export const getPrompts = async (): Promise<Prompt[]> => {
  try {
    // Try to get prompts from Supabase
    const supabasePrompts = await getPromptsFromSupabase();
    return supabasePrompts;
  } catch (error) {
    console.error('Error fetching from Supabase, falling back to localStorage:', error);
    
    // Fall back to localStorage
    if (typeof window === 'undefined') {
      return [];
    }
    
    const storedPrompts = localStorage.getItem(PROMPTS_STORAGE_KEY);
    return storedPrompts ? JSON.parse(storedPrompts) : [];
  }
};

// Get all prompts synchronously from localStorage (for backward compatibility)
export const getPromptsSync = (): Prompt[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  
  const storedPrompts = localStorage.getItem(PROMPTS_STORAGE_KEY);
  return storedPrompts ? JSON.parse(storedPrompts) : [];
};

// Save a new prompt
export const savePrompt = async (promptData: Omit<Prompt, 'id' | 'createdAt'>): Promise<Prompt> => {
  try {
    // Try to save to Supabase
    const savedPrompt = await savePromptToSupabase(promptData);
    
    if (savedPrompt) {
      // Also update localStorage for redundancy
      const prompts = getPromptsSync();
      prompts.push(savedPrompt);
      localStorage.setItem(PROMPTS_STORAGE_KEY, JSON.stringify(prompts));
      
      return savedPrompt;
    }
    
    throw new Error('Failed to save prompt to Supabase');
  } catch (error) {
    console.error('Error saving to Supabase, falling back to localStorage:', error);
    
    // Fall back to localStorage
    const prompts = getPromptsSync();
    
    const newPrompt: Prompt = {
      ...promptData,
      id: uuidv4(),
      createdAt: Date.now(),
    };
    
    prompts.push(newPrompt);
    localStorage.setItem(PROMPTS_STORAGE_KEY, JSON.stringify(prompts));
    
    return newPrompt;
  }
};

// Update an existing prompt
export const updatePrompt = async (id: string, promptData: Omit<Prompt, 'id' | 'createdAt'>): Promise<Prompt | null> => {
  try {
    // Try to update in Supabase
    const updatedPrompt = await updatePromptInSupabase(id, promptData);
    
    if (updatedPrompt) {
      // Also update localStorage for redundancy
      const prompts = getPromptsSync();
      const index = prompts.findIndex(p => p.id === id);
      
      if (index !== -1) {
        prompts[index] = updatedPrompt;
        localStorage.setItem(PROMPTS_STORAGE_KEY, JSON.stringify(prompts));
      }
      
      return updatedPrompt;
    }
    
    throw new Error('Failed to update prompt in Supabase');
  } catch (error) {
    console.error('Error updating in Supabase, falling back to localStorage:', error);
    
    // Fall back to localStorage
    const prompts = getPromptsSync();
    const index = prompts.findIndex(p => p.id === id);
    
    if (index === -1) {
      return null;
    }
    
    const updatedPrompt: Prompt = {
      ...promptData,
      id,
      createdAt: prompts[index].createdAt,
    };
    
    prompts[index] = updatedPrompt;
    localStorage.setItem(PROMPTS_STORAGE_KEY, JSON.stringify(prompts));
    
    return updatedPrompt;
  }
};

// Delete a prompt
export const deletePrompt = async (id: string): Promise<boolean> => {
  try {
    // Try to delete from Supabase
    const success = await deletePromptFromSupabase(id);
    
    if (success) {
      // Also delete from localStorage for redundancy
      const prompts = getPromptsSync();
      const filteredPrompts = prompts.filter(p => p.id !== id);
      localStorage.setItem(PROMPTS_STORAGE_KEY, JSON.stringify(filteredPrompts));
      
      return true;
    }
    
    throw new Error('Failed to delete prompt from Supabase');
  } catch (error) {
    console.error('Error deleting from Supabase, falling back to localStorage:', error);
    
    // Fall back to localStorage
    const prompts = getPromptsSync();
    const filteredPrompts = prompts.filter(p => p.id !== id);
    
    if (filteredPrompts.length === prompts.length) {
      return false;
    }
    
    localStorage.setItem(PROMPTS_STORAGE_KEY, JSON.stringify(filteredPrompts));
    return true;
  }
};

// Update the last processed time for a prompt
export const updatePromptLastProcessed = async (id: string, timestamp: number = Date.now()): Promise<Prompt | null> => {
  try {
    // Try to update in Supabase
    const updatedPrompt = await updatePromptLastProcessedInSupabase(id, timestamp);
    
    if (updatedPrompt) {
      // Also update localStorage for redundancy
      const prompts = getPromptsSync();
      const index = prompts.findIndex(p => p.id === id);
      
      if (index !== -1) {
        prompts[index] = {
          ...prompts[index],
          lastProcessed: timestamp,
        };
        localStorage.setItem(PROMPTS_STORAGE_KEY, JSON.stringify(prompts));
      }
      
      return updatedPrompt;
    }
    
    throw new Error('Failed to update last processed time in Supabase');
  } catch (error) {
    console.error('Error updating last processed time in Supabase, falling back to localStorage:', error);
    
    // Fall back to localStorage
    const prompts = getPromptsSync();
    const index = prompts.findIndex(p => p.id === id);
    
    if (index === -1) {
      return null;
    }
    
    prompts[index] = {
      ...prompts[index],
      lastProcessed: timestamp,
    };
    
    localStorage.setItem(PROMPTS_STORAGE_KEY, JSON.stringify(prompts));
    
    return prompts[index];
  }
};
// Toggle prompt active status
export const togglePromptActiveStatus = async (id: string, isActive: boolean): Promise<Prompt | null> => {
  try {
    // Try to update in Supabase
    const { togglePromptActiveStatus } = await import('./promptStorageSupabase');
    const updatedPrompt = await togglePromptActiveStatus(id, isActive);
    
    if (updatedPrompt) {
      // Also update localStorage for redundancy
      const prompts = getPromptsSync();
      const index = prompts.findIndex(p => p.id === id);
      
      if (index !== -1) {
        prompts[index] = {
          ...prompts[index],
          isActive,
        };
        localStorage.setItem(PROMPTS_STORAGE_KEY, JSON.stringify(prompts));
      }
      
      return updatedPrompt;
    }
    
    throw new Error('Failed to toggle prompt active status in Supabase');
  } catch (error) {
    console.error('Error toggling active status in Supabase, falling back to localStorage:', error);
    
    // Fall back to localStorage
    const prompts = getPromptsSync();
    const index = prompts.findIndex(p => p.id === id);
    
    if (index === -1) {
      return null;
    }
    
    prompts[index] = {
      ...prompts[index],
      isActive,
    };
    
    localStorage.setItem(PROMPTS_STORAGE_KEY, JSON.stringify(prompts));
    
    return prompts[index];
  }
};