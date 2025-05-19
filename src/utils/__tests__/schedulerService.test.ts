import { processPrompt, processScheduledPrompts } from '../schedulerService';
import { getPrompts, updatePromptLastProcessed } from '../promptStorage';
import { sendToChatGPT } from '../openaiService';
import { sendEmail } from '../emailService';

// Mock the dependencies
jest.mock('../promptStorage');
jest.mock('../openaiService');
jest.mock('../emailService');

describe('Scheduler Service', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('processPrompt', () => {
    it('should process a prompt successfully', async () => {
      // Mock the dependencies
      (sendToChatGPT as jest.Mock).mockResolvedValue({
        content: 'This is a test response from ChatGPT'
      });
      
      (sendEmail as jest.Mock).mockResolvedValue({
        success: true
      });
      
      (updatePromptLastProcessed as jest.Mock).mockReturnValue({
        id: 'test-id',
        lastProcessed: Date.now()
      });

      const prompt = {
        id: 'test-id',
        email: 'test@example.com',
        prompt: 'Test prompt',
        frequency: 'daily',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        sliderValue: 0,
        createdAt: Date.now()
      };

      const result = await processPrompt(prompt);

      // Check that the dependencies were called with the correct arguments
      expect(sendToChatGPT).toHaveBeenCalledWith('Test prompt');
      
      expect(sendEmail).toHaveBeenCalledWith({
        to: 'test@example.com',
        subject: 'Your Rooster Report: Test prompt...',
        html: expect.stringContaining('This is a test response from ChatGPT')
      });
      
      expect(updatePromptLastProcessed).toHaveBeenCalledWith('test-id');

      // Check the result
      expect(result).toBe(true);
    });

    it('should handle errors from ChatGPT API', async () => {
      // Mock the dependencies
      (sendToChatGPT as jest.Mock).mockResolvedValue({
        content: '',
        error: 'API error'
      });

      const prompt = {
        id: 'test-id',
        email: 'test@example.com',
        prompt: 'Test prompt',
        frequency: 'daily',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        sliderValue: 0,
        createdAt: Date.now()
      };

      const result = await processPrompt(prompt);

      // Check that sendEmail was not called
      expect(sendEmail).not.toHaveBeenCalled();
      
      // Check that updatePromptLastProcessed was not called
      expect(updatePromptLastProcessed).not.toHaveBeenCalled();

      // Check the result
      expect(result).toBe(false);
    });

    it('should handle errors from email service', async () => {
      // Mock the dependencies
      (sendToChatGPT as jest.Mock).mockResolvedValue({
        content: 'This is a test response from ChatGPT'
      });
      
      (sendEmail as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Email error'
      });

      const prompt = {
        id: 'test-id',
        email: 'test@example.com',
        prompt: 'Test prompt',
        frequency: 'daily',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        sliderValue: 0,
        createdAt: Date.now()
      };

      const result = await processPrompt(prompt);

      // Check that updatePromptLastProcessed was not called
      expect(updatePromptLastProcessed).not.toHaveBeenCalled();

      // Check the result
      expect(result).toBe(false);
    });
  });

  describe('processScheduledPrompts', () => {
    it('should process scheduled prompts', async () => {
      // Create test prompts
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const prompts = [
        {
          id: 'prompt-1',
          email: 'test1@example.com',
          prompt: 'Test prompt 1',
          frequency: 'daily',
          startTime: new Date(now.setHours(0, 0, 0, 0)).toISOString(),
          endTime: new Date(now.setHours(23, 59, 59, 999)).toISOString(),
          sliderValue: 0,
          createdAt: Date.now(),
          lastProcessed: yesterday.getTime()
        },
        {
          id: 'prompt-2',
          email: 'test2@example.com',
          prompt: 'Test prompt 2',
          frequency: 'weekly',
          startTime: new Date(now.setHours(0, 0, 0, 0)).toISOString(),
          endTime: new Date(now.setHours(23, 59, 59, 999)).toISOString(),
          sliderValue: 0,
          createdAt: Date.now(),
          lastProcessed: Date.now() // Processed today, should not be processed again
        }
      ];
      
      // Mock the dependencies
      (getPrompts as jest.Mock).mockReturnValue(prompts);
      
      // Mock processPrompt to succeed for the first prompt
      jest.spyOn(global, 'processPrompt' as any).mockImplementation((prompt) => {
        return Promise.resolve(prompt.id === 'prompt-1');
      });

      const result = await processScheduledPrompts();

      // Check that getPrompts was called
      expect(getPrompts).toHaveBeenCalled();
      
      // Check the result
      expect(result).toEqual({
        processedCount: 1,
        errors: [
          {
            promptId: 'prompt-2',
            error: 'Failed to process prompt'
          }
        ]
      });
    });
  });
});