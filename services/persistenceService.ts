
import { NewsItem, DeploymentRecord } from "../types";

const CACHE_KEY = 'crm_spotlight_db_v1';
const DEPLOYMENTS_KEY = 'crm_spotlight_deployments_v1';

/**
 * PERSISTENCE LAYER
 * Local storage is used for synchronization within the spotlight environment.
 */

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchNewsFromDatabase = async (): Promise<NewsItem[]> => {
  try {
    await sleep(200);
    const local = localStorage.getItem(CACHE_KEY);
    const items = local ? JSON.parse(local) : [];
    
    return items.sort((a: NewsItem, b: NewsItem) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch (error) {
    console.error("Local data read failed:", error);
    return [];
  }
};

export const saveNewsToDatabase = async (items: NewsItem[]): Promise<boolean> => {
  if (items.length === 0) return true;
  
  try {
    await sleep(400);

    const existingJson = localStorage.getItem(CACHE_KEY);
    const existing: NewsItem[] = existingJson ? JSON.parse(existingJson) : [];
    
    const existingTitles = new Set(existing.map(i => i.title));
    const newItems = items.filter(i => !existingTitles.has(i.title));
    
    if (newItems.length > 0) {
      const updated = [...newItems, ...existing];
      localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
    }

    return true;
  } catch (error) {
    console.error("Local sync failed:", error);
    return false;
  }
};

// Added fetchDeployments to fix missing export error in DeploymentPage.tsx
export const fetchDeployments = async (): Promise<DeploymentRecord[]> => {
  try {
    await sleep(200);
    const local = localStorage.getItem(DEPLOYMENTS_KEY);
    const items = local ? JSON.parse(local) : [];
    return items.sort((a: DeploymentRecord, b: DeploymentRecord) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch (error) {
    console.error("Local deployments read failed:", error);
    return [];
  }
};

// Added saveDeployment to fix missing export error in DeploymentPage.tsx
export const saveDeployment = async (deployment: DeploymentRecord): Promise<boolean> => {
  try {
    await sleep(300);
    const existing = await fetchDeployments();
    const updated = [deployment, ...existing];
    localStorage.setItem(DEPLOYMENTS_KEY, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error("Local deployment save failed:", error);
    return false;
  }
};

export const checkDbConnection = async (): Promise<boolean> => {
  return true; // Local service always available
};
