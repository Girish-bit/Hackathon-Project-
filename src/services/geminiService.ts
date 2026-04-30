import { GoogleGenAI, Type } from "@google/genai";
import { ThreatLevel } from "../types";

let aiInstance: GoogleGenAI | null = null;

function getAIInstance() {
  if (!aiInstance) {
    // Safely check for GEMINI_API_KEY without crashing if process is undefined
    const apiKey = typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : undefined;
    
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined. Please configure it in your environment.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export interface HeatmapRegion {
  box_2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax] normalized 0-1000
  label: string;
}

export interface ScanResult {
  riskLevel: ThreatLevel;
  confidence: number;
  explanation: string;
  mitigationSteps: string[];
  threatType: string;
  heatmapRegions?: HeatmapRegion[];
}

export async function analyzeThreat(content: string, type: 'text' | 'link' | 'image_base64'): Promise<ScanResult> {
  const ai = getAIInstance();
  
  let prompt = '';
  if (type === 'link') {
    prompt = `Act as a Senior Cyber Intelligence Analyst. Analyze the following URL for security risks: "${content}".
    Check for:
    - Phishing/Homograph attacks (e.g., character substitution, IDN homographs)
    - Suspicious TLDs or domains (e.g., .zip, .rev, .mov or other newly weaponized TLDs)
    - Credential harvesting patterns in the path or query string
    - Malicious redirection sequences or URL shortener abuse
    - Known exploit kit patterns in parameters (SQLi, XSS, Path Traversal signatures in URLs)
    - Indicators of Compromise (IoC) linked to known C2 (Command & Control) infrastructure
    
    Provide a detailed risk assessment in JSON format including riskLevel (LOW, MEDIUM, HIGH, CRITICAL), confidence score (0-100), threatType, explanation, and concrete mitigationSteps.`;
  } else {
    prompt = `Act as a SOC Analyst and Forensic Expert. Analyze the following message/content for cybersecurity threats: 
    "${content}"
    
    Examine for:
    - Social engineering and cognitive hacking
    - Phishing and business email compromise (BEC) triggers
    - Hidden instructions or suspicious shell/code snippets
    - Information leakage or data exfiltration attempts
    - Urgency, authority, or scarcity manipulation
    
    Provide a detailed risk assessment in JSON format including riskLevel (LOW, MEDIUM, HIGH, CRITICAL), confidence score (0-100), threatType, explanation, and concrete mitigationSteps.`;
  }

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
  const ai = getAIInstance();
  const imagePart = {
    inlineData: {
      mimeType: "image/png", 
      data: base64Data,
    },
  };
  const textPart = {
    text: `Act as a Digital Forensics and Image Analysis Expert. Analyze this image for specialized cybersecurity threats.
    
    Look for:
    - QR Code Phishing (Quishing)
    - Sensitive information exposure (keys, passwords, PII in screenshots)
    - Social engineering cues in visual layouts
    - Signs of stenographic manipulation or hidden payloads
    - Fake UI elements designed for credential harvesting
    
    CRITICAL: For any detected threat or piece of evidence, provide 'heatmapRegions' which are bounding boxes in [ymin, xmin, ymax, xmax] format (normalized 0-1000). For example, if a suspicious QR code is found, specify its location.
    
    Return a detailed JSON risk assessment with riskLevel (LOW, MEDIUM, HIGH, CRITICAL), confidence, explanation, mitigationSteps, threatType, and heatmapRegions.`,
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
          threatType: { type: Type.STRING },
          heatmapRegions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                box_2d: { 
                  type: Type.ARRAY, 
                  items: { type: Type.NUMBER },
                  minItems: 4,
                  maxItems: 4
                },
                label: { type: Type.STRING }
              },
              required: ["box_2d", "label"]
            }
          }
        },
        required: ["riskLevel", "confidence", "explanation", "mitigationSteps", "threatType"]
      }
    }
  });

  return JSON.parse(response.text);
}
