import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import type {
  GraphPayload,
  GraphNodeData,
  User,
  RedactionBox,
  UserRole,
  CaseDossier,
} from '../api/types';
import { mockUsers, mockCaseDossier } from '../api/mockClient';
import { GovHeader } from '../components/GovHeader';
import { CaseDossierView } from '../components/CaseDossierView';
import { CaseGraphView } from '../components/CaseGraphView';
import { NodeInspector } from '../components/NodeInspector';
import { DocumentViewer } from '../components/DocumentViewer';
import { UploadPanel } from '../components/UploadPanel';
import { AuditLogView } from '../components/AuditLogView';
import {
  GitCommit,
  ShieldCheck,
  ArrowLeft,
  Filter,
  FileSpreadsheet,
  FolderOpen,
  Activity
} from 'lucide-react';

export const CaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const caseId = id || 'FIR-2026-0417';

  const [currentRole, setCurrentRole] = useState<UserRole>('officer');
  const [currentUser, setCurrentUser] = useState<User>(mockUsers.officer);
  const [dossier, setDossier] = useState<CaseDossier>(mockCaseDossier);
  const [graphData, setGraphData] = useState<GraphPayload | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNodeData | null>(null);
  const [redactionBoxes, setRedactionBoxes] = useState<RedactionBox[]>([]);
  const [isAnchoring, setIsAnchoring] = useState(false);
  const [tampered, setTampered] = useState(false);
  
  // Navigation Menu (Replaces nested tabs)
  const [activeMenu, setActiveMenu] = useState<'dossier' | 'vault' | 'graph' | 'audit'>('dossier');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');

  useEffect(() => {
    setCurrentUser(mockUsers[currentRole]);
  }, [currentRole]);

  useEffect(() => {
    api.getCaseDossier(caseId).then(setDossier);
    api.getCaseGraph(caseId).then((data) => {
      setGraphData(data);
    });
    api.getDocumentRedactions('doc-fir-001').then(setRedactionBoxes);
  }, [caseId]);

  const filteredNodes = useMemo(() => {
    if (!graphData) return [];
    if (selectedTypeFilter === 'ALL') return graphData.nodes;
    return graphData.nodes.filter((n) => n.type === selectedTypeFilter);
  }, [graphData, selectedTypeFilter]);

  const filteredEdges = useMemo(() => {
    if (!graphData) return [];
    if (selectedTypeFilter === 'ALL') return graphData.edges;
    const visibleNodeIds = new Set(filteredNodes.map((n) => n.id));
    return graphData.edges.filter(
      (e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target)
    );
  }, [graphData, filteredNodes, selectedTypeFilter]);

  const handleUploadSimulate = (fileName: string) => {
    if (!graphData) return;
    const docId = `doc-evid-${Date.now().toString().slice(-3)}`;
    const uploadId = `node-${Date.now()}`;
    const ocrId = `node-${Date.now() + 1}`;

    const newNodes: GraphNodeData[] = [
      ...graphData.nodes,
      {
        id: uploadId,
        lane: docId,
        type: 'UPLOAD',
        label: `${fileName} Seized & Filed`,
        actor: currentUser.name,
        timestamp: new Date().toISOString(),
        hash: '9f83c6b412fa09de53acb8896172ba21',
        anchored: false,
        tags: ['New Evidence', 'Pending Amoy Seal'],
      },
      {
        id: ocrId,
        lane: docId,
        type: 'OCR_COMPLETE',
        label: 'OCR & PII Extraction',
        actor: 'LexVault-AI',
        timestamp: new Date().toISOString(),
        hash: '3a7b9c10825ebfdc721998341ad90241',
        anchored: false,
        tags: ['Processed'],
      },
    ];

    setGraphData({
      nodes: newNodes,
      edges: [
        ...graphData.edges,
        { id: `edge-${uploadId}-${ocrId}`, source: uploadId, target: ocrId },
      ],
    });
  };

  const handleAnchorSimulate = () => {
    if (!graphData) return;
    setIsAnchoring(true);
    setTimeout(() => {
      setGraphData({
        ...graphData,
        nodes: graphData.nodes.map((n) => ({ ...n, anchored: true })),
      });
      setIsAnchoring(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col h-screen bg-[#f4f6f9] text-slate-900 font-sans overflow-hidden">
      <GovHeader
        currentUser={currentUser}
        onSelectRole={setCurrentRole}
        tampered={tampered}
        onToggleTamper={() => setTampered(!tampered)}
      />

      {/* Sub-Header / Case Context Bar */}
      <div className="bg-white border-b border-slate-300 px-6 py-2.5 flex justify-between items-center shrink-0 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/cases')}
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            <ArrowLeft size={14} /> Docket Register
          </button>
          <div className="h-4 w-px bg-slate-300" />
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-sm text-[#0b2247]">{dossier.firNumber}</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              {dossier.status}
            </span>
          </div>
          <span className="text-xs text-slate-500">
            {dossier.policeStation}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {currentUser.role !== 'auditor' && (
            <UploadPanel
              onUploadSimulate={handleUploadSimulate}
              onAnchorSimulate={handleAnchorSimulate}
              isAnchoring={isAnchoring}
            />
          )}
        </div>
      </div>

      {/* Main Split Layout: Left Navigation + Right Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Side Navigation Menu */}
        <aside className="w-64 bg-white border-r border-slate-300 flex flex-col shrink-0 p-3 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400 px-3 py-1.5 tracking-wider">
            Case Navigation
          </div>

          <button
            onClick={() => setActiveMenu('dossier')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded text-xs font-semibold transition ${
              activeMenu === 'dossier'
                ? 'bg-[#0b2247] text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <FolderOpen size={16} /> Investigation Dossier & Diary
          </button>

          <button
            onClick={() => setActiveMenu('vault')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded text-xs font-semibold transition ${
              activeMenu === 'vault'
                ? 'bg-[#0b2247] text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck size={16} /> Scanned Vault & Redactions
          </button>

          <button
            onClick={() => setActiveMenu('graph')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded text-xs font-semibold transition ${
              activeMenu === 'graph'
                ? 'bg-[#0b2247] text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <GitCommit size={16} /> Visual Custody Graph
          </button>

          <button
            onClick={() => setActiveMenu('audit')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded text-xs font-semibold transition ${
              activeMenu === 'audit'
                ? 'bg-[#0b2247] text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <FileSpreadsheet size={16} /> Court Legal Audit Ledger
          </button>

          {/* Quick Stats Panel in Sidebar */}
          <div className="mt-auto pt-4 border-t border-slate-200 text-xs space-y-2 text-slate-600 px-1">
            <div className="text-[10px] uppercase font-bold text-slate-400">Ledger Status</div>
            <div className="flex justify-between items-center text-[11px]">
              <span>Amoy Proofs:</span>
              <span className="font-bold text-emerald-700">Validated</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span>Chain Events:</span>
              <span className="font-mono font-bold text-slate-900">{graphData?.nodes.length || 0}</span>
            </div>
          </div>
        </aside>

        {/* Central Dynamic Workspace */}
        <main className="flex-1 overflow-y-auto p-6 min-h-0 bg-[#f8fafc]">
          {activeMenu === 'dossier' && (
            <CaseDossierView dossier={dossier} user={currentUser} />
          )}

          {activeMenu === 'vault' && (
            <DocumentViewer
              documentTitle={`Official Police Record (${caseId}-FIR01.pdf)`}
              boxes={redactionBoxes}
              canUnredact={currentUser.role === 'officer' || currentUser.role === 'supervisor'}
            />
          )}

          {activeMenu === 'graph' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-white p-3 border border-slate-300 rounded shadow-2xs">
                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-[#0b2247]" />
                  <span className="text-xs font-bold text-slate-800">
                    Visual Evidence Provenance DAG (Click any node to open cryptographic inspector)
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 flex items-center gap-1 font-medium">
                    <Filter size={12} /> Filter Events:
                  </span>
                  <select
                    value={selectedTypeFilter}
                    onChange={(e) => setSelectedTypeFilter(e.target.value)}
                    className="border border-slate-300 rounded px-2 py-1 bg-white text-xs text-slate-700"
                  >
                    <option value="ALL">All Events ({graphData?.nodes.length || 0})</option>
                    <option value="UPLOAD">UPLOAD</option>
                    <option value="OCR_COMPLETE">OCR_COMPLETE</option>
                    <option value="REDACTED">REDACTED</option>
                    <option value="ANCHORED">ANCHORED</option>
                  </select>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 shadow-inner">
                {graphData && (
                  <CaseGraphView
                    nodes={filteredNodes}
                    edges={filteredEdges}
                    onSelectNode={setSelectedNode}
                    selectedNodeId={selectedNode?.id}
                  />
                )}
              </div>
            </div>
          )}

          {activeMenu === 'audit' && (
            <AuditLogView nodes={graphData?.nodes || []} caseId={caseId} />
          )}
        </main>

        {/* Modal Inspector Drawer (Appears only when a node is clicked) */}
        <NodeInspector
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
          isTampered={tampered}
        />
      </div>
    </div>
  );
};