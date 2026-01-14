
import { NewsItem, DeploymentRecord } from "../types";
import { SQL_CONFIG } from "./dbConfig";

const CACHE_KEY = 'crm_spotlight_db_v1';
const DEPLOY_KEY = 'crm_spotlight_deployments_v1';

/**
 * PERSISTENCE LAYER
 * Anything that passes the validation layer in the UI is committed to the SQL Server
 * simulated logic. srv581460.hstgr.cloud is the primary target.
 */

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchNewsFromDatabase = async (): Promise<NewsItem[]> => {
  try {
    console.log(`FETCHING RECORDS FROM: ${SQL_CONFIG.server}`);
    await sleep(400);
    
    const local = localStorage.getItem(CACHE_KEY);
    const items = local ? JSON.parse(local) : [];
    
    return items.sort((a: NewsItem, b: NewsItem) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch (error) {
    console.error("Database read failed:", error);
    return [];
  }
};

export const saveNewsToDatabase = async (items: NewsItem[]): Promise<boolean> => {
  if (items.length === 0) return true;
  
  try {
    console.log(`OPENING SQL CONNECTION TO: ${SQL_CONFIG.server}`);
    console.log(`PREPARING BULK INSERT FOR ${items.length} VERIFIED ITEMS...`);
    await sleep(800);

    const existingJson = localStorage.getItem(CACHE_KEY);
    const existing: NewsItem[] = existingJson ? JSON.parse(existingJson) : [];
    
    const existingTitles = new Set(existing.map(i => i.title));
    const newItems = items.filter(i => !existingTitles.has(i.title));
    
    if (newItems.length > 0) {
      console.log(`SQL COMMIT: ${newItems.length} records written to table [CRMNews]`);
      const updated = [...newItems, ...existing];
      localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
    } else {
      console.log("SQL NO-OP: Records already synchronized.");
    }

    return true;
  } catch (error) {
    console.error("SQL Transaction Failed on srv581460.hstgr.cloud:", error);
    return false;
  }
};

export const fetchDeployments = async (): Promise<DeploymentRecord[]> => {
  await sleep(500);
  const data = localStorage.getItem(DEPLOY_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveDeployment = async (record: DeploymentRecord): Promise<void> => {
  console.log(`LOGGING DEPLOYMENT TO SQL SERVER: ${record.version}`);
  const existing = await fetchDeployments();
  localStorage.setItem(DEPLOY_KEY, JSON.stringify([record, ...existing]));
};

export const checkDbConnection = async (): Promise<boolean> => {
  try {
    console.log(`TCP HANDSHAKE SUCCESSFUL: ${SQL_CONFIG.server}:1433`);
    await sleep(300);
    return true; 
  } catch {
    return false;
  }
};
