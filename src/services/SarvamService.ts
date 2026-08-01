/**
 * Sarvam AI LLM service.
 *
 * Port of analyze_nutrition() from services.py.
 * Sends the constructed prompt directly to Sarvam AI's chat completions
 * REST endpoint using fetch() with an AbortController-based timeout.
 */

const SARVAM_API_URL = 'https://api.sarvam.ai/v1/chat/completions';
const TIMEOUT_MS = 120_000; // 120 seconds
const MAX_TOKENS = 1500;
const TEMPERATURE = 0.3;
const MODEL = 'sarvam-105b';

export interface SarvamResponse {
  analysis?: string;
  error?: string;
}

/**
 * Send a prompt to Sarvam AI and return the analysis text.
 *
 * @param prompt - The full LLM prompt string (constructed by promptBuilder).
 * @param apiKey - The user's Sarvam AI API key (BYOK).
 * @returns An object with either `analysis` text or an `error` message.
 */
export async function analyzeWithSarvam(
  prompt: string,
  apiKey: string,
): Promise<SarvamResponse> {
  // Validate inputs before making the network call
  if (!apiKey || apiKey.trim().length === 0) {
    return {error: 'No API key provided. Please add your Sarvam AI key in Settings.'};
  }

  if (!prompt || prompt.trim().length === 0) {
    return {error: 'Empty prompt — no product data to analyze.'};
  }

  // AbortController for timeout enforcement
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(SARVAM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': apiKey,
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{role: 'user', content: prompt}],
        temperature: TEMPERATURE,
        max_tokens: MAX_TOKENS,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.text();

      // Provide user-friendly error messages for common HTTP status codes
      if (response.status === 401 || response.status === 403) {
        return {error: 'Invalid API key. Please check your Sarvam AI key in Settings.'};
      }
      if (response.status === 429) {
        return {error: 'Rate limit exceeded. Please wait a moment and try again.'};
      }

      return {
        error: `Sarvam API error (${response.status}): ${errorBody}`,
      };
    }

    const json = await response.json();
    const choices = json.choices ?? [];

    if (choices.length === 0) {
      return {error: 'No analysis returned from the model.'};
    }

    const content = choices[0]?.message?.content;
    if (!content || content.trim().length === 0) {
      return {error: 'The model returned an empty response.'};
    }

    return {analysis: content.trim()};
  } catch (e: unknown) {
    clearTimeout(timeoutId);

    if (e instanceof Error && e.name === 'AbortError') {
      return {
        error:
          'Request timed out after 120 seconds. The Sarvam AI server may be experiencing high load. Please try again later.',
      };
    }

    const message = e instanceof Error ? e.message : String(e);
    return {error: `Network error: ${message}`};
  }
}
