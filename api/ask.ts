import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";
import path from "path";
import fs from "fs";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { query } = req.body;
  if (!query || typeof query !== "string" || !query.trim()) {
    return res.status(400).json({ error: "Query is required" });
  }

  try {
        // Lazy load Gemini API Key and throw elegant errors
        const apiKey = process.env.GEMINI_API_KEY; // Works in Node.js environment with dotenv
        //const apiKey = process.env.VITE_GEMINI_API_KEY; 
        //const apiKey = import.meta.env.VITE_GEMINI_API_KEY; // Only works in Vite-bundled browser code
        // console.log("process.env: ", process.env);
        // console.log("import.meta.env: ", import.meta.env);
        console.log("GEMINI_API_KEY loaded:", !!apiKey, apiKey ? "Key length: " + apiKey.length : "No key found");
        if (!apiKey) {
          console.warn("GEMINI_API_KEY environment variable is not defined.");
          return res.status(500).json({          
            error: "Gemini API key is not configured.",
            text: "I'm sorry, my AI query server is currently starting or configured incorrectly. Please check back shortly or select standard navigation links!"
          });
        }
  
        // Read portfolio markdown as full context for RAG
        const portfolioPath = path.join(process.cwd(), "src", "data", "portfolio.md");
        let portfolioMarkdown = "";
        try {
          portfolioMarkdown = fs.readFileSync(portfolioPath, "utf-8");
        } catch (err) {
          console.error("Failed to read portfolio.md context path:", err);
          return res.status(500).json({ error: "Failed to load resume context." });
        }
  
        // Initialize Gemini using correct @google/genai syntax and required telemetry headers
        console.log("[API ASK] Initializing GoogleGenAI client");
        const ai = new GoogleGenAI({
          apiKey: apiKey,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build",
            }
          }
        });
  
        // Prompt optimized for concise, natural RAG retrieval and strict missing-item handling
        const systemInstruction = `You are Koo Weng Seng, a Senior Full-Stack Software Engineer.
  Using only the provided resume and portfolio markdown document as your source of truth, answer the user's question.
  
  Portfolio/Resume Markdown Source:
  ${portfolioMarkdown}
  
  Core Directive Guidelines:
  1. Speak in the first person ("I", "my projects", "my INTI college") with a professional, friendly, and natural conversational tone.
  2. If the user asks about a skill, library, framework, or topic that is explicitly listed as NOT familiar (such as Laravel, PHP, Vue, Svelte, Angular, Ruby, Kubernetes, Go, Django, Flask), or is completely unmentioned inside the document, you MUST explicitly state that you are not familiar with it. For example, say: "I'm sorry, I'm not familiar with [Topic Name]" or "I'm not familiar with [Topic Name] as my focus is primarily on React, TypeScript, and the Node.js ecosystem."
  3. You can compile and synthesize your answer from multiple different sections of the document if necessary (e.g. for "How familiar are you with SQL?").
  4. Keep the response concise, punchy, and highly readable, formatted in clean Markdown. Avoid extremely long-winded paragraphs. Prefer list bullets if breaking down multi-part achievements.
  `;
  
        console.log("[API ASK] Sending request to Gemini model (gemini-2.5-flash)");
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: query.trim(),
          config: {
            systemInstruction,
            temperature: 0.2, // Low temperature for precise RAG factual outputs
          }
        });
  
        console.log("[API ASK] Gemini response received", { ok: !!response, keys: response && Object.keys(response || {}) });
        const responseText = response?.text || "I'm sorry, I couldn't formulate a proper response. Please try again.";
        return res.json({ text: responseText });
  
      } catch (err: any) {
      console.error("Gemini RAG Generation Error:", err && err.message ? err.message : err);
      if (err && (err as any).stack) console.error((err as any).stack);
      // Log common axios-style response details if present
      if ((err as any).response) {
        try {
          console.error("Error response status:", (err as any).response.status);
          console.error("Error response data:", JSON.stringify((err as any).response.data, null, 2));
        } catch (e) {
          console.error("Failed to stringify err.response", e);
        }
      }

      return res.status(500).json({
        error: err?.message || "Failed to process question via AI",
        text: "I apologize, but I encountered an error searching my knowledge base. Please ask something else!"
      });
    }
}