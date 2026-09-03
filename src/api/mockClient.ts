import type { GraphPayload, VerificationResult, User, RedactionBox, CaseDossier } from './types';

export const mockUsers: Record<string, User> = {
  officer: {
    id: 'usr-101',
    name: 'Inspector Vikram Sharma',
    badgeNumber: 'DL-POL-4482',
    role: 'officer',
    designation: 'Investigating Officer (IO)',
    policeStation: 'Civil Lines Police Station, Central District',
  },
  supervisor: {
    id: 'usr-102',
    name: 'ACP R. K. Mukherjee',
    badgeNumber: 'IPS-DL-1102',
    role: 'supervisor',
    designation: 'Assistant Commissioner of Police',
    policeStation: 'Central District HQ, Delhi',
  },
  forensic: {
    id: 'usr-103',
    name: 'Dr. Anita Verma',
    badgeNumber: 'FSL-EX-9921',
    role: 'forensic',
    designation: 'Senior Scientific Officer (Cyber & Docs)',
    policeStation: 'State Forensic Science Laboratory (FSL)',
  },
  auditor: {
    id: 'usr-104',
    name: 'Justice K. S. Rao',
    badgeNumber: 'JUD-DEL-041',
    role: 'auditor',
    designation: 'Metropolitan Judicial Magistrate',
    policeStation: 'Tis Hazari Court Complex',
  },
};

export const mockCaseDossier: CaseDossier = {
  firNumber: 'FIR-2026-0417',
  policeStation: 'Civil Lines, Central District',
  district: 'North-Central Delhi',
  actsSections: ['IPC Sec. 354 (Assault on woman)', 'IPC Sec. 452 (House-trespass)', 'BNS Sec. 74'],
  dateOfOccurrence: '2026-09-01 20:30 hrs',
  dateReported: '2026-09-02 09:15 hrs',
  investigatingOfficer: 'Insp. Vikram Sharma (DL-POL-4482)',
  status: 'Under Investigation',
  complainant: {
    name: 'Ramesh Kumar',
    contact: '+91 9810XXXXXX',
    address: 'Qtr No. 42, Type-III, Civil Lines, Delhi',
  },
  victim: {
    alias: 'Victim-A (Protected under Sec. 228A IPC)',
    age: 24,
    gender: 'Female',
    isProtected: true,
    maskedIdentityRef: 'SEALED-IDENTIFIER-VA-994',
  },
  suspects: [
    {
      name: 'Rakesh @ Kallu',
      alias: 'Kallu',
      status: 'Arrested',
      details: 'Apprehended near Kashmere Gate terminal with seized weapon item.',
    },
    {
      name: 'Unknown Accomplice',
      alias: 'Driver of white hatchback',
      status: 'Absconding',
      details: 'Identified via CCTV camera feed at Chhatrasal intersection.',
    },
  ],
  diaryEntries: [
    {
      dayNumber: 1,
      date: '2026-09-02',
      time: '09:30 AM',
      activity: 'FIR Registration & Crime Scene Visit',
      conductedBy: 'Insp. Vikram Sharma',
      outcome: 'Rough site plan prepared. Broken door latch seized for forensic analysis.',
    },
    {
      dayNumber: 2,
      date: '2026-09-02',
      time: '02:00 PM',
      activity: 'Victim Statement Recording (Sec. 161 CrPC)',
      conductedBy: 'Lady SI Priya Malik',
      outcome: 'Statement recorded under cameras; sealed into encrypted document vault.',
    },
    {
      dayNumber: 3,
      date: '2026-09-03',
      time: '11:00 AM',
      activity: 'Apprehension of Suspect #1',
      conductedBy: 'Insp. Vikram Sharma',
      outcome: 'Accused interrogated; memo of arrest executed.',
    },
  ],
  propertyRegister: [
    {
      propertyId: 'PROP-2026-091',
      description: 'CCTV DVR HDD (2TB Seagate - S/N 9924A)',
      seizedFrom: 'Commercial building adjacent to crime spot',
      custodyLocation: 'Forensic Science Lab (FSL)',
      sealIntact: true,
    },
    {
      propertyId: 'PROP-2026-092',
      description: 'Physical Scanned FIR & Witness Statement File',
      seizedFrom: 'Police Station Station House Register',
      custodyLocation: 'Malkhana Store',
      sealIntact: true,
    },
  ],
};

export const mockGraphData: GraphPayload = {
  nodes: [
    {
      id: 'node-1',
      lane: 'FIR Scan (FIR-01)',
      type: 'UPLOAD',
      label: 'Initial FIR Registered',
      actor: 'Insp. V. Sharma',
      timestamp: '2026-09-02T10:00:00Z',
      hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      anchored: true,
      tags: ['FIR Ingestion', 'Malkhana Entry'],
    },
    {
      id: 'node-2',
      lane: 'FIR Scan (FIR-01)',
      type: 'OCR_COMPLETE',
      label: 'Automated OCR & Index',
      actor: 'LexVault-AI Worker',
      timestamp: '2026-09-02T10:00:15Z',
      hash: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
      anchored: true,
      tags: ['Text Extracted'],
    },
    {
      id: 'node-3',
      lane: 'FIR Scan (FIR-01)',
      type: 'REDACTED',
      label: 'Statutory PII Masking',
      actor: 'LexVault-AI Policy',
      timestamp: '2026-09-02T10:00:22Z',
      hash: '4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce',
      anchored: true,
      tags: ['Sec 228A Compliant'],
    },
    {
      id: 'node-4',
      lane: 'FIR Scan (FIR-01)',
      type: 'ANCHORED',
      label: 'Ledger Sealed (Polygon)',
      actor: 'Polygon Amoy Relayer',
      timestamp: '2026-09-02T10:01:00Z',
      hash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
      anchored: true,
      tags: ['Batch #104', 'Tamper Evident'],
    },
  ],
  edges: [
    { id: 'edge-1-2', source: 'node-1', target: 'node-2' },
    { id: 'edge-2-3', source: 'node-2', target: 'node-3' },
    { id: 'edge-3-4', source: 'node-3', target: 'node-4' },
  ],
};

export const mockRedactionBoxes: RedactionBox[] = [
  {
    page: 1,
    x: 0.32,
    y: 0.34,
    width: 0.22,
    height: 0.06,
    reason: 'PROTECTED VICTIM NAME',
    confidence: 0.98,
    entity_id: 'ent-01',
  },
  {
    page: 1,
    x: 0.62,
    y: 0.43,
    width: 0.25,
    height: 0.06,
    reason: 'MOBILE NUMBER',
    confidence: 0.95,
    entity_id: 'ent-02',
  },
  {
    page: 1,
    x: 0.65,
    y: 0.48,
    width: 0.28,
    height: 0.06,
    reason: 'RESIDENTIAL ADDRESS',
    confidence: 0.99,
    entity_id: 'ent-03',
  },
];

export const mockVerify = async (_hash: string): Promise<VerificationResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        valid: true,
        merkle_root: '0x8f3c4e...9b1',
        tx_hash: '0x3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b',
        block_number: 1420984,
        chain_id: 80002,
        proof: ['0x111...', '0x222...'],
        explorer_url: 'https://amoy.polygonscan.com/tx/0x3a4b5c6d7e8f9a0b',
      });
    }, 600);
  });
};