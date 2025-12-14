import type { Task } from '@/types/flow';
import type { ClickUpTask } from './types';

// Mock ClickUp adapter - to be replaced with real MCP later
export class ClickUpAdapter {
  private mockTasks: Task[] = [
    {
      id: '1',
      title: 'Book venue',
      description: 'Find and book event venue',
      status: 'todo',
      priority: 'high',
    },
    {
      id: '2',
      title: 'Send invitations',
      description: 'Create and send event invitations',
      status: 'todo',
      priority: 'medium',
    },
  ];

  async getTasks(listId?: string): Promise<Task[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return [...this.mockTasks];
  }

  async createTask(task: Omit<Task, 'id'>): Promise<Task> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
    };
    this.mockTasks.push(newTask);
    return newTask;
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const taskIndex = this.mockTasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) {
      throw new Error(`Task ${taskId} not found`);
    }
    this.mockTasks[taskIndex] = { ...this.mockTasks[taskIndex], ...updates };
    return this.mockTasks[taskIndex];
  }

  async deleteTask(taskId: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    this.mockTasks = this.mockTasks.filter((t) => t.id !== taskId);
  }
}

// Singleton instance
let adapterInstance: ClickUpAdapter | null = null;

export function getClickUpAdapter(): ClickUpAdapter {
  if (!adapterInstance) {
    adapterInstance = new ClickUpAdapter();
  }
  return adapterInstance;
}

