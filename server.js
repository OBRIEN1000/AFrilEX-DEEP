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
// This works reliably on Render Web Services
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

    const model = "gemini-3-pro-preview";

    // Define Schemas (Inline for server-side JS)
    const translationSchema = {
      type: Type.OBJECT,
      properties: {
        language: { type: Type.STRING, description: "Name of the African language" },
        translatedWord: { type: Type.STRING, description: "The translated word" },
        pronunciation: { type: Type.STRING, description: "Phonetic pronunciation" },
        family: { type: Type.STRING, description: "Language family" },
        region: { type: Type.STRING, description: "Region" },
        similarityGroup: { type: Type.INTEGER, description: "Cognate cluster ID" },
        notes: { type: Type.STRING, description: "Etymological notes" }
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
      Map the etymological and phonetic cognates of this word across the African continent, strictly adhering to the **Cheikh Anta Diop and Théophile Obenga framework**.
      
      **INSTRUCTIONS**:
      1. **Target Languages**: Provide translations in at least 30 distinct African languages.
         - **MANDATORY**: You MUST include **Ancient Egyptian** (Medu Neter/Kemetic), **Coptic**, and **Bambara** (Mandingue).
         - Include a diverse set from: Wolof, Yoruba, Hausa, Swahili, Zulu, Amharic, Somali, Dinka, Akan, Fulani, etc.
      
      2. **Ancient Egyptian & Coptic**:
         - Provide transliteration and reconstructed pronunciation.
      
      3. **Phonetic Analysis**:
         - Analyze words for shared roots using linguistic sound mutation rules.
         - Assign a \`similarityGroup\` (integer) to cognate clusters.
      
      4. **Output**:
         - Return JSON.
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
    if (!text) throw new Error("No response from AI model");
    
    res.json(JSON.parse(text));

  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
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