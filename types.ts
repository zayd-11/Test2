export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export interface ChatMessage {
  id: string;
  role: Role;
  text: string;
  image?: string; // Base64 string for display
  timestamp: number;
}

export interface GeminiConfig {
  thinkingBudget?: number;
}
