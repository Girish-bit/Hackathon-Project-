import { GoogleGenAI, Type } from "@google/genai";
import { ThreatLevel } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ScanResult {
  riskLevel: ThreatLevel;
  confidence: number;
  explanation: string;
  mitigationSteps: string[];
  threatType: string;
}

export async function analyzeThreat(content: string, type: 'text' | 'link' | 'image_base64'): Promise<ScanResult> {
  const prompt = `Analyze the following ${type} for cybersecurity threats: ${content}. 
    Provide a detailed risk assessment including risk level (LOW, MEDIUM, HIGH, CRITICAL), confidence score (0-100), 
    explanation of the threat, and mitigation steps.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          riskLevel: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
          confidence: { type: Type.NUMBER },
          explanation: { type: Type.STRING },
          mitigationSteps: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING } 
          },
          threatType: { type: Type.STRING }
        },
        required: ["riskLevel", "confidence", "explanation", "mitigationSteps", "threatType"]
      }
    }
  });

  return JSON.parse(response.text);
}

export async function analyzeImageThreat(base64Data: string): Promise<ScanResult> {
  const imagePart = {
    inlineData: {
      mimeType: "image/png", // Assuming png for now, can be updated
      data: base64Data,
    },
  };
  const textPart = {
    text: "Analyze this image for cybersecurity threats like QR code phishing, hidden payloads in images, or social engineering cues. Return analysis in JSON.",
  };

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: [imagePart, textPart] },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          riskLevel: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
          confidence: { type: Type.NUMBER },
          explanation: { type: Type.STRING },
          mitigationSteps: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING } 
          },
          threatType: { type: Type.STRING }
        },
        required: ["riskLevel", "confidence", "explanation", "mitigationSteps", "threatType"]
      }
    }
  });

  return JSON.parse(response.text);
}
