"use client";

import { useState } from 'react';
import { processScheduledPrompts } from '@/app/lib/services/schedulerService';

interface ProcessAllPromptsButtonProps {
  className?: string;
}

export default function ProcessAllPromptsButton({ className = '' }: ProcessAllPromptsButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ processedCount: number; errors: any[] } | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleProcessAll = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setResult(null);
    
    try {
      const processingResult = await processScheduledPrompts();
      setResult(processingResult);
      setShowResult(true);
      
      // Hide result after 5 seconds
      setTimeout(() => {
        setShowResult(false);
      }, 5000);
    } catch (error) {
      console.error('Error processing all prompts:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-start">
      <button
        onClick={handleProcessAll}
        disabled={isProcessing}
        className={`px-4 py-2 rounded ${
          isProcessing
            ? 'bg-gray-400 text-white'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        } ${className}`}
      >
        {isProcessing ? 'Processing All Prompts...' : 'Process All Prompts'}
      </button>
      
      {showResult && result && (
        <div className="mt-2 text-sm">
          <p>
            Processed {result.processedCount} prompt{result.processedCount !== 1 ? 's' : ''}
            {result.errors.length > 0 && `, with ${result.errors.length} error${result.errors.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      )}
    </div>
  );
}