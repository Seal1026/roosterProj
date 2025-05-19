"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { getPrompts, updatePrompt, Prompt } from "../../../../utils/promptStorage";
import Link from "next/link";


type Props = {
  params: Promise<{ id: string }>;
};

export default function EditPromptPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [prompt, setPrompt] = useState("");
  const [frequency, setFrequency] = useState("daily");
  
  // Get current date in YYYY-MM-DDThh:mm format for datetime-local input
  const getCurrentDateTime = (hours: number, minutes: number) => {
    const now = new Date();
    now.setHours(hours, minutes, 0, 0);
    return now.toISOString().slice(0, 16);
  };
  
  const [startTime, setStartTime] = useState(getCurrentDateTime(9, 0));
  const [endTime, setEndTime] = useState(getCurrentDateTime(17, 0));
  const [sliderValue, setSliderValue] = useState(50);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  // Load prompt data
  useEffect(
    ()=> {
      const loadPrompt = async () => {
        try {
          const prompts = await getPrompts();
          const promptToEdit = prompts.find(p => p.id === id);
          
          if (!promptToEdit) {
            setNotFound(true);
            return;
          }
          
          setEmail(promptToEdit.email);
          setPrompt(promptToEdit.prompt);
          setFrequency(promptToEdit.frequency);
          
          // Handle different formats of startTime and endTime
          if (promptToEdit.startTime.includes('T')) {
            // Already in datetime-local format
            setStartTime(promptToEdit.startTime);
          } else {
            // Convert from time-only format to datetime-local
            const today = new Date().toISOString().split('T')[0];
            setStartTime(`${today}T${promptToEdit.startTime}`);
          }
          
          if (promptToEdit.endTime.includes('T')) {
            // Already in datetime-local format
            setEndTime(promptToEdit.endTime);
          } else {
            // Convert from time-only format to datetime-local
            const today = new Date().toISOString().split('T')[0];
            setEndTime(`${today}T${promptToEdit.endTime}`);
          }
          
          setSliderValue(promptToEdit.sliderValue);
        } catch (error) {
          console.error("Error loading prompt:", error);
          setError("Failed to load prompt data");
        } finally {
          setIsLoading(false);
        }
      }

      loadPrompt();
    }
    , [id]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    
    try {
      updatePrompt(id, {
        email,
        prompt,
        frequency,
        startTime,
        endTime,
        sliderValue,
        isActive: false
      });
      
      router.push("/prompts");
    } catch (error) {
      console.error("Error updating prompt:", error);
      setError("Failed to update prompt. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (notFound) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Prompt Not Found</h1>
        <p className="mb-6">The prompt you're trying to edit doesn't exist.</p>
        <Link 
          href="/prompts"
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Back to Prompts
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 text-center">
        <p>Loading prompt data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Edit Prompt</h1>
          <Link 
            href="/prompts"
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Prompts
          </Link>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Prompt Input */}
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">
              Your Prompt
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt here..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Schedule Settings */}
          <div>
            <h3 className="text-md font-medium text-gray-700 mb-3">Schedule Settings</h3>
            
            {/* Frequency Options */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Frequency</p>
              <div className="flex flex-wrap gap-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="frequency"
                    value="hourly"
                    checked={frequency === "hourly"}
                    onChange={() => setFrequency("hourly")}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">Hourly</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="frequency"
                    value="daily"
                    checked={frequency === "daily"}
                    onChange={() => setFrequency("daily")}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">Daily</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="frequency"
                    value="bi-daily"
                    checked={frequency === "bi-daily"}
                    onChange={() => setFrequency("bi-daily")}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">Bi-Daily</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="frequency"
                    value="weekly"
                    checked={frequency === "weekly"}
                    onChange={() => setFrequency("weekly")}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">Weekly</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="frequency"
                    value="monthly"
                    checked={frequency === "monthly"}
                    onChange={() => setFrequency("monthly")}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">Monthly</span>
                </label>
              </div>
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  id="startTime"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  id="endTime"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          {/* Submit Button */}
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isSaving}
              className={`flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isSaving ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <Link 
              href="/prompts"
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}