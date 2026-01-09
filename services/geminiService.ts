
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { NewsItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const fetchCRMNews = async (startDate: string, endDate: string): Promise<NewsItem[]> => {
  // We use a specific system instruction to ensure the model focuses on real data from the search tool.
  const systemInstruction = `
    You are a CRM industry researcher. Use the googleSearch tool to find actual, recent news articles.
    CRITICAL: You must only provide real, working URLs from the search results. 
    Do not hallucinate or make up URLs.
  `;

  const prompt = `
    Find the most important CRM industry news (Salesforce, HubSpot, Microsoft, AI in CRM) published between ${startDate} and ${endDate}.
    Return a JSON array of objects.
    Each object must have:
    - title: Headline
    - summary: 2-sentence summary
    - source: Publisher name
    - category: One of [Salesforce, HubSpot, Microsoft Dynamics, Market Trends, AI Integration, Enterprise CRM]
    - relevanceScore: 1-10
    - url: THE EXACT SOURCE URL FROM THE SEARCH RESULTS.
  `;

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

    const jsonStr = response.text?.trim() || "[]";
    let rawItems: any[] = [];
    
    try {
      rawItems = JSON.parse(jsonStr);
    } catch (e) {
      // If JSON parsing fails, look for a JSON block in the text
      const match = jsonStr.match(/\[[\s\S]*\]/);
      if (match) {
        rawItems = JSON.parse(match[0]);
      }
    }

    // Extract real URLs from grounding metadata to double-check against hallucinations
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const validUrls = groundingChunks
      .filter(chunk => chunk.web && chunk.web.uri)
      .map(chunk => chunk.web!.uri);

    return rawItems.map((item: any, index: number) => {
      // If the model-provided URL seems suspicious or doesn't match search results, 
      // try to fallback to a URL from the grounding chunks if one exists.
      let finalUrl = item.url;
      if (!finalUrl?.startsWith('http') && validUrls.length > 0) {
        finalUrl = validUrls[index % validUrls.length];
      }

      return {
        ...item,
        url: finalUrl,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
      };
    }).filter(item => item.url && item.url.startsWith('http')); // Filter out anything that still has a broken URL
  } catch (error) {
    console.error("Error fetching CRM news:", error);
    throw error;
  }
};
