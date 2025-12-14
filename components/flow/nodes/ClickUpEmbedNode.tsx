'use client';

import { useEffect } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useFlowStore } from '@/lib/store/flowStore';
import type { ClickUpEmbedNodeData, Task } from '@/types/flow';

export function ClickUpEmbedNode(props: NodeProps) {
  const { data, id } = props;
  const nodeData = data as unknown as ClickUpEmbedNodeData;
  const taskList = useFlowStore((state) => state.taskList);

  useEffect(() => {
    nodeData.tasks = taskList;
    nodeData.lastUpdated = new Date().toISOString();
    nodeData.isLoading = false;
  }, [taskList, nodeData]);

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority?: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 border-purple-500 w-96 h-96 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-lg">ClickUp Tasks</h3>
        {nodeData.lastUpdated && (
          <div className="text-xs text-gray-500 mt-1">
            Updated: {new Date(nodeData.lastUpdated).toLocaleString()}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {nodeData.isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Loading...</div>
          </div>
        ) : nodeData.tasks.length > 0 ? (
          <div className="space-y-3">
            {nodeData.tasks.map((task) => (
              <div
                key={task.id}
                className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="font-medium">{task.title}</div>
                    {task.description && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {task.description}
                      </div>
                    )}
                  </div>
                  <div
                    className={`w-3 h-3 rounded-full ${getStatusColor(task.status)}`}
                    title={task.status}
                  />
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {task.priority && (
                    <span className={getPriorityColor(task.priority)}>
                      {task.priority.toUpperCase()}
                    </span>
                  )}
                  {task.dueDate && (
                    <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                  )}
                  {task.assignee && <span>@{task.assignee}</span>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-2">✓</div>
              <div>No tasks yet</div>
            </div>
          </div>
        )}
      </div>

      <Handle type="target" position={Position.Left} id="input" />
    </div>
  );
}

