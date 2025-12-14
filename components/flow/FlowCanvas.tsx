'use client';

import { useCallback } from 'react';
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
    position: { x: 400, y: 200 },
    data: {
      messages: [],
      isStreaming: false,
    },
  },
  {
    id: 'drive-ref-1',
    type: 'googleDrive',
    position: { x: 50, y: 100 },
    data: {
      fileId: '',
      isLoading: false,
    },
  },
  {
    id: 'drive-ref-2',
    type: 'googleDrive',
    position: { x: 50, y: 250 },
    data: {
      fileId: '',
      isLoading: false,
    },
  },
  {
    id: 'location-1',
    type: 'location',
    position: { x: 50, y: 400 },
    data: {},
  },
  {
    id: 'doc-output-1',
    type: 'googleDocEmbed',
    position: { x: 900, y: 100 },
    data: {
      isLoading: false,
    },
  },
  {
    id: 'tasks-output-1',
    type: 'clickUpEmbed',
    position: { x: 900, y: 300 },
    data: {
      tasks: [],
      isLoading: false,
    },
  },
  {
    id: 'summary-output-1',
    type: 'eventSummary',
    position: { x: 900, y: 500 },
    data: {
      isLoading: false,
    },
  },
];

const initialEdges: Edge[] = [];

function FlowCanvasInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

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

