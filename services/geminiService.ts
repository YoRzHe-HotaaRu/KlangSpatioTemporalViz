import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisReport, HourlyData, MapNode } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates an analytical report based on the current system state.
 * @param time Current simulation hour (0-23)
 * @param selectedNode Currently selected node (optional)
 * @param globalTraffic An aggregate score of current traffic
 */
export const generateTrendAnalysis = async (
  time: number,
  selectedNode: MapNode | null,
  globalTraffic: number
): Promise<AIAnalysisReport> => {
  
  // Construct a prompt context
  const context = `
    Context:
    - Region: Klang Valley, Malaysia.
    - Current Time: ${time}:00.
    - System-wide Traffic Density: ${globalTraffic.toFixed(1)}/100.
    - Focus Node: ${selectedNode ? `${selectedNode.name} (${selectedNode.type})` : 'Entire Network'}.
    - Data Sources: Simulated multi-source data including public transit logs, social media check-ins, and attraction reviews.
  `;

  const prompt = `
    You are a Senior Urban Data Analyst. Based on the provided context, generate a concise Spatio-Temporal trend analysis.
    
    ${context}

    Analyze:
    1. The likely cause of the current traffic patterns based on the time and location (e.g., commute, tourism, nightlife).
    2. Potential anomalies or insights (e.g., if it's 10 PM and traffic is high in a residential area).
    3. Actionable recommendations for transit operators or tourists.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "A 1-2 sentence overview of the current status." },
            identifiedTrends: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of 3 distinct observations about the flow/popularity."
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of 2 actionable advice items."
            }
          },
          required: ["summary", "identifiedTrends", "recommendations"]
        }
      }
    });

    const result = JSON.parse(response.text);

    return {
      timestamp: new Date().toISOString(),
      summary: result.summary,
      identifiedTrends: result.identifiedTrends,
      recommendations: result.recommendations,
    };

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    // Fallback if API fails
    return {
      timestamp: new Date().toISOString(),
      summary: "Analysis currently unavailable. Please check your network or API quota.",
      identifiedTrends: ["Data stream interrupted", "Unable to calculate correlation"],
      recommendations: ["Retry analysis later"]
    };
  }
};
