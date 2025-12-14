import { Tool, tool } from 'ai';
import { z } from 'zod';
import { EventPlanSchema, FlowStore, Task } from '@/types/flow';
import { getGoogleWorkspaceClient } from '@/lib/mcp/adapters/googleWorkspaceClient';
import { getClickUpAdapter } from '@/lib/mcp/adapters/clickUpAdapter';

// Helper to get Google token from global context (set by API route)
function getGoogleTokenFromContext(): string | null {
  if (typeof globalThis !== 'undefined') {
    return (globalThis as unknown as { __googleToken: string | null }).__googleToken || null;
  }
  return null;
}

// Store reference - will be set from API route
let storeRef: FlowStore | null = null;

export function setStoreReference(store: FlowStore) {
  storeRef = store;
}

// Create agent tools for use with streamText
export const agentTools = {
  createEventPlan: tool({
    description: 'Create a structured event plan with all details',
    parameters: EventPlanSchema,
    execute: async (params: z.infer<typeof EventPlanSchema>) => {
      // Store in Zustand store if available
      if (storeRef) {
        storeRef.setEventPlan(params);
      }
      return { success: true, eventPlan: params };
    },
  } as unknown as Tool),

  updateTaskList: tool({
    description: 'Update the task list in ClickUp',
    parameters: z.object({
      tasks: z.array(z.object({
        title: z.string(),
        description: z.string().optional(),
        status: z.enum(['todo', 'in_progress', 'completed']),
        priority: z.enum(['low', 'medium', 'high']).optional(),
        assignee: z.string().optional(),
        dueDate: z.string().optional(),
      })),
    }),
    execute: async ({ tasks }: { tasks: unknown[] }) => {
      const adapter = getClickUpAdapter();
      
      // Create/update tasks
      const updatedTasks = await Promise.all(
        tasks.map(async (task) => {
          try {
            return await adapter.createTask(task as Omit<Task, "id">);
          } catch (error: unknown) {
            console.error('Failed to create task:', error);
            return null;
          }
        })
      );
      
      const validTasks = updatedTasks.filter((t) => t !== null);
      
      // Update store if available
      if (storeRef) {
        storeRef.setTaskList(validTasks);
      }
      
      return { success: true, tasks: validTasks };
    },
  } as unknown as Tool),

  updateGoogleDoc: tool({
    description: 'Update a Google Doc with new content',
    parameters: z.object({
      docId: z.string(),
      content: z.string(),
      title: z.string().optional(),
    }),
    execute: async ({ docId, content, title }: { docId: string; content: string; title?: string }) => {
      try {
        const googleToken = getGoogleTokenFromContext();
        const client = await getGoogleWorkspaceClient(googleToken);
        await client.updateGoogleDoc(docId, content);
        
        // Update store if available
        if (storeRef) {
          storeRef.addDocUpdate({
            docId,
            title,
            content,
            updatedAt: new Date().toISOString(),
          });
        }
        
        return { success: true, docId };
      } catch (error) {
        console.error('Failed to update Google Doc:', error);
        return { success: false, error: String(error) };
      }
    },
  } as unknown as Tool),

  updateGoogleSheet: tool({
    description: 'Update a Google Sheet with new data',
    parameters: z.object({
      spreadsheetId: z.string(),
      range: z.string(),
      values: z.array(z.array(z.any())),
    }),
    execute: async ({ spreadsheetId, range, values }: { spreadsheetId: string; range: string; values: unknown[][] }) => {
      try {
        const googleToken = getGoogleTokenFromContext();
        const client = await getGoogleWorkspaceClient(googleToken);
        await client.updateGoogleSheet(spreadsheetId, range, values);
        
        return { success: true, spreadsheetId };
      } catch (error) {
        console.error('Failed to update Google Sheet:', error);
        return { success: false, error: String(error) };
      }
    },
  } as unknown as Tool),
};

export const agentSystemPrompt = `You are an AI assistant helping with event planning. You have access to:
- Google Workspace (Drive files - Docs, Sheets, Presentations, etc.) via MCP
- ClickUp for task management
- Location information from Google Maps

You can create event plans, update documents, manage tasks, and help coordinate all aspects of event planning.

When you receive context from connected nodes (Google Drive files, locations), use that information to inform your responses and actions.`;

