import { GoogleGenAI, Type } from "@google/genai";
import { hkCaseLawsData } from "../data/hkCaseLaws";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface RAGResponse {
  answer: string;
  relevantNodeIds: string[];
}

export async function queryGraphRAG(question: string): Promise<RAGResponse> {
  const context = JSON.stringify(hkCaseLawsData, null, 2);
  
  const prompt = `You are an AI legal assistant specializing in Hong Kong Case Laws.
You have access to the following GraphRAG data representing cases, concepts, and statutes:
${context}

Answer the user's question based ONLY on this data. 
Also, identify the IDs of the nodes (cases, concepts, statutes) that are most relevant to your answer.

Question: ${question}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            answer: {
              type: Type.STRING,
              description: "The detailed answer to the user's question.",
            },
            relevantNodeIds: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
              description: "An array of node IDs (e.g., 'c1', 'con2') that are relevant to the answer.",
            },
          },
          required: ["answer", "relevantNodeIds"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text) as RAGResponse;
  } catch (error) {
    console.error("Error querying Gemini:", error);
    return {
      answer: "Sorry, I encountered an error while processing your request.",
      relevantNodeIds: [],
    };
  }
}
