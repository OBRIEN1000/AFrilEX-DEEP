import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ResearchResult } from '../types';

// Initialize Gemini Client
// We assume process.env.API_KEY is available as per instructions.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const translationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    language: { type: Type.STRING, description: "Name of the African language" },
    translatedWord: { type: Type.STRING, description: "The translated word in the target language" },
    pronunciation: { type: Type.STRING, description: "Phonetic pronunciation guide" },
    family: { type: Type.STRING, description: "Language family (e.g., Niger-Congo, Afroasiatic, Egyptian)" },
    region: { type: Type.STRING, description: "Primary region or country where spoken" },
    similarityGroup: { 
      type: Type.INTEGER, 
      description: "An integer ID (1-10) grouping this word with others that sound phonetically similar/cognates." 
    },
    notes: { type: Type.STRING, description: "Brief etymological note, specifically mentioning sound shifts (e.g. p->f, k->h) if applicable." }
  },
  required: ["language", "translatedWord", "family", "region", "similarityGroup"]
};

const researchResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    sourceWord: { type: Type.STRING },
    translations: {
      type: Type.ARRAY,
      items: translationSchema
    },
    linguisticAnalysis: { 
      type: Type.STRING, 
      description: "A summary of the linguistic distribution, phonetic patterns, and interesting cognate findings, specifically highlighting connections to Ancient Egyptian and sound mutation rules." 
    }
  },
  required: ["sourceWord", "translations", "linguisticAnalysis"]
};

export const searchAfricanLanguages = async (word: string): Promise<ResearchResult> => {
  try {
    const model = "gemini-3-pro-preview"; // Using Pro for deeper linguistic knowledge
    
    const prompt = `
      Perform deep linguistic research on the word "${word}".
      
      **CORE OBJECTIVE**:
      Map the etymological and phonetic cognates of this word across the African continent, strictly adhering to the **Cheikh Anta Diop and Théophile Obenga framework** which posits a genetic relationship between Ancient Egyptian (Medu Neter) and modern Black African languages.
      
      **INSTRUCTIONS**:
      1. **Target Languages**: Provide translations in at least 30 distinct African languages.
         - **MANDATORY**: You MUST include **Ancient Egyptian** (Medu Neter/Kemetic), **Coptic**, and **Bambara** (Mandingue).
         - Include a diverse set from: Wolof, Yoruba, Hausa, Swahili, Zulu, Amharic, Somali, Dinka, Akan, Fulani, etc.
      
      2. **Ancient Egyptian & Coptic**:
         - For Ancient Egyptian, provide the transliteration (e.g., 'nfr') and the reconstructed phonetic pronunciation.
         - Treat them as indigenous African languages.
      
      3. **Bambara (Mandingue)**:
         - Provide the exact word and any related words with the same meaning to show semantic breadth.
      
      4. **Phonetic Analysis & Grouping**:
         - Analyze words for shared roots using **linguistic sound mutation rules** (e.g., correspondence between 'b' in one language and 'w' or 'm' in another; 'k' to 'h'; 'r' to 'l').
         - Assign a \`similarityGroup\` (integer) to words that form a cognate cluster based on these sound laws.
      
      5. **Output**:
         - Return the result in the specified JSON format.
         - The \`linguisticAnalysis\` summary should explicitly mention the specific sound shifts observed (e.g., "The Ancient Egyptian 'r' shifts to 'l' in Coptic and Bantu...").

      Return the data strictly in the requested JSON format.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: researchResponseSchema,
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text received from Gemini.");
    }

    const result = JSON.parse(text) as ResearchResult;
    return result;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};