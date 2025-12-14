import { create } from 'zustand';
import type { FlowStore, ChatMessage, EventPlan, Task, DocUpdate } from '@/types/flow';

export const useFlowStore = create<FlowStore>((set, get) => ({
  // Agent state
  messages: [],
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  updateMessage: (id, updates) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, ...updates } : msg
      ),
    })),
  clearMessages: () => set({ messages: [] }),

  // Structured outputs
  eventPlan: null,
  setEventPlan: (plan) => set({ eventPlan: plan }),

  taskList: [],
  setTaskList: (tasks) => set({ taskList: tasks }),
  addTask: (task) =>
    set((state) => ({
      taskList: [...state.taskList, task],
    })),
  updateTask: (id, updates) =>
    set((state) => ({
      taskList: state.taskList.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      ),
    })),

  docUpdates: [],
  setDocUpdates: (updates) => set({ docUpdates: updates }),
  addDocUpdate: (update) =>
    set((state) => ({
      docUpdates: [...state.docUpdates, update],
    })),

  // Node data
  nodeData: {},
  setNodeData: (nodeId, data) =>
    set((state) => ({
      nodeData: { ...state.nodeData, [nodeId]: data },
    })),
  getNodeData: (nodeId) => get().nodeData[nodeId] || null,

  // Voice state
  isRecording: false,
  isPlaying: false,
  setIsRecording: (recording) => set({ isRecording: recording }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),

  // Streaming state
  isStreaming: false,
  setIsStreaming: (streaming) => set({ isStreaming: streaming }),

  // Google OAuth token for MCP
  googleToken: null as string | null,
  setGoogleToken: (token) => set({ googleToken: token }),
}));

