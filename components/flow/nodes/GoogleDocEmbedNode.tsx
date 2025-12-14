'use client';

import { useEffect } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useFlowStore } from '@/lib/store/flowStore';
import type { GoogleDocEmbedNodeData } from '@/types/flow';

export function GoogleDocEmbedNode(props: NodeProps) {
  const { data, id } = props;
  const nodeData = data as unknown as GoogleDocEmbedNodeData;
  const docUpdates = useFlowStore((state) => state.docUpdates);
  const latestUpdate = docUpdates.length > 0 ? docUpdates[docUpdates.length - 1] : null;

  useEffect(() => {
    if (latestUpdate) {
      nodeData.docId = latestUpdate.docId;
      nodeData.content = latestUpdate.content;
      nodeData.lastUpdated = latestUpdate.updatedAt;
      nodeData.isLoading = false;
    }
  }, [latestUpdate, nodeData]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 border-blue-500 w-96 h-96 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-lg">Google Doc Output</h3>
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
        ) : nodeData.content ? (
          <div className="prose dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-sm">{nodeData.content}</div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-2">📄</div>
              <div>Waiting for document updates...</div>
            </div>
          </div>
        )}
      </div>

      <Handle type="target" position={Position.Left} id="input" />
    </div>
  );
}

