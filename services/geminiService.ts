
import { GoogleGenAI, GenerateContentResponse, Type, Modality } from "@google/genai";
import { NewsItem, Message } from "../types";

const getAI = () => {
  if (!process.env.API_KEY) {
    throw new Error("Configuration Error: API Key not found.");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const fetchCRMNews = async (startDate: string, endDate: string): Promise<NewsItem[]> => {
  const ai = getAI();
  const systemInstruction = `
    You are an expert CRM industry analyst. Your job is to find the most significant news about Salesforce, HubSpot, Microsoft Dynamics, and general CRM market trends.
    Use the googleSearch tool to find actual articles published between ${startDate} and ${endDate}.
    - Summaries must be exactly 2 sentences.
    - Assign one of these categories: [Salesforce, HubSpot, Microsoft Dynamics, Market Trends, AI Integration, Enterprise CRM].
    - Extract real URLs from your search results.
  `;

  const prompt = `Find the top 5 most important CRM industry news stories published from ${startDate} to ${endDate}. Return as JSON array.`;

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
    const verifiedUrls = groundingChunks.filter((c: any) => c.web?.uri).map((c: any) => c.web.uri);

    return rawItems.map((item: any, index: number) => ({
      ...item,
      url: item.url?.startsWith('http') ? item.url : (verifiedUrls[index % verifiedUrls.length] || 'https://www.crmspotlight.com'),
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
    }));
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
    return response.text || "Analyzed: Market volatility expected following this shift.";
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
      systemInstruction: `You are CRM Spotlight Assistant. You are an expert in CRM software (Salesforce, HubSpot, etc.). Use the following recent news as context: ${context}. Be professional, concise, and insightful.`,
    },
  });

  // Sending the message
  const result = await chat.sendMessage({ message: userInput });
  return result.text;
};
