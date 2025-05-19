"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getPrompts, Prompt } from "../../../app/lib/storage/promptStorage";

export default function ProcessPromptsPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPromptId, setSelectedPromptId] = useState<string>("");
  
  const router = useRouter();
  
  // Load prompts when the component mounts
  useState(() => {
    const asyncGetPrompts = async () => {
      try {
        const loadedPrompts = await getPrompts();
        setPrompts(loadedPrompts);
        
        if (loadedPrompts.length > 0) {
          setSelectedPromptId(loadedPrompts[0].id);
        }
      } catch (error) {
        console.error("Error loading prompts:", error);
        setError("Failed to load prompts");
      }
    }
    asyncGetPrompts();
  });
  
  // Process all scheduled prompts
  const handleProcessAll = async () => {
    setIsProcessing(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await fetch('/api/process-prompts', {
        method: 'GET',
        headers: {
          'x-api-key': 'abc123',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error processing prompts:", error);
      setError(error instanceof Error ? error.message : "Unknown error occurred");
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Process a specific prompt
  const handleProcessSelected = async () => {
    if (!selectedPromptId) {
      setError("Please select a prompt");
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await fetch('/api/process-prompts', {
        method: 'POST',
        headers: {
          'x-api-key': 'abc123',
        },
        body: JSON.stringify({ promptId: selectedPromptId }),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error processing prompt:", error);
      setError(error instanceof Error ? error.message : "Unknown error occurred");
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h1 className="text-2xl font-bold mb-6">Process Prompts</h1>
        
        <div className="mb-6">
          <button
            onClick={() => router.push("/prompts")}
            className="text-blue-600 hover:text-blue-800 mb-4"
          >
            &larr; Back to Prompts
          </button>
          
          <div className="flex flex-col space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-2">Process All Scheduled Prompts</h2>
              <p className="text-sm text-gray-600 mb-2">
                This will process all prompts that are due according to their schedules.
              </p>
              <button
                onClick={handleProcessAll}
                disabled={isProcessing}
                className={`bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors ${
                  isProcessing ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isProcessing ? 'Processing...' : 'Process All Scheduled'}
              </button>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <h2 className="text-lg font-semibold mb-2">Process Specific Prompt</h2>
              <p className="text-sm text-gray-600 mb-2">
                Select a prompt to process immediately, regardless of its schedule.
              </p>
              
              <div className="mb-4">
                <label htmlFor="promptSelect" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Prompt
                </label>
                <select
                  id="promptSelect"
                  value={selectedPromptId}
                  onChange={(e) => setSelectedPromptId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={prompts.length === 0}
                >
                  {prompts.length === 0 ? (
                    <option value="">No prompts available</option>
                  ) : (
                    prompts.map((prompt) => (
                      <option key={prompt.id} value={prompt.id}>
                        {prompt.prompt.substring(0, 50)}...
                      </option>
                    ))
                  )}
                </select>
              </div>
              
              <button
                onClick={handleProcessSelected}
                disabled={isProcessing || prompts.length === 0}
                className={`bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors ${
                  isProcessing || prompts.length === 0 ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isProcessing ? 'Processing...' : 'Process Selected'}
              </button>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {result && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <h3 className="font-semibold text-green-800 mb-2">Result:</h3>
            <pre className="text-sm overflow-auto p-2 bg-white border border-green-100 rounded">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}