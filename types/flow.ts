import { z } from 'zod';

// Node Data Types
export interface AgentNodeData {
  messages: ChatMessage[];
  isStreaming: boolean;
}

export interface GoogleDriveNodeData {
  fileId: string;
  fileName?: string;
  fileType?: string; // 'document', 'spreadsheet', 'presentation', 'folder', etc.
  mimeType?: string;
  content?: any; // Content varies by file type
  isLoading: boolean;
}

export interface LocationNodeData {
  region?: string; // City, country, or region name
  coordinates?: { lat: number; lng: number };
}

export interface GoogleDocEmbedNodeData {
  docId?: string;
  content?: string;
  isLoading: boolean;
  lastUpdated?: string;
}

export interface ClickUpEmbedNodeData {
  tasks: Task[];
  isLoading: boolean;
  lastUpdated?: string;
}

export interface EventSummaryNodeData {
  eventPlan?: EventPlan;
  isLoading: boolean;
  lastUpdated?: string;
}

// Chat and Agent Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  toolCalls?: ToolCall[];
}

// UI Message type for AI SDK
export type UIMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  parts?: Array<{
    type: string;
    text?: string;
    toolCallId?: string;
    [key: string]: any;
  }>;
};

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, any>;
  result?: any;
}

// Structured Output Types
export const EventPlanSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.string(),
  location: z.object({
    name: z.string(),
    address: z.string(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number(),
    }).optional(),
  }),
  capacity: z.number().optional(),
  agenda: z.array(z.object({
    time: z.string(),
    activity: z.string(),
  })),
  attendees: z.array(z.string()).optional(),
  budget: z.object({
    total: z.number().optional(),
    breakdown: z.record(z.string(), z.number()).optional(),
  }).optional(),
});

export type EventPlan = z.infer<typeof EventPlanSchema>;

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'completed';
  assignee?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface DocUpdate {
  docId: string;
  title?: string;
  content: string;
  updatedAt: string;
}

// Store State Types
export interface FlowStore {
  // Agent state
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  clearMessages: () => void;
  
  // Structured outputs
  eventPlan: EventPlan | null;
  setEventPlan: (plan: EventPlan | null) => void;
  
  taskList: Task[];
  setTaskList: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  
  docUpdates: DocUpdate[];
  setDocUpdates: (updates: DocUpdate[]) => void;
  addDocUpdate: (update: DocUpdate) => void;
  
  // Node data
  nodeData: Record<string, any>;
  setNodeData: (nodeId: string, data: any) => void;
  getNodeData: (nodeId: string) => any;
  
  // Voice state
  isRecording: boolean;
  isPlaying: boolean;
  setIsRecording: (recording: boolean) => void;
  setIsPlaying: (playing: boolean) => void;
  
  // Streaming state
  isStreaming: boolean;
  setIsStreaming: (streaming: boolean) => void;
  
  // Google OAuth token for MCP
  googleToken: string | null;
  setGoogleToken: (token: string | null) => void;
}

// MCP Types
export interface MCPRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: any;
}

export interface MCPResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}


