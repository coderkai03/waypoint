'use client';

import { useEffect } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useFlowStore } from '@/lib/store/flowStore';
import type { EventSummaryNodeData, EventPlan } from '@/types/flow';

export function EventSummaryNode(props: NodeProps) {
  const { data, id } = props;
  const nodeData = data as unknown as EventSummaryNodeData;
  const eventPlan = useFlowStore((state) => state.eventPlan);

  useEffect(() => {
    if (eventPlan) {
      nodeData.eventPlan = eventPlan;
      nodeData.lastUpdated = new Date().toISOString();
      nodeData.isLoading = false;
    }
  }, [eventPlan, nodeData]);

  const plan = nodeData.eventPlan;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 border-green-500 w-96 h-96 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-lg">Event Summary</h3>
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
        ) : plan ? (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-lg">{plan.title}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {plan.description}
              </p>
            </div>

            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Date:</span> {plan.date}
              </div>
              <div>
                <span className="font-medium">Location:</span> {plan.location.name}
              </div>
              {plan.location.address && (
                <div className="text-gray-600 dark:text-gray-400">
                  {plan.location.address}
                </div>
              )}
              {plan.capacity && (
                <div>
                  <span className="font-medium">Capacity:</span> {plan.capacity}
                </div>
              )}
            </div>

            {plan.agenda && plan.agenda.length > 0 && (
              <div>
                <h5 className="font-semibold mb-2">Agenda</h5>
                <div className="space-y-2">
                  {plan.agenda.map((item, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium">{item.time}</span> - {item.activity}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {plan.attendees && plan.attendees.length > 0 && (
              <div>
                <h5 className="font-semibold mb-2">Attendees</h5>
                <div className="text-sm">
                  {plan.attendees.join(', ')}
                </div>
              </div>
            )}

            {plan.budget && (
              <div>
                <h5 className="font-semibold mb-2">Budget</h5>
                {plan.budget.total && (
                  <div className="text-sm font-medium">
                    Total: ${plan.budget.total.toLocaleString()}
                  </div>
                )}
                {plan.budget.breakdown && (
                  <div className="text-sm mt-2 space-y-1">
                    {Object.entries(plan.budget.breakdown).map(([key, value]) => (
                      <div key={key}>
                        {key}: ${typeof value === 'number' ? value.toLocaleString() : String(value)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-2">📅</div>
              <div>Waiting for event plan...</div>
            </div>
          </div>
        )}
      </div>

      <Handle type="target" position={Position.Left} id="input" />
    </div>
  );
}

