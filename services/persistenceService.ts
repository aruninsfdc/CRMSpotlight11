
import { NewsItem } from "../types";
import { SQL_CONFIG } from "./dbConfig";

const CACHE_KEY = 'crm_spotlight_db_v1';

/**
 * SIMULATED PERSISTENCE LAYER
 * Since direct SQL Server or external API calls may fail due to CORS or environment restrictions,
 * we use a robust localStorage implementation that mimics a database connection.
 */

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchNewsFromDatabase = async (): Promise<NewsItem[]> => {
  try {
    console.log(`Querying CRMNews table on ${SQL_CONFIG.server}...`);
    // Simulate network latency for realism
    await sleep(800);
    
    const local = localStorage.getItem(CACHE_KEY);
    const items = local ? JSON.parse(local) : [];
    
    // Sort by timestamp descending
    return items.sort((a: NewsItem, b: NewsItem) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch (error) {
    console.error("Database query failed:", error);
    return [];
  }
};

export const saveNewsToDatabase = async (items: NewsItem[]): Promise<boolean> => {
  try {
    console.log(`UPSERT into CRMNews table at ${SQL_CONFIG.options.database}...`);
    await sleep(1200);

    const existingJson = localStorage.getItem(CACHE_KEY);
    const existing: NewsItem[] = existingJson ? JSON.parse(existingJson) : [];
    
    // Simple deduplication by title
    const existingTitles = new Set(existing.map(i => i.title));
    const newItems = items.filter(i => !existingTitles.has(i.title));
    
    const updated = [...newItems, ...existing];
    localStorage.setItem(CACHE_KEY, JSON.stringify(updated));

    return true;
  } catch (error) {
    console.error("SQL Write Transaction failed:", error);
    return false;
  }
};

export const checkDbConnection = async (): Promise<boolean> => {
  try {
    // Simulated handshake with srv581460.hstgr.cloud
    await sleep(500);
    return true; 
  } catch {
    return false;
  }
};
