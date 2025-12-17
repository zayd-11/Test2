import { GoogleGenAI, Content, Part } from "@google/genai";
import { ChatMessage, Role } from "../types";

// Initialize the client
// The API key is guaranteed to be in process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are a compassionate, Socratic AI math tutor. Your goal is to help the student understand math concepts deeply, not just to give them the answer.

When the user sends a math problem (text or image):
1.  **Do NOT solve the entire problem immediately.**
2.  Start by acknowledging the problem and asking the student what they think the first step is.
3.  Guide them step-by-step.
4.  If the student makes a mistake, gently guide them back without harsh criticism.
5.  If the student asks "Why?", stop and explain the underlying concept or theorem clearly and patiently before moving on.
6.  Use encouraging language (e.g., "Great start!", "That's a tricky part, let's break it down").
7.  Use clear text formatting. You can use Markdown.

Your tone should be patient, kind, and supportive, like a favorite teacher sitting next to a student.
`;

export const sendMessageToGemini = async (
  history: ChatMessage[],
  currentMessage: string,
  imageBase64?: string,
  imageMimeType: string = 'image/jpeg'
): Promise<string> => {
  try {
    // Convert app history to Gemini Content format
    const contents: Content[] = history.map((msg) => {
      const parts: Part[] = [];
      
      // If there was an image in history, include it.
      // Note: In a real production app, you might want to limit how many history images you send back 
      // to save tokens, but for this tutor context, seeing the original problem is crucial.
      if (msg.image) {
         // Extract base64 data from the data URL if present
         const base64Data = msg.image.split(',')[1];
         // Simple heuristic for mime type if not stored, defaulting to jpeg for history
         // In a robust app, store mime type in ChatMessage.
         const mimeMatch = msg.image.match(/data:([^;]+);base64/);
         const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
         
         parts.push({
           inlineData: {
             mimeType: mime,
             data: base64Data
           }
         });
      }

      if (msg.text) {
        parts.push({ text: msg.text });
      }

      return {
        role: msg.role === Role.USER ? 'user' : 'model',
        parts: parts,
      };
    });

    // Add the current new message
    const currentParts: Part[] = [];
    if (imageBase64) {
       // Remove data URL prefix if present for the API call
       const base64Data = imageBase64.split(',')[1];
       currentParts.push({
         inlineData: {
           mimeType: imageMimeType,
           data: base64Data
         }
       });
    }
    if (currentMessage) {
      currentParts.push({ text: currentMessage });
    }

    contents.push({
      role: 'user',
      parts: currentParts
    });

    // Call the model with thinking enabled for complex reasoning
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        thinkingConfig: {
          thinkingBudget: 32768, // Max budget for deep reasoning
        },
      },
    });

    return response.text || "I'm having trouble thinking about that right now. Could you try asking again?";

  } catch (error) {
    console.error("Error communicating with Gemini:", error);
    throw error;
  }
};
