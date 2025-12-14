'use client';

import { useCallback, useState, useRef, useEffect } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useFlowStore } from '@/lib/store/flowStore';
import { useVoice } from '@/lib/voice/useVoice';
import type { AgentNodeData } from '@/types/flow';

export function AgentNode(props: NodeProps) {
  const { data, id } = props;
  const nodeData = data as unknown as AgentNodeData;
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { setIsStreaming } = useFlowStore();
  const { isRecording, startRecording, stopRecording, playText, isPlaying } = useVoice();

  // Initialize data if needed
  if (!nodeData.messages) {
    nodeData.messages = [];
    nodeData.isStreaming = false;
  }

  const { sendMessage, status, messages: chatMessages } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
    onFinish: (message) => {
      setIsStreaming(false);
    },
    onError: (error) => {
      console.error('Chat error:', error);
      setIsStreaming(false);
    },
  });

  const isLoading = status === 'streaming' || status === 'submitted';

  useEffect(() => {
    setIsStreaming(isLoading);
  }, [isLoading, setIsStreaming]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim()) return;

      sendMessage({
        text: input,
      });

      setInput('');
    },
    [input, sendMessage]
  );

  const handleMicClick = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 border-blue-500 w-96 h-[600px] flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-lg">AI Agent</h3>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            Start a conversation or connect reference nodes
          </div>
        ) : (
          chatMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                }`}
              >
                <div className="text-sm whitespace-pre-wrap">
                  {message.parts?.map((part, idx) => 
                    part.type === 'text' ? <span key={idx}>{part.text}</span> : null
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={onSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            disabled={isLoading || status !== 'ready'}
          />
          <button
            type="button"
            onClick={handleMicClick}
            className={`px-4 py-2 rounded-lg ${
              isRecording
                ? 'bg-red-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            title={isRecording ? 'Stop recording' : 'Start recording'}
          >
            🎤
          </button>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </div>

      {/* Handles */}
      <Handle type="target" position={Position.Left} id="input" />
      <Handle type="source" position={Position.Right} id="output" />
    </div>
  );
}

