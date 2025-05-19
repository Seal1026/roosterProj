"use client";

import { useState, useEffect } from "react";
import { getPrompts, deletePrompt, Prompt } from "../../app/lib/storage/promptStorage";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PromptControls from "@/components/PromptControls";
import ProcessAllPromptsButton from "@/components/ProcessAllPromptsButton";

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const router = useRouter();

  

  // Load prompts from supabase
  useEffect(() => {
    const loadPrompts = async () => {
      try {
        const loadedPrompts = await getPrompts();
        setPrompts(loadedPrompts);
      } catch (error) {
        console.error("Error loading prompts:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadPrompts();
  }, []);

  // Handle prompt deletion
  const handleDelete = async (id: string) => {
    try {
      await deletePrompt(id);
      setPrompts(prompts.filter(p => p.id !== id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting prompt:", error);
    }
  };

  // Handle prompt status change
  const handlePromptStatusChange = (updatedPrompt: Prompt) => {
    setPrompts(prompts.map(p => 
      p.id === updatedPrompt.id ? updatedPrompt : p
    ));
  };

  // Format date for display
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };
  
  // Format datetime for display
  const formatDateTime = (datetimeStr: string) => {
    if (!datetimeStr) return '';
    
    try {
      // Check if it's already in datetime format
      if (datetimeStr.includes('T')) {
        const date = new Date(datetimeStr);
        return date.toLocaleString();
      } else {
        // It's just a time string
        return datetimeStr;
      }
    } catch (error) {
      console.error("Error formatting datetime:", error);
      return datetimeStr;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Prompts</h1>
        <div className="flex space-x-2">
          <ProcessAllPromptsButton className="mr-2" />
          <Link 
            href="/"
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Create New Prompt
          </Link>
        </div>
      </div>

      {isLoading ? (
        <p className="text-center py-8">Loading your prompts...</p>
      ) : prompts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">You don't have any prompts yet.</p>
          <Link 
            href="/"
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Create Your First Prompt
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
            {
            
            prompts.map((prompt) => (
            <div 
              key={prompt.id} 
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold mb-2 line-clamp-1">
                    {prompt.prompt}
                  </h2>
                  <p className="text-sm text-gray-500 mb-4">
                    Created on {formatDate(prompt.createdAt)}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => router.push(`/prompts/edit/${prompt.id}`)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(prompt.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Schedule:</p>
                  <p className="text-sm text-gray-600">
                    {prompt.frequency.charAt(0).toUpperCase() + prompt.frequency.slice(1)}, 
                    {formatDateTime(prompt.startTime)} - {formatDateTime(prompt.endTime)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Email:</p>
                  <p className="text-sm text-gray-600">{prompt.email}</p>
                </div>
              </div>
              
              <div className="mt-4 border-t pt-4">
                <PromptControls 
                  prompt={prompt} 
                  onStatusChange={handlePromptStatusChange} 
                />
              </div>

              {deleteConfirm === prompt.id && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-700 mb-2">
                    Are you sure you want to delete this prompt?
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDelete(prompt.id)}
                      className="bg-red-600 text-white py-1 px-3 rounded-md text-sm hover:bg-red-700"
                    >
                      Yes, Delete
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="bg-gray-200 text-gray-800 py-1 px-3 rounded-md text-sm hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          
        </div>
      )}
    </div>
  );
}