"use client";

import { initializeSchedules } from "@/app/lib/services/cronJobService";
import { useEffect } from "react";

export default function InitializeApp() {
  useEffect(() => {
    const init = async () => {
      try {
        // Initialize schedules
        await initializeSchedules();
      } catch (error) {
        console.error('Error during initialization:', error);
      }
    };
    
    init();
  }, []);

  // This component doesn't render anything
  return null;
}