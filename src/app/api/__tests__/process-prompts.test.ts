import { NextRequest } from 'next/server';
import { GET, POST } from '../process-prompts/route';
import { processScheduledPrompts } from '../../lib/services/schedulerService';

// Mock the dependencies
jest.mock('../../../utils/schedulerService');

describe('Process Prompts API', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    
    // Mock the environment variables
    process.env.SCHEDULER_API_KEY = 'test-api-key';
  });

  describe('GET handler', () => {
    it('should process scheduled prompts', async () => {
      // Mock the dependencies
      (processScheduledPrompts as jest.Mock).mockResolvedValue({
        processedCount: 2,
        errors: []
      });

      // Create a mock request
      const request = new NextRequest('http://localhost:3000/api/process-prompts', {
        headers: {
          'x-api-key': 'test-api-key'
        }
      });

      const response = await GET(request);
      const data = await response.json();

      // Check that processScheduledPrompts was called
      expect(processScheduledPrompts).toHaveBeenCalled();

      // Check the response
      expect(response.status).toBe(200);
      expect(data).toEqual({
        processedCount: 2,
        errors: []
      });
    });

    it('should return 401 if API key is invalid', async () => {
      // Create a mock request with an invalid API key
      const request = new NextRequest('http://localhost:3000/api/process-prompts', {
        headers: {
          'x-api-key': 'invalid-api-key'
        }
      });

      const response = await GET(request);
      const data = await response.json();

      // Check that processScheduledPrompts was not called
      expect(processScheduledPrompts).not.toHaveBeenCalled();

      // Check the response
      expect(response.status).toBe(401);
      expect(data).toEqual({
        error: 'Unauthorized'
      });
    });

    it('should handle errors', async () => {
      // Mock the dependencies to throw an error
      (processScheduledPrompts as jest.Mock).mockRejectedValue(new Error('Test error'));

      // Create a mock request
      const request = new NextRequest('http://localhost:3000/api/process-prompts', {
        headers: {
          'x-api-key': 'test-api-key'
        }
      });

      const response = await GET(request);
      const data = await response.json();

      // Check the response
      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: 'Test error'
      });
    });
  });

  describe('POST handler', () => {
    it('should process a specific prompt', async () => {
      // Mock the dependencies
      (processScheduledPrompts as jest.Mock).mockResolvedValue({
        processedCount: 1,
        errors: []
      });

      // Create a mock request
      const request = new NextRequest('http://localhost:3000/api/process-prompts', {
        method: 'POST',
        headers: {
          'x-api-key': 'test-api-key',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          promptId: 'test-prompt-id'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      // Check that processScheduledPrompts was called
      expect(processScheduledPrompts).toHaveBeenCalled();

      // Check the response
      expect(response.status).toBe(200);
      expect(data).toEqual({
        processedCount: 1,
        errors: []
      });
    });

    it('should return 400 if promptId is missing', async () => {
      // Create a mock request without a promptId
      const request = new NextRequest('http://localhost:3000/api/process-prompts', {
        method: 'POST',
        headers: {
          'x-api-key': 'test-api-key',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      const response = await POST(request);
      const data = await response.json();

      // Check that processScheduledPrompts was not called
      expect(processScheduledPrompts).not.toHaveBeenCalled();

      // Check the response
      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: 'Prompt ID is required'
      });
    });

    it('should return 401 if API key is invalid', async () => {
      // Create a mock request with an invalid API key
      const request = new NextRequest('http://localhost:3000/api/process-prompts', {
        method: 'POST',
        headers: {
          'x-api-key': 'invalid-api-key',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          promptId: 'test-prompt-id'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      // Check that processScheduledPrompts was not called
      expect(processScheduledPrompts).not.toHaveBeenCalled();

      // Check the response
      expect(response.status).toBe(401);
      expect(data).toEqual({
        error: 'Unauthorized'
      });
    });
  });
});