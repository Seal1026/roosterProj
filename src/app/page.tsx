"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { savePrompt } from "./lib/storage/promptStorage";
import { useRouter } from "next/navigation";

export default function Home() {
  // State for form inputs
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
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  
  const router = useRouter();


  // Removed commented-out code referencing unused API route


  // Add animation effect when component mounts
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError("");
    
    try {
      // Save the prompt to localStorage
      savePrompt({
        email,
        prompt,
        frequency,
        startTime,
        endTime,
        sliderValue: 0 // Default value since we removed the slider
        ,
        isActive: false
      });
      
      // Reset form
      setEmail("");
      setPrompt("");
      setFrequency("daily");
      setStartTime(getCurrentDateTime(9, 0));
      setEndTime(getCurrentDateTime(17, 0));
      
      // Redirect to prompts page
      router.push("/prompts");
    } catch (error) {
      console.error("Error saving prompt:", error);
      setSaveError("Failed to save your prompt. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`max-w-4xl mx-auto py-8 px-4 transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg shadow-xl p-8 mb-8 backdrop-blur-sm relative overflow-hidden">
        {/* Tech-inspired decorative elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-[var(--primary)] to-transparent opacity-10 rounded-bl-full"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[var(--accent)] to-transparent opacity-10 rounded-tr-full"></div>
        
        <h1 className="text-3xl font-bold mb-8 text-center text-[var(--foreground)] relative">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]">
            Daily Rooster Setup
          </span>
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          {/* Email Input */}
          <div className="group">
            <label htmlFor="email" className="block text-sm font-medium text-[var(--foreground)] mb-2 transition-colors group-focus-within:text-[var(--primary)]">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--foreground)] rounded-md focus:outline-none focus:border-[var(--input-focus)] focus:ring-1 focus:ring-[var(--input-focus)] transition-all"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none opacity-50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--muted)]" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
            </div>
            <p className="mt-2 text-xs text-[var(--muted)]">We'll send your reports to this email address</p>
          </div>

          {/* Prompt Input */}
          <div className="group">
            <label htmlFor="prompt" className="block text-sm font-medium text-[var(--foreground)] mb-2 transition-colors group-focus-within:text-[var(--primary)]">
              Your Prompt
            </label>
            <div className="relative">
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your prompt here..."
                rows={4}
                className="w-full px-4 py-3 bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--foreground)] rounded-md focus:outline-none focus:border-[var(--input-focus)] focus:ring-1 focus:ring-[var(--input-focus)] transition-all"
                required
              />
            </div>
            <p className="mt-2 text-xs text-[var(--muted)]">
              Describe what information you want to receive in your reports
            </p>
          </div>

          {/* Schedule Settings */}
          <div className="bg-[var(--background)] bg-opacity-50 border border-[var(--card-border)] rounded-lg p-6">
            <h3 className="text-md font-medium text-[var(--foreground)] mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[var(--primary)]" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              Schedule Settings
            </h3>
            
            {/* Frequency Options */}
            <div className="mb-6">
              <p className="text-sm font-medium text-[var(--foreground)] mb-3">Frequency</p>
              <div className="flex flex-wrap gap-4">
                {["hourly", "daily", "bi-daily", "weekly", "monthly"].map((option) => (
                  <label key={option} className="relative inline-flex items-center group cursor-pointer">
                    <input
                      type="radio"
                      name="frequency"
                      value={option}
                      checked={frequency === option}
                      onChange={() => setFrequency(option)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 mr-2 rounded-full border-2 flex items-center justify-center transition-colors ${
                      frequency === option 
                        ? 'border-[var(--primary)] bg-[var(--primary)]' 
                        : 'border-[var(--muted)] group-hover:border-[var(--primary)]'
                    }`}>
                      {frequency === option && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                      )}
                    </div>
                    <span className={`text-sm ${
                      frequency === option 
                        ? 'text-[var(--primary)]' 
                        : 'text-[var(--foreground)] group-hover:text-[var(--primary)]'
                    } transition-colors capitalize`}>
                      {option}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label htmlFor="startTime" className="block text-sm font-medium text-[var(--foreground)] mb-2 transition-colors group-focus-within:text-[var(--primary)]">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  id="startTime"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-4 py-3 bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--foreground)] rounded-md focus:outline-none focus:border-[var(--input-focus)] focus:ring-1 focus:ring-[var(--input-focus)] transition-all"
                />
              </div>
              <div className="group">
                <label htmlFor="endTime" className="block text-sm font-medium text-[var(--foreground)] mb-2 transition-colors group-focus-within:text-[var(--primary)]">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  id="endTime"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-4 py-3 bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--foreground)] rounded-md focus:outline-none focus:border-[var(--input-focus)] focus:ring-1 focus:ring-[var(--input-focus)] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            {saveError && (
              <p className="text-red-500 text-sm mb-3">{saveError}</p>
            )}
            <button
              type="submit"
              disabled={isSaving}
              className={`w-full relative overflow-hidden group bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white py-3 px-6 rounded-md transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--background)] ${
                isSaving ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              <span className="relative z-10 flex items-center justify-center">
                {isSaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    Create Schedule
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </>
                )}
              </span>
              <div className="absolute top-0 left-0 w-full h-full bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}