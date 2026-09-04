export type CustodyEventType =
  | 'UPLOAD'
  | 'UPLOADED'
  | 'OCR_COMPLETE'
  | 'NER_COMPLETE'
  | 'REDACTED'
  | 'VIEWED'
  | 'ACCESSED'
  | 'ACCESS_DENIED'
  | 'DOWNLOADED'
  | 'TRANSFERRED'
  | 'ANCHORED'
  | 'VERIFIED'
  | 'ROLE_CHANGE'
  | 'VERSION_CREATED';

export type UserRole = 'officer' | 'supervisor' | 'forensic' | 'auditor' | 'admin';

export interface User {
  id: string;
  name: string;
  badgeNumber?: string;
  role: UserRole;
  designation?: string;
  policeStation?: string;
  username?: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  role: UserRole;
  name: string;
  user_id: string;
}

export interface CaseSummary {
  id: string;
  title: string;
  status: string;
  created_by?: string;
  creator_name?: string;
  created_at?: string;
  station?: string;
  acts?: string;
  documentsCount?: number;
  lastAction?: string;
  priority?: string;
  dossier?: CaseDossier;
}

export interface CaseCreatePayload {
  title: string;
  dossier?: CaseDossier;
}

export interface DocumentItem {
  id: string;
  case_id: string;
  filename: string;
  storage_key: string;
  sha256: string;
  mime: string;
  size: number;
  uploaded_by: string;
  uploaded_at: string;
  current_version: number;
}

export interface CaseDossier {
  firNumber: string;
  policeStation: string;
  district: string;
  actsSections: string[];
  dateOfOccurrence: string;
  dateReported: string;
  investigatingOfficer: string;
  status: 'Under Investigation' | 'Charge Sheeted' | 'Closed';
  complainant: {
    name: string;
    contact: string;
    address: string;
  };
  victim: {
    alias: string;
    age: number;
    gender: string;
    isProtected: boolean;
    maskedIdentityRef: string;
  };
  suspects: Array<{
    name: string;
    alias: string;
    status: 'Arrested' | 'Absconding' | 'Under Interrogation' | 'Notice Served (Sec 41A)';
    details: string;
  }>;
  diaryEntries: Array<{
    dayNumber: number;
    date: string;
    time: string;
    activity: string;
    conductedBy: string;
    outcome: string;
  }>;
  propertyRegister: Array<{
    propertyId: string;
    description: string;
    seizedFrom: string;
    custodyLocation: 'Malkhana Store' | 'Forensic Science Lab (FSL)' | 'Court Safe';
    sealIntact: boolean;
  }>;
}

export interface GraphNodeData {
  id: string;
  lane: string;
  type: CustodyEventType;
  label: string;
  actor: string;
  timestamp: string;
  hash: string;
  anchored: boolean;
  tags: string[];
}

export interface GraphEdgeData {
  id: string;
  source: string;
  target: string;
}

export interface GraphPayload {
  nodes: GraphNodeData[];
  edges: GraphEdgeData[];
}

export interface RedactionBox {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  reason: string;
  confidence: number;
  entity_id: string;
}

export interface VerificationResult {
  valid: boolean;
  merkle_root?: string;
  tx_hash?: string;
  block_number?: number;
  chain_id?: number | string;
  proof?: string[];
  explorer_url?: string;
  reason?: string;
}

export interface CaseChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  citations?: Array<{ docId?: string; filename: string; page?: number }>;
  confidence?: number;
}

export interface CaseChatResponse {
  answer: string;
  citations?: Array<{ docId?: string; filename: string; page?: number }>;
  confidence?: number;
}