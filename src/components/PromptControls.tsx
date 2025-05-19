"use client";

import { useState } from 'react';
import { Prompt, togglePromptActiveStatus } from '@/utils/promptStorage';
import { processPrompt } from '@/utils/schedulerService';
import { triggerSchedulerOnStatusChange } from '@/app/scheduler/cronScheduler';

interface PromptControlsProps {
  prompt: Prompt;
  onStatusChange?: (prompt: Prompt) => void;
}

export default function PromptControls({ prompt, onStatusChange }: PromptControlsProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  // Handle manual processing of a prompt
  const handleProcess = async () => {
    setIsProcessing(true);
    setStatus('processing');
    
    try {
      const success = await processPrompt(prompt);
      setStatus(success ? 'success' : 'error');
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setStatus('idle');
      }, 3000);
    } catch (error) {
      console.error('Error processing prompt:', error);
      setStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Toggle active status (resume/stop)
  const handleToggleActive = async () => {
    try {
      const newStatus = !prompt.isActive;
      const updatedPrompt = await togglePromptActiveStatus(prompt.id, newStatus);
      
      if (updatedPrompt && onStatusChange) {
        onStatusChange(updatedPrompt);
      }

      await triggerSchedulerOnStatusChange(newStatus,updatedPrompt as Prompt)
    } catch (error) {
      console.error('Error toggling prompt status:', error);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Resume/Stop button */}
      <button
        onClick={handleToggleActive}
        disabled={isProcessing}
        className={`px-3 py-1 rounded text-sm ${
          prompt.isActive
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-green-500 hover:bg-green-600 text-white'
        }`}
      >
        {prompt.isActive ? 'Stop' : 'Resume'}
      </button>
      
      {/* Process Now button */}
      <button
        onClick={handleProcess}
        disabled={isProcessing}
        className={`px-3 py-1 rounded text-sm ${
          isProcessing
            ? 'bg-gray-400 text-white'
            : status === 'success'
            ? 'bg-green-500 text-white'
            : status === 'error'
            ? 'bg-red-500 text-white'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        {isProcessing
          ? 'Processing...'
          : status === 'success'
          ? 'Success!'
          : status === 'error'
          ? 'Failed'
          : 'Process Now'}
      </button>
      
      {/* Status indicator */}
      {prompt.isActive && (
        <span className="flex items-center">
          <span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>
          <span className="text-xs text-gray-600">Running</span>
        </span>
      )}
    </div>
  );
}