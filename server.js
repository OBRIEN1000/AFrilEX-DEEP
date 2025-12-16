import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from "@google/genai";

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Initialize Gemini with the runtime environment variable
const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.warn("WARNING: process.env.API_KEY is not set. API calls will fail.");
}
const ai = new GoogleGenAI({ apiKey: apiKey || "MISSING_KEY" });

// API Endpoint for Search
app.post('/api/search', async (req, res) => {
  try {
    const { word } = req.body;
    if (!word) {
      return res.status(400).json({ error: "Word is required" });
    }

    // Switched to Flash for better rate limits (avoids 429 errors)
    const model = "gemini-2.5-flash";

    // Define Schemas (Inline for server-side JS)
    const translationSchema = {
      type: Type.OBJECT,
      properties: {
        language: { type: Type.STRING, description: "Name of the African language" },
        translatedWord: { type: Type.STRING, description: "The translated word" },
        pronunciation: { type: Type.STRING, description: "Phonetic pronunciation" },
        family: { type: Type.STRING, description: "Language family" },
        region: { type: Type.STRING, description: "Region" },
        similarityGroup: { type: Type.INTEGER, description: "Cognate cluster ID (1-10)" },
        notes: { type: Type.STRING, description: "Etymological notes or connection to root" }
      },
      required: ["language", "translatedWord", "family", "region", "similarityGroup"]
    };

    const researchResponseSchema = {
      type: Type.OBJECT,
      properties: {
        sourceWord: { type: Type.STRING },
        translations: {
          type: Type.ARRAY,
          items: translationSchema
        },
        linguisticAnalysis: { type: Type.STRING }
      },
      required: ["sourceWord", "translations", "linguisticAnalysis"]
    };

    const prompt = `
      Perform deep linguistic research on the word "${word}".
      
      **CORE OBJECTIVE**:
      Simulate a deep lexical mining process similar to PanLinx or specialized ethno-linguistic tools.
      Map the etymological and phonetic cognates of this word across the African continent, strictly adhering to the **Cheikh Anta Diop and Théophile Obenga framework** (Genetic Unity of African Languages).
      
      **INSTRUCTIONS**:
      1. **Target Languages**: Provide translations in at least 30 distinct African languages.
         - **MANDATORY**: You MUST include **Ancient Egyptian** (Medu Neter/Kemetic), **Coptic**, and **Bambara** (Mandingue).
         - Include a diverse set from: Wolof, Yoruba, Hausa, Swahili, Zulu, Amharic, Somali, Dinka, Akan, Fulani, Igbo, Lingala, Kikuyu, etc.
      
      2. **Ancient Egyptian & Coptic**:
         - Provide transliteration and reconstructed pronunciation.
         - Highlight the connection between the Pharaonic root and modern variants.
      
      3. **Phonetic Analysis**:
         - Analyze words for shared roots using linguistic sound mutation rules (e.g. p <-> f, m <-> b).
         - Assign a \`similarityGroup\` (integer 1-10) to cognate clusters (words that sound similar or share a root).
      
      4. **Output**:
         - Return pure JSON matching the schema.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: researchResponseSchema,
        temperature: 0.3 // Lower temperature for more factual/consistent results
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI model");
    
    res.json(JSON.parse(text));

  } catch (error) {
    console.error("API Error:", error);
    
    // Try to extract a clean message if the error is a JSON string (common in Google SDK)
    let errorMessage = error.message;
    try {
      if (errorMessage.includes("{")) {
        const parsed = JSON.parse(errorMessage.substring(errorMessage.indexOf("{")));
        if (parsed.error && parsed.error.message) {
          errorMessage = parsed.error.message;
        }
      }
    } catch (e) {
      // Keep original message if parsing fails
    }

    if (errorMessage.includes("429") || errorMessage.includes("quota")) {
      res.status(429).json({ error: "High traffic. Please wait a moment and try again (Rate Limit Exceeded)." });
    } else {
      res.status(500).json({ error: errorMessage || "Internal Server Error" });
    }
  }
});

// Serve static files from the dist directory (Vite build output)
app.use(express.static(path.join(__dirname, 'dist')));

// Handle React routing, return all requests to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});