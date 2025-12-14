import type { MCPRequest, MCPResponse, MCPTool, MCPClient, GoogleWorkspaceMCPConfig } from './types';

export class GoogleWorkspaceMCPClient implements MCPClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor(config: GoogleWorkspaceMCPConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.apiKey = config.apiKey;
  }

  private async makeRequest(request: MCPRequest): Promise<MCPResponse> {
    const url = `${this.baseUrl}/mcp`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Use API key (which should be the Google OAuth token) as bearer token
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data as MCPResponse;
    } catch (error) {
      console.error('MCP request failed:', error);
      throw error;
    }
  }

  async listTools(): Promise<MCPTool[]> {
    const request: MCPRequest = {
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/list',
    };

    const response = await this.makeRequest(request);
    
    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.result?.tools || [];
  }

  async callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    const request: MCPRequest = {
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/call',
      params: {
        name,
        arguments: args,
      },
    };

    const response = await this.makeRequest(request);
    
    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.result;
  }

  // Convenience methods for common operations
  async readGoogleDoc(docId: string): Promise<unknown> {
    return this.callTool('gdocs_read', { document_id: docId });
  }

  async updateGoogleDoc(docId: string, content: string): Promise<unknown> {
    return this.callTool('gdocs_update', { 
      document_id: docId,
      content,
    });
  }

  async readGoogleSheet(spreadsheetId: string, range?: string): Promise<unknown> {
    return this.callTool('gsheets_read', { 
      spreadsheet_id: spreadsheetId,
      range,
    });
  }

  async updateGoogleSheet(
    spreadsheetId: string,
    range: string,
    values: unknown[][]
  ): Promise<unknown> {
    return this.callTool('gsheets_update', {
      spreadsheet_id: spreadsheetId,
      range,
      values,
    });
  }

  async listDriveFiles(query?: string): Promise<unknown> {
    return this.callTool('gdrive_list', { query });
  }

  async getDriveFileMetadata(fileId: string): Promise<unknown> {
    // Try gdrive_get first, fallback to gdrive_list with file ID filter
    try {
      return await this.callTool('gdrive_get', { file_id: fileId });
    } catch {
      // Fallback: use gdrive_list to find the file
      const files = await this.listDriveFiles(`id='${fileId}'`) as unknown;
      if (files && Array.isArray(files) && files.length > 0) {
        return files[0];
      }
      throw new Error('File not found');
    }
  }

  async readDriveFile(fileId: string): Promise<unknown> {
    // First get metadata to determine file type
    const metadata = await this.getDriveFileMetadata(fileId) as Record<string, unknown>;
    
    if (!metadata) {
      throw new Error('File not found');
    }

    const mimeType = (metadata.mimeType || metadata.mime_type || '') as string;
    
    // Determine file type and read accordingly
    if (mimeType.includes('document') || mimeType === 'application/vnd.google-apps.document') {
      const content = await this.readGoogleDoc(fileId);
      return { ...metadata, content };
    } else if (mimeType.includes('spreadsheet') || mimeType === 'application/vnd.google-apps.spreadsheet') {
      const content = await this.readGoogleSheet(fileId);
      return { ...metadata, content };
    } else {
      // For other file types, return metadata
      return metadata;
    }
  }
}

// Store client instances per user token (since tokens are user-specific)
const clientInstances = new Map<string, GoogleWorkspaceMCPClient>();

export async function getGoogleWorkspaceClient(googleToken?: string | null): Promise<GoogleWorkspaceMCPClient> {
  // Use token as key for caching per user
  const tokenKey = googleToken || 'default';
  
  if (!clientInstances.has(tokenKey)) {
    const baseUrl = process.env.NEXT_PUBLIC_MCP_SERVER_URL || 'http://localhost:8000';
    clientInstances.set(tokenKey, new GoogleWorkspaceMCPClient({
      baseUrl,
      apiKey: googleToken || process.env.MCP_API_KEY,
    }));
  }
  
  return clientInstances.get(tokenKey)!;
}

