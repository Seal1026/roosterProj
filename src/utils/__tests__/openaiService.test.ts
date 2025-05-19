import { sendToChatGPT } from '../openaiService';

// Mock the fetch function
global.fetch = jest.fn();

describe('OpenAI Service', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    // Mock the environment variable
    process.env.NEXT_PUBLIC_OPENAI_API_KEY = 'test-api-key';
  });

  it('should send a prompt to ChatGPT and return the response', async () => {
    // Mock the fetch response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: 'This is a test response from ChatGPT'
            }
          }
        ]
      })
    });

    const response = await sendToChatGPT('Test prompt');

    // Check that fetch was called with the correct arguments
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.openai.com/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-api-key'
        },
        body: expect.any(String)
      })
    );

    // Parse the request body to check it
    const requestBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(requestBody).toEqual({
      model: 'gpt-4',
      messages: [
        {
          role: 'user',
          content: 'Test prompt'
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    });

    // Check the response
    expect(response).toEqual({
      content: 'This is a test response from ChatGPT'
    });
  });

  it('should handle errors from the ChatGPT API', async () => {
    // Mock the fetch response for an error
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      statusText: 'Bad Request',
      json: async () => ({
        error: {
          message: 'Invalid request'
        }
      })
    });

    const response = await sendToChatGPT('Test prompt');

    // Check the response contains an error
    expect(response).toEqual({
      content: '',
      error: 'OpenAI API error: Invalid request'
    });
  });

  it('should handle missing API key', async () => {
    // Remove the API key
    delete process.env.NEXT_PUBLIC_OPENAI_API_KEY;

    const response = await sendToChatGPT('Test prompt');

    // Check the response contains an error
    expect(response).toEqual({
      content: '',
      error: 'OpenAI API key is not configured'
    });

    // Check that fetch was not called
    expect(global.fetch).not.toHaveBeenCalled();
  });
});