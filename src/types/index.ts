import { Message } from "ai";

export interface ChatMessage extends Message {
  timestamp?: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BackendResponse {
  message: string;
  success: boolean;
  data?: any;
  error?: string;
}

export interface StreamChunk {
  content: string;
  done: boolean;
}
