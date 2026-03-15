import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export async function askAiTutor(prompt: string, currentLesson: string, precedingConcepts: string, history: ChatMessage[] = []) {
  const model = "gemini-3.1-pro-preview";
  
  const systemInstruction = `You are an expert DevOps, AIOps, and MLOps tutor. 
  Your goal is to help the user understand complex operational concepts.
  
  BROADER CONTEXT (Preceding Lessons):
  ${precedingConcepts}
  
  CURRENT LESSON CONTENT:
  ${currentLesson}
  
  GUIDELINES:
  - Use the history of the conversation to provide consistent and building explanations. 
  - If the user asks a follow-up question, answer it in the context of the previous messages.
  - If the user asks about something covered previously, refer back to it to reinforce learning.
  - Keep explanations clear, professional, and encouraging.`;

  const response = await ai.models.generateContent({
    model,
    contents: [
      ...history,
      {
        role: "user",
        parts: [{ text: prompt }]
      }
    ],
    config: {
      systemInstruction,
      temperature: 0.7,
    }
  });

  return response.text;
}

export async function generateCodeSnippet(prompt: string, currentLesson: string, precedingConcepts: string, history: ChatMessage[] = []) {
  const model = "gemini-3.1-pro-preview";
  
  const systemInstruction = `You are an expert DevOps, AIOps, and MLOps engineer. 
  Generate relevant code snippets (YAML, Python, Terraform, etc.) based on the user's request and the lesson context.
  
  BROADER CONTEXT (Preceding Lessons):
  ${precedingConcepts}
  
  CURRENT LESSON CONTENT:
  ${currentLesson}
  
  Provide ONLY the code block with appropriate syntax highlighting. Keep explanations extremely brief or non-existent unless specifically asked.`;

  const response = await ai.models.generateContent({
    model,
    contents: [
      ...history,
      {
        role: "user",
        parts: [{ text: prompt }]
      }
    ],
    config: {
      systemInstruction,
      temperature: 0.4,
    }
  });

  return response.text;
}
