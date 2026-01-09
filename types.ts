
export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  timestamp: string; // ISO string
  source: string;
  url: string;
  category: string;
  relevanceScore: number;
  insight?: string; // AI generated market insight
}

export enum CRMCategory {
  SALESFORCE = 'Salesforce',
  HUBSPOT = 'HubSpot',
  MICROSOFT = 'Microsoft Dynamics',
  MARKET_TRENDS = 'Market Trends',
  AI_INTEGRATION = 'AI Integration',
  ENTERPRISE = 'Enterprise CRM'
}

export interface User {
  name: string;
  email: string;
  photo: string;
  isAdmin: boolean;
}

export type AppView = 'home' | 'about';

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface NewsState {
  items: NewsItem[];
  loading: boolean;
  lastUpdated: string | null;
  error: string | null;
}
