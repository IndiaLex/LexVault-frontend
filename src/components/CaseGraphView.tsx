import React, { useMemo, useState } from 'react';
import * as dagreLib from 'dagre';
import type { GraphNodeData, GraphEdgeData } from '../api/types';
import { 
  FilePlus, 
  Scan, 
  EyeOff, 
  ArrowRightLeft, 
  Link as LinkIcon, 
  CheckCircle2, 
  UserCog,
  FileText,
  ShieldCheck,
  Layers,
  Network
} from 'lucide-react';

const dagre = ((dagreLib as any).default || dagreLib) as typeof dagreLib;

interface CaseGraphViewProps {
  nodes: GraphNodeData[];
  edges: GraphEdgeData[];
  onSelectNode: (node: GraphNodeData) => void;
  selectedNodeId?: string;
}

const EVENT_CONFIG: Record<string, { 
  border: string; 
  bg: string; 
  text: string; 
  badgeBg: string;
  badgeText: string;
  icon: React.FC<{ size?: number; className?: string }>;
  label: string;
}> = {
  UPLOAD: { border: 'border-blue-300', bg: 'bg-blue-50/70', text: 'text-blue-900', badgeBg: 'bg-blue-100', badgeText: 'text-blue-800', icon: FilePlus, label: 'Evidence Uploaded' },
  UPLOADED: { border: 'border-blue-300', bg: 'bg-blue-50/70', text: 'text-blue-900', badgeBg: 'bg-blue-100', badgeText: 'text-blue-800', icon: FilePlus, label: 'Evidence Uploaded' },
  OCR_COMPLETE: { border: 'border-indigo-300', bg: 'bg-indigo-50/70', text: 'text-indigo-900', badgeBg: 'bg-indigo-100', badgeText: 'text-indigo-800', icon: Scan, label: 'OCR Processed' },
  NER_COMPLETE: { border: 'border-sky-300', bg: 'bg-sky-50/70', text: 'text-sky-900', badgeBg: 'bg-sky-100', badgeText: 'text-sky-800', icon: Scan, label: 'Entities Extracted' },
  REDACTED: { border: 'border-amber-300', bg: 'bg-amber-50/70', text: 'text-amber-900', badgeBg: 'bg-amber-100', badgeText: 'text-amber-800', icon: EyeOff, label: 'Statutory Redacted' },
  TRANSFERRED: { border: 'border-purple-300', bg: 'bg-purple-50/70', text: 'text-purple-900', badgeBg: 'bg-purple-100', badgeText: 'text-purple-800', icon: ArrowRightLeft, label: 'Custody Handover' },
  ANCHORED: { border: 'border-emerald-300', bg: 'bg-emerald-50/70', text: 'text-emerald-900', badgeBg: 'bg-emerald-100', badgeText: 'text-emerald-800', icon: LinkIcon, label: 'Polygon Anchored' },
  VERIFIED: { border: 'border-emerald-400', bg: 'bg-emerald-50/90', text: 'text-emerald-900', badgeBg: 'bg-emerald-100', badgeText: 'text-emerald-800', icon: CheckCircle2, label: 'Chain Verified' },
  ROLE_CHANGE: { border: 'border-rose-300', bg: 'bg-rose-50/70', text: 'text-rose-900', badgeBg: 'bg-rose-100', badgeText: 'text-rose-800', icon: UserCog, label: 'Role Assigned' },
  VIEWED: { border: 'border-slate-300', bg: 'bg-slate-50', text: 'text-slate-800', badgeBg: 'bg-slate-100', badgeText: 'text-slate-700', icon: FileText, label: 'Record Accessed' },
  ACCESSED: { border: 'border-slate-300', bg: 'bg-slate-50', text: 'text-slate-800', badgeBg: 'bg-slate-100', badgeText: 'text-slate-700', icon: FileText, label: 'Record Accessed' },
  ACCESS_DENIED: { border: 'border-red-400', bg: 'bg-red-50/80', text: 'text-red-900', badgeBg: 'bg-red-100', badgeText: 'text-red-800', icon: EyeOff, label: 'Access Denied' },
  DOWNLOADED: { border: 'border-teal-300', bg: 'bg-teal-50/70', text: 'text-teal-900', badgeBg: 'bg-teal-100', badgeText: 'text-teal-800', icon: FileText, label: 'Court Export' },
  VERSION_CREATED: { border: 'border-blue-300', bg: 'bg-blue-50/70', text: 'text-blue-900', badgeBg: 'bg-blue-100', badgeText: 'text-blue-800', icon: FilePlus, label: 'Version Sealed' },
};

