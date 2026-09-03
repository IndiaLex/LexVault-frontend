import React, { useMemo } from 'react';
import * as dagreLib from 'dagre';
import type { GraphNodeData, GraphEdgeData, CustodyEventType } from '../api/types';
import { 
  FilePlus, 
  Scan, 
  EyeOff, 
  ArrowRightLeft, 
  Link, 
  CheckCircle2, 
  UserCog 
} from 'lucide-react';

const dagre = ((dagreLib as any).default || dagreLib) as typeof dagreLib;

interface CaseGraphViewProps {
  nodes: GraphNodeData[];
  edges: GraphEdgeData[];
  onSelectNode: (node: GraphNodeData) => void;
  selectedNodeId?: string;
}

const EVENT_CONFIG: Record<CustodyEventType, { color: string; icon: React.FC<{ size?: number }> }> = {
  UPLOAD: { color: 'border-blue-500 bg-blue-950/40 text-blue-400', icon: FilePlus },
  OCR_COMPLETE: { color: 'border-slate-500 bg-slate-900/40 text-slate-400', icon: Scan },
  NER_COMPLETE: { color: 'border-slate-500 bg-slate-900/40 text-slate-400', icon: Scan },
  REDACTED: { color: 'border-amber-500 bg-amber-950/40 text-amber-400', icon: EyeOff },
  TRANSFERRED: { color: 'border-purple-500 bg-purple-950/40 text-purple-400', icon: ArrowRightLeft },
  ANCHORED: { color: 'border-emerald-500 bg-emerald-950/40 text-emerald-400', icon: Link },
  VERIFIED: { color: 'border-emerald-500 bg-emerald-950/40 text-emerald-400', icon: CheckCircle2 },
  ROLE_CHANGE: { color: 'border-rose-500 bg-rose-950/40 text-rose-400', icon: UserCog },
  VIEWED: { color: 'border-cyan-500 bg-cyan-950/40 text-cyan-400', icon: FilePlus },
  DOWNLOADED: { color: 'border-indigo-500 bg-indigo-950/40 text-indigo-400', icon: FilePlus },
};

export const CaseGraphView: React.FC<CaseGraphViewProps> = ({
  nodes,
  edges,
  onSelectNode,
  selectedNodeId,
}) => {
  const { positionedNodes, positionedEdges, graphDimensions } = useMemo(() => {
    if (!nodes || nodes.length === 0) {
      return { positionedNodes: [], positionedEdges: [], graphDimensions: { width: 800, height: 400 } };
    }

    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: 'LR', nodesep: 60, ranksep: 90 });
    g.setDefaultEdgeLabel(() => ({}));

    const nodeWidth = 200;
    const nodeHeight = 72;

    nodes.forEach((node) => {
      g.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
      g.setEdge(edge.source, edge.target);
    });

    dagre.layout(g);

    const pNodes = nodes.map((node) => {
      const nodePos = g.node(node.id) || { x: 0, y: 0 };
      return {
        ...node,
        x: nodePos.x - nodeWidth / 2,
        y: nodePos.y - nodeHeight / 2,
        width: nodeWidth,
        height: nodeHeight,
      };
    });

    const pEdges = edges.map((edge) => {
      const edgeData = g.edge(edge.source, edge.target);
      return {
        ...edge,
        points: edgeData?.points || [],
      };
    });

    const graphInfo = g.graph() || {};
    return {
      positionedNodes: pNodes,
      positionedEdges: pEdges,
      graphDimensions: {
        width: Math.max((graphInfo.width || 0) + 120, 800),
        height: Math.max((graphInfo.height || 0) + 120, 400),
      },
    };
  }, [nodes, edges]);

  return (
    <div className="w-full overflow-auto bg-slate-950 border border-slate-800 rounded-xl p-4 min-h-[380px]">
      <svg
        width={graphDimensions.width}
        height={graphDimensions.height}
        style={{ minWidth: `${graphDimensions.width}px`, minHeight: `${graphDimensions.height}px` }}
        className="block"
      >
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 8 5 L 0 9 z" fill="#475569" />
          </marker>
        </defs>

        {positionedEdges.map((edge) => {
          if (!edge.points || edge.points.length === 0) return null;
          const d = edge.points.reduce(
            (acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`,
            ''
          );
          return (
            <path
              key={edge.id}
              d={d}
              fill="none"
              stroke="#475569"
              strokeWidth="2"
              markerEnd="url(#arrow)"
            />
          );
        })}

        {positionedNodes.map((node) => {
          const config = EVENT_CONFIG[node.type] || EVENT_CONFIG.UPLOAD;
          const IconComponent = config.icon;
          const isSelected = selectedNodeId === node.id;

          return (
            <foreignObject
              key={node.id}
              x={node.x}
              y={node.y}
              width={node.width}
              height={node.height}
            >
              <div
                onClick={() => onSelectNode(node)}
                className={`w-full h-full p-2.5 rounded-lg border cursor-pointer transition-all duration-150 flex flex-col justify-between ${
                  config.color
                } ${
                  isSelected ? 'ring-2 ring-blue-400 scale-[1.02] shadow-lg' : 'hover:border-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 overflow-hidden">
                    <IconComponent size={15} />
                    <span className="font-semibold text-xs text-white truncate">
                      {node.label}
                    </span>
                  </div>
                  {node.anchored && (
                    <span className="flex items-center gap-0.5 text-[9px] px-1 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      <Link size={10} />
                      Amoy
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                  <span className="truncate max-w-[90px]">{node.actor}</span>
                  <span className="font-mono text-[9px] text-slate-500">
                    {node.hash ? node.hash.slice(0, 7) : 'pending'}
                  </span>
                </div>
              </div>
            </foreignObject>
          );
        })}
      </svg>
    </div>
  );
};