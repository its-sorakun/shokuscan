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
    return { error: 'No API key provided. Please add your Sarvam AI key in Settings.' };
  }

  if (!prompt || prompt.trim().length === 0) {
    return { error: 'Empty prompt — no product data to analyze.' };
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
        messages: [{ role: 'user', content: prompt }],
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
        return { error: 'Invalid API key. Please check your Sarvam AI key in Settings.' };
      }
      if (response.status === 429) {
        return { error: 'Rate limit exceeded. Please wait a moment and try again.' };
      }

      return {
        error: `Sarvam API error (${response.status}): ${errorBody}`,
      };
    }

    const json = await response.json();
    const choices = json.choices ?? [];

    if (choices.length === 0) {
      return { error: 'No analysis returned from the model.' };
    }

    const content = choices[0]?.message?.content;
    if (!content || content.trim().length === 0) {
      return { error: 'The model returned an empty response.' };
    }

    return { analysis: content.trim() };
  } catch (e: unknown) {
    clearTimeout(timeoutId);

    if (e instanceof Error && e.name === 'AbortError') {
      return {
        error:
          'Request timed out after 120 seconds. The Sarvam AI server may be experiencing high load. Please try again later.',
      };
    }

    const message = e instanceof Error ? e.message : String(e);
    return { error: `Network error: ${message}` };
  }
}

import { buildPrompt, buildPhotoPrompt } from '../utils/promptBuilder';

/**
 * Upload an image to Sarvam Document AI API (digitise) for OCR extraction.
 */
export async function digitizeImageWithSarvam(
  imageUri: string,
  apiKey: string,
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout for image upload

  try {
    const formData = new FormData();
    // React Native FormData requires a specific object format for files
    const fileUri = imageUri.startsWith('file://') ? imageUri : `file://${imageUri}`;
    formData.append('file', {
      uri: fileUri,
      name: 'photo.jpg',
      type: 'image/jpeg',
    } as any);

    const startResponse = await fetch('https://api.sarvam.ai/doc-ai/v1/job/digitise', {
      method: 'POST',
      headers: {
        'api-subscription-key': apiKey,
      },
      body: formData,
      signal: controller.signal,
    });

    if (!startResponse.ok) {
      clearTimeout(timeoutId);
      const errorText = await startResponse.text();
      throw new Error(`Vision API error (${startResponse.status}): ${errorText}`);
    }

    const startJson = await startResponse.json();
    const jobId = startJson.job_id;
    if (!jobId) {
      clearTimeout(timeoutId);
      throw new Error('No job_id returned from Sarvam Document AI.');
    }

    // Poll for status
    let isDone = false;
    while (!isDone) {
      if (controller.signal.aborted) {
        throw new Error('AbortError');
      }

      const statusResponse = await fetch(`https://api.sarvam.ai/doc-ai/v1/job/${jobId}/status`, {
        method: 'GET',
        headers: { 'api-subscription-key': apiKey },
        signal: controller.signal,
      });

      if (!statusResponse.ok) {
        clearTimeout(timeoutId);
        throw new Error(`Status API error (${statusResponse.status})`);
      }

      const statusJson = await statusResponse.json();
      const status = statusJson.status;

      if (status === 'completed' || status === 'partially_completed') {
        isDone = true;
      } else if (status === 'failed' || status === 'rejected') {
        clearTimeout(timeoutId);
        throw new Error(`Document processing failed with status: ${status}`);
      } else {
        // Wait 2 seconds before polling again
        await new Promise<void>(resolve => setTimeout(resolve, 2000));
      }
    }

    // Fetch the final results
    const resultsResponse = await fetch(`https://api.sarvam.ai/doc-ai/v1/job/${jobId}/results`, {
      method: 'GET',
      headers: { 'api-subscription-key': apiKey },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!resultsResponse.ok) {
      throw new Error(`Results API error (${resultsResponse.status})`);
    }

    const resultsJson = await resultsResponse.json();
    // Return the stringified OCR result so it can be passed to the LLM prompt
    return JSON.stringify(resultsJson, null, 2);
  } catch (e: unknown) {
    clearTimeout(timeoutId);
    throw e;
  }
}

/**
 * Capture an image, send it to Sarvam Vision for OCR, and then analyze the extracted text.
 */
export async function analyzePhoto(
  imageUri: string,
  apiKey: string,
): Promise<SarvamResponse> {
  if (!apiKey) {
    return { error: 'No API key provided.' };
  }

  try {
    // 1. Get raw OCR text from the image
    const ocrData = await digitizeImageWithSarvam(imageUri, apiKey);

    // 2. Wrap the OCR data into our new Photo-specific prompt
    const prompt = buildPhotoPrompt(ocrData);

    // 3. Analyze it using the standard LLM endpoint
    return await analyzeWithSarvam(prompt, apiKey);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return { error: `Photo Analysis failed: ${message}` };
  }
}
