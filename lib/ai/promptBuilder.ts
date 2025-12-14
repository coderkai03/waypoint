import type { ChatMessage } from '@/types/flow';

export interface NodeContext {
  nodeId: string;
  nodeType: string;
  data: any;
}

export function buildPrompt(
  messages: ChatMessage[],
  connectedNodes: NodeContext[]
): string {
  let prompt = '';

  // Add system context from connected nodes
  if (connectedNodes.length > 0) {
    prompt += '## Context from Connected Nodes:\n\n';
    
    for (const node of connectedNodes) {
      switch (node.nodeType) {
        case 'googleDrive':
          prompt += `### Google Drive Reference (${node.nodeId}):\n`;
          if (node.data.fileName) {
            prompt += `File: ${node.data.fileName}\n`;
          }
          if (node.data.fileType) {
            prompt += `Type: ${node.data.fileType}\n`;
          }
          if (node.data.content) {
            if (node.data.fileType === 'document') {
              const docContent = node.data.content as any;
              prompt += `Content: ${docContent?.content || 'No content available'}\n`;
            } else if (node.data.fileType === 'spreadsheet') {
              const sheetData = node.data.content as any;
              prompt += `Data: ${JSON.stringify(sheetData?.values || sheetData, null, 2)}\n`;
            } else {
              prompt += `Metadata: ${JSON.stringify(node.data.content, null, 2)}\n`;
            }
          }
          prompt += '\n';
          break;
        
        case 'location':
          prompt += `### Location Information (${node.nodeId}):\n`;
          if (node.data.region) {
            prompt += `Region: ${node.data.region}\n`;
          }
          if (node.data.coordinates) {
            prompt += `Coordinates: ${node.data.coordinates.lat}, ${node.data.coordinates.lng}\n`;
          }
          prompt += '\n';
          break;
      }
    }
    
    prompt += '---\n\n';
  }

  // Add chat history
  prompt += '## Conversation History:\n\n';
  for (const message of messages) {
    prompt += `${message.role === 'user' ? 'User' : 'Assistant'}: ${message.content}\n\n`;
  }

  return prompt;
}