export const CaseGraphView: React.FC<CaseGraphViewProps> = ({
  nodes,
  edges,
  onSelectNode,
  selectedNodeId,
}) => {
  const [viewMode, setViewMode] = useState<'pipeline' | 'dag'>('pipeline');

  // Group nodes by document lane for the Pipeline view (Option A)
  const groupedLanes = useMemo(() => {
    if (!nodes || nodes.length === 0) return [];

    const laneMap = new Map<string, GraphNodeData[]>();
    nodes.forEach((node) => {
      const laneKey = node.lane || 'General Case Records';
      if (!laneMap.has(laneKey)) {
        laneMap.set(laneKey, []);
      }
      laneMap.get(laneKey)!.push(node);
    });

    return Array.from(laneMap.entries()).map(([laneName, laneNodes]) => {
      // Find initial upload event if available
      const uploadNode = laneNodes.find(
        (n) => n.type === 'UPLOAD' || n.type === 'UPLOADED'
      );
      const isFullyAnchored = laneNodes.some((n) => n.anchored || n.type === 'ANCHORED');
      const isVerified = laneNodes.some((n) => n.type === 'VERIFIED');

      return {
        laneName,
        uploadNode,
        isFullyAnchored,
        isVerified,
        nodes: laneNodes,
      };
    });
  }, [nodes]);

  // Dagre layout for interactive flow graph (Option B)
  const { positionedNodes, positionedEdges, graphDimensions } = useMemo(() => {
    if (!nodes || nodes.length === 0) {
      return { positionedNodes: [], positionedEdges: [], graphDimensions: { width: 800, height: 400 } };
    }

    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: 'TB', nodesep: 40, ranksep: 60 });
    g.setDefaultEdgeLabel(() => ({}));

    const nodeWidth = 220;
    const nodeHeight = 80;

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
        height: Math.max((graphInfo.height || 0) + 120, 500),
      },
    };
  }, [nodes, edges]);

  return (
    <div className="space-y-4">
      {/* Top Controls & View Mode Toggle */}
      <div className="flex flex-wrap justify-between items-center bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-50 text-[#0b2247] border border-blue-200">
            <ShieldCheck size={18} />
          </div>
          <div>
            <h3 className="font-serif font-bold text-sm text-[#0b2247]">
              Statutory Chain-of-Custody & Evidence Lifecycle
            </h3>
            <p className="text-[11px] text-slate-500">
              Cryptographic integrity records sealed under Section 65B of the Indian Evidence Act
            </p>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setViewMode('pipeline')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition ${
              viewMode === 'pipeline'
                ? 'bg-white text-[#0b2247] shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers size={14} /> Evidence Pipelines
          </button>
          <button
            onClick={() => setViewMode('dag')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition ${
              viewMode === 'dag'
                ? 'bg-white text-[#0b2247] shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Network size={14} /> DAG Topology
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: Evidence Pipeline Stepper (Option A) */}
      {viewMode === 'pipeline' && (
        <div className="space-y-4">
          {groupedLanes.map((lane, idx) => (
            <div
              key={lane.laneName || idx}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs transition hover:border-slate-300"
            >
              {/* Document Pipeline Header */}
              <div className="flex flex-wrap justify-between items-center pb-3 mb-4 border-b border-slate-100 gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#0b2247]/5 text-[#0b2247] border border-[#0b2247]/10">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      {lane.uploadNode?.label || lane.laneName}
                    </h4>
                    <span className="text-[11px] font-mono text-slate-400">
                      Evidence ID: {lane.laneName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {lane.isFullyAnchored && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <LinkIcon size={12} /> Polygon Amoy #1420984
                    </span>
                  )}
                  {lane.isVerified && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      <CheckCircle2 size={12} /> Verified Intact
                    </span>
                  )}
                </div>
              </div>

              {/* Sequential Stepper Chain */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {lane.nodes.map((node, nIdx) => {
                  const config = EVENT_CONFIG[node.type] || EVENT_CONFIG.UPLOAD;
                  const IconComponent = config.icon;
                  const isSelected = selectedNodeId === node.id;

                  return (
                    <div
                      key={node.id}
                      onClick={() => onSelectNode(node)}
                      className={`relative cursor-pointer p-3 rounded-lg border transition-all duration-150 flex flex-col justify-between ${
                        config.bg
                      } ${config.border} ${
                        isSelected
                          ? 'ring-2 ring-[#0b2247] shadow-md scale-[1.02]'
                          : 'hover:shadow-sm hover:border-slate-400'
                      }`}
                    >
                      {/* Step index pill */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${config.badgeBg} ${config.badgeText}`}>
                            #{nIdx + 1}
                          </span>
                          <span className="text-[11px] font-bold text-slate-900 truncate">
                            {config.label}
                          </span>
                        </div>
                        <IconComponent size={14} className={config.badgeText} />
                      </div>

                      {/* Event details */}
                      <div className="space-y-1 text-[11px]">
                        <div className="text-slate-700 font-medium truncate">
                          {node.label}
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
                          <span className="truncate max-w-[100px]">{node.actor}</span>
                          <span className="font-mono text-[9px] bg-white px-1 py-0.5 rounded border border-slate-200">
                            {node.hash ? `${node.hash.slice(0, 6)}...` : 'pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW MODE 2: Clean Light-Themed DAG Flow (Option B) */}
      {viewMode === 'dag' && (
        <div className="w-full overflow-auto bg-slate-50 border border-slate-200 rounded-xl p-6 min-h-[420px] shadow-xs">
          <svg
            width={graphDimensions.width}
            height={graphDimensions.height}
            style={{ minWidth: `${graphDimensions.width}px`, minHeight: `${graphDimensions.height}px` }}
            className="block mx-auto"
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
                <path d="M 0 1 L 8 5 L 0 9 z" fill="#94a3b8" />
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
                  stroke="#cbd5e1"
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
                    className={`w-full h-full p-2.5 rounded-lg border bg-white cursor-pointer transition-all duration-150 flex flex-col justify-between ${
                      config.border
                    } ${
                      isSelected
                        ? 'ring-2 ring-[#0b2247] shadow-lg scale-[1.02]'
                        : 'shadow-2xs hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 overflow-hidden">
                        <div className={`p-1 rounded ${config.badgeBg} ${config.badgeText}`}>
                          <IconComponent size={13} />
                        </div>
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {node.label}
                        </span>
                      </div>
                      {node.anchored && (
                        <span className="flex items-center gap-0.5 text-[9px] px-1 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                          <LinkIcon size={9} />
                          Amoy
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1">
                      <span className="truncate max-w-[100px]">{node.actor}</span>
                      <span className="font-mono text-[9px] bg-slate-50 px-1 py-0.5 rounded border border-slate-200">
                        {node.hash ? `${node.hash.slice(0, 6)}...` : 'pending'}
                      </span>
                    </div>
                  </div>
                </foreignObject>
              );
            })}
          </svg>
        </div>
      )}
    </div>
  );
};