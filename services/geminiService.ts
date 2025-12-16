import { ResearchResult } from '../types';

export const searchAfricanLanguages = async (word: string): Promise<ResearchResult> => {
  try {
    // Call our own backend API which holds the API key securely
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ word }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Server error: ${response.status}`);
    }

    const result = await response.json() as ResearchResult;
    return result;

  } catch (error) {
    console.error("Search Service Error:", error);
    throw error;
  }
};