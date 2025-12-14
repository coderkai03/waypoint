import type { MCPRequest, MCPResponse, MCPTool } from '@/types/flow';

export type { MCPRequest, MCPResponse, MCPTool };

export interface MCPClient {
  listTools(): Promise<MCPTool[]>;
  callTool(name: string, args: Record<string, unknown>): Promise<unknown>;
}

export interface GoogleWorkspaceMCPConfig {
  baseUrl: string;
  apiKey?: string;
}

export interface ClickUpTask {
  id: string;
  name: string;
  status: {
    status: string;
  };
  assignees: Array<{ id: string; username: string }>;
  due_date?: string;
  priority?: {
    priority: string;
  };
}

