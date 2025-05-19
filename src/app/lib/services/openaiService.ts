
/**
 * Service for interacting with the OpenAI ChatGPT API
 */

// Define the response type from OpenAI
export interface modelResponse {
  content: string;
  error?: string;
}

/**
 * Sends a prompt to the ChatGPT API and returns the response
 * 
 * @param prompt The prompt to send to ChatGPT
 * @returns The response from ChatGPT
 */

export async function sendToGeminiModel(prompt:string):Promise<modelResponse> {
  try {const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('Gemini API key is not configured');
  }

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents:  [{
            "parts":[{"text": prompt}]
            }], 
    })
  });


  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Gemini API error: ${errorData || response.statusText}`);
  }

  const data = await response.json();
  // console.log(data.candidates[0].content)
  return {
    content: data.candidates[0].content.parts[0].text //todo REFACTOR
  };} catch (error) {
    console.error('Error calling Gemini API:', error);
    return {
      content: '',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }

}

export async function sendToChatGPT(prompt: string): Promise<modelResponse> {
  try {
    // Get API key from environment variable or other secure storage
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // Or another model as needed
        
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content
    };
  } catch (error) {
    console.error('Error calling ChatGPT API:', error);
    return {
      content: '',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}