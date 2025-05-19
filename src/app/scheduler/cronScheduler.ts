"use server";
import { Prompt, getPrompts } from '@/utils/promptStorage';
import { processPromptsOnServer } from '@/utils/serverActions';
import cron, { ScheduledTask } from 'node-cron';

// TODO refactor

const runningJobs = new Map<string, ScheduledTask>();

function createCronSchedule(frequency:string):string {
    switch (frequency.toLowerCase()){
        case 'hourly':
            return '20 * * * *';
        case 'daily':
            return '0 9 * * *';
        case 'weekly':
            return '0 9 * * 1';
        default:
            throw new Error(`Unsupported frequency: ${frequency}`);
    }

}

function processPromptSchedule(prompt:Prompt) {
    const schedule = createCronSchedule(prompt.frequency)
            if (schedule) {
                const job = cron.schedule(schedule, async () => {
                    const now = new Date();
                    const start = new Date(prompt.startTime);
                    const end = new Date(prompt.endTime);
                    if (now >= start && now <= end) {
                        console.log(`Processing prompt: ${prompt.id}`);
                        processPromptsOnServer([prompt])
                    } else {
                        console.log(`Prompt ${prompt.id} is outside the processing window.`);   
                    }
                });
                runningJobs.set(prompt.id, job);
                console.log(`Started job: ${prompt.id}`);
          }
}

export async function initializeSchedules(){
    try {
        const loadedPrompts = await getPrompts();

        loadedPrompts.forEach((prompt) => {
            if (!prompt.isActive) return;
            processPromptSchedule(prompt);
        });

      } catch (error) {
        console.error("Error loading prompts:", error);
      }
}

export async function stopPromptJob(promptId: string) {
    const job = runningJobs.get(promptId);
    if (job) {
      job.stop();
      runningJobs.delete(promptId);
      console.log(`Stopped job: ${promptId}`);
    }
  }

export async function startPromptJob(prompt:Prompt){
    const schedule = createCronSchedule(prompt.frequency);
        if (schedule) {
            cron.schedule(schedule, async () => {
                processPromptSchedule(prompt);
            });
        }
}

export async function triggerSchedulerOnStatusChange(isActive:Boolean,prompt:Prompt) {
    if (isActive) {
        // Start prompt schedule
        console.log("start prompt job")
        startPromptJob(prompt)
    } else {
        // Stop prompt schedule
        console.log("stop prompt job")
        stopPromptJob(prompt.id);
    }
}

