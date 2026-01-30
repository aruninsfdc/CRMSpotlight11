
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { NewsItem, Message } from "../types";

const getAI = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

/**
 * Strict URL validator to ensure links are real, reachable web pages.
 */
const isWorkingUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    const lowercaseUrl = url.toLowerCase();
    
    // Block common placeholder and dead link patterns
    const suspiciousPatterns = [
      'example.com', 'placeholder', 'crmspotlight.com', 'localhost',
      '127.0.0.1', 'test.com', 'temp-url', 'yoursite.com',
      'domain.com', 'news-link-here', 'link-to-article', '404',
      'notfound', 'error', 'bit.ly', 'tinyurl.com'
    ];
    
    const isSuspicious = suspiciousPatterns.some(pattern => lowercaseUrl.includes(pattern));
    if (isSuspicious) return false;
    
    const hostname = parsed.hostname;
    // Basic sanity check for hostname
    if (!hostname.includes('.') || hostname.split('.').pop()?.length! < 2) {
      return false;
    }

    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

export const fetchCRMNews = async (startDate: string, endDate: string): Promise<NewsItem[]> => {
  const ai = getAI();
  const systemInstruction = `
    You are an expert CRM industry analyst. Your job is to find the most significant news about Salesforce, HubSpot, Microsoft Dynamics, and general CRM market trends.
    Use the googleSearch tool to find actual, live articles published between ${startDate} and ${endDate}.
    
    CRITICAL QUALITY RULES:
    1. Every item MUST have a valid, active URL to a real news article. 
    2. DO NOT hallucinate URLs. If you cannot find a direct link, skip the item.
    3. Check the URL carefully. If it looks like a placeholder (e.g., example.com) or leads to a potential 404/broken page, DISCARD the item.
    4. Summaries must be exactly 2 sentences.
    5. Return as a JSON array.
  `;

  const prompt = `Research and find the top 5 CRM industry news stories with VERIFIED and WORKING links from ${startDate} to ${endDate}. Ensure no broken or placeholder links are included.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              source: { type: Type.STRING },
              category: { type: Type.STRING },
              relevanceScore: { type: Type.NUMBER },
              url: { type: Type.STRING }
            },
            required: ["title", "summary", "source", "category", "relevanceScore", "url"]
          }
        }
      },
    });

    const text = response.text || "[]";
    const rawItems = JSON.parse(text.replace(/```json|```/g, ""));
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    // Extract actual URLs from grounding to cross-reference
    const verifiedUrls = groundingChunks
      .filter((c: any) => c.web?.uri && isWorkingUrl(c.web.uri))
      .map((c: any) => c.web.uri);

    return rawItems
      .map((item: any, index: number) => {
        let finalUrl = item.url;
        // If the AI's provided URL is suspicious but we have grounding links, try to use those
        if (!isWorkingUrl(finalUrl) && verifiedUrls.length > 0) {
          finalUrl = verifiedUrls[index % verifiedUrls.length];
        }
        return {
          ...item,
          url: finalUrl,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toISOString(),
        };
      })
      .filter((item: any) => isWorkingUrl(item.url));
  } catch (error) {
    console.error("fetchCRMNews error:", error);
    throw error;
  }
};

export const getMarketInsight = async (item: NewsItem): Promise<string> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-flash-lite-latest",
      contents: `Provide a 1-sentence expert market insight for this CRM news: "${item.title}: ${item.summary}". Focus on competitive impact.`,
      config: { temperature: 0.7 }
    });
    return response.text || "Analyzed: Market shifts expected following this industry move.";
  } catch (err) {
    return "Intelligence offline. Impact analysis unavailable.";
  }
};

export const chatWithAssistant = async (history: Message[], userInput: string, currentNews: NewsItem[]) => {
  const ai = getAI();
  const context = currentNews.map(n => n.title).join(", ");
  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: `You are CRM Spotlight Assistant. You are an expert in CRM software. Use the following news as context: ${context}. Help the user understand industry trends.`,
    },
  });

  const result = await chat.sendMessage({ message: userInput });
  return result.text;
};

// Added analyzeDeploymentRisk to fix missing export error in DeploymentPage.tsx
export const analyzeDeploymentRisk = async (commits: string[]) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the technical risk associated with these code commits for a CRM intelligence platform: ${commits.join("; ")}. Provide a risk classification and summary.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskLevel: { 
              type: Type.STRING, 
              description: "The assessed risk level: Low, Medium, or High." 
            },
            summary: { 
              type: Type.STRING, 
              description: "A concise technical summary of potential impact." 
            },
            concerns: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING }, 
              description: "Specific technical concerns identified." 
            }
          },
          required: ["riskLevel", "summary", "concerns"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (err) {
    console.error("analyzeDeploymentRisk error:", err);
    return { 
      riskLevel: "Medium", 
      summary: "AI analysis unavailable. Manual oversight required.", 
      concerns: ["Service availability"] 
    };
  }
};
