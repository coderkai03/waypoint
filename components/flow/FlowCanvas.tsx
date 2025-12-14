'use client';

import { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { AgentNode } from './nodes/AgentNode';
import { GoogleDriveNode } from './nodes/GoogleDriveNode';
import { LocationNode } from './nodes/LocationNode';
import { GoogleDocEmbedNode } from './nodes/GoogleDocEmbedNode';
import { ClickUpEmbedNode } from './nodes/ClickUpEmbedNode';
import { EventSummaryNode } from './nodes/EventSummaryNode';
import { useFlowStore } from '@/lib/store/flowStore';

const nodeTypes = {
  agent: AgentNode as any,
  googleDrive: GoogleDriveNode as any,
  location: LocationNode as any,
  googleDocEmbed: GoogleDocEmbedNode as any,
  clickUpEmbed: ClickUpEmbedNode as any,
  eventSummary: EventSummaryNode as any,
};

const initialNodes: Node[] = [
  {
    id: 'agent-1',
    type: 'agent',
    position: { x: 600, y: 300 },
    data: {
      messages: [],
      isStreaming: false,
    },
  },
  {
    id: 'drive-ref-1',
    type: 'googleDrive',
    position: { x: 100, y: 100 },
    data: {
      fileId: '',
      isLoading: false,
    },
  },
  {
    id: 'drive-ref-2',
    type: 'googleDrive',
    position: { x: 100, y: 350 },
    data: {
      fileId: '',
      isLoading: false,
    },
  },
  {
    id: 'location-1',
    type: 'location',
    position: { x: 100, y: 600 },
    data: {},
  },
  {
    id: 'doc-output-1',
    type: 'googleDocEmbed',
    position: { x: 1200, y: 100 },
    data: {
      isLoading: false,
    },
  },
  {
    id: 'tasks-output-1',
    type: 'clickUpEmbed',
    position: { x: 1200, y: 350 },
    data: {
      tasks: [],
      isLoading: false,
    },
  },
  {
    id: 'summary-output-1',
    type: 'eventSummary',
    position: { x: 1200, y: 600 },
    data: {
      isLoading: false,
    },
  },
];

const initialEdges: Edge[] = [];

function FlowCanvasInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { googleToken, setGoogleToken } = useFlowStore();

  // Fetch Google token when canvas loads
  useEffect(() => {
    const fetchGoogleToken = async () => {
      // Only fetch if we don't already have a token
      if (!googleToken) {
        try {
          const response = await fetch('/api/auth/google-token');
          if (response.ok) {
            const data = await response.json();
            if (data.token) {
              setGoogleToken(data.token);
              console.log('[Canvas] Google auth token retrieved and stored.');
            } else {
              console.warn('[Canvas] Google auth token not available. MCP may not work properly.');
            }
          } else {
            // Get error details from response
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            if (response.status === 400) {
              console.warn('[Canvas] Google account not connected:', errorData.error, errorData.hint);
            } else {
              console.warn('[Canvas] Failed to fetch Google token:', response.status, errorData);
            }
          }
        } catch (error) {
          console.error('[Canvas] Error fetching Google token:', error);
        }
      }
    };

    fetchGoogleToken();
  }, [googleToken, setGoogleToken]);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges]
  );

  return (
    <div className="w-full h-screen">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}

export function FlowCanvas() {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner />
    </ReactFlowProvider>
  );
}

