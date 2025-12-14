import { NextRequest } from 'next/server';
import { streamText, convertToModelMessages, type UIMessage } from 'ai';
import { openai } from '@ai-sdk/openai';
import { auth } from '@clerk/nextjs/server';
import { agentTools, agentSystemPrompt, setStoreReference } from '@/lib/ai/agent';
import { buildPrompt } from '@/lib/ai/promptBuilder';
import { useFlowStore } from '@/lib/store/flowStore';
import { getGoogleToken } from '@/lib/auth/getGoogleToken';
import type { ChatMessage } from '@/types/flow';

export async function POST(req: NextRequest) {
  try {
    const { messages, connectedNodes } = await req.json();

    // Get Google token for MCP authentication
    const googleToken = await getGoogleToken();
    
    // Store token globally for agent tools to use
    if (googleToken) {
      // Store token in a way that agent tools can access it
      // We'll pass it through the store reference or use a global
      (globalThis as any).__googleToken = googleToken;
    } else {
      console.warn('[Chat API] Google auth token not available. MCP may not work properly.');
    }

    // Set store reference for agent tools
    setStoreReference(useFlowStore.getState());

    // Build prompt with context from connected nodes
    const contextPrompt = buildPrompt(messages as ChatMessage[], connectedNodes || []);

    // Create system message with context
    const systemMessage = {
      role: 'system' as const,
      content: `${agentSystemPrompt}\n\n${contextPrompt}`,
    };

    // Convert UI messages to model messages - ensure messages have proper structure
    const uiMessages: UIMessage[] = (messages || []).map((msg: any) => ({
      id: msg.id || Date.now().toString(),
      role: msg.role,
      content: msg.content,
      parts: msg.parts || [],
    }));
    
    const modelMessages = convertToModelMessages(uiMessages);
    
    // Add system message at the beginning
    const allMessages = [systemMessage, ...modelMessages.slice(-10)];

    const result = streamText({
      model: openai('gpt-4o'),
      messages: allMessages,
      tools: agentTools,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

