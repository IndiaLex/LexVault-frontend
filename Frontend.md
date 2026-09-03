# IndiaLex · Frontend Developer Handoff Guide

**Repository:** `IndiaLex/lexvault-frontend`  
**Active Branch:** `maria`  
**Stack:** React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Dagre  
**Build Status:** Clean compile (`0` TypeScript errors, `0` lint warnings)

---

## 1. Quick Start

```bash
# Clone the repository
git clone [https://github.com/IndiaLex/lexvault-frontend.git](https://github.com/IndiaLex/lexvault-frontend.git)
cd lexvault-frontend

# Switch to the active development branch
git checkout maria

# Install dependencies
npm install

# Verify production build passes
npm run build

# Start local development server (http://localhost:5173)
npm run dev
```

---

## 2. Environment Configuration (`.env`)

Create a `.env` file in the root of the project:

```env
# Toggle between local mock state and live FastAPI backend
VITE_USE_MOCK=true

# FastAPI Backend base URL
VITE_API_URL=http://localhost:8000
```

* `VITE_USE_MOCK=true`: The portal runs entirely offline using `src/api/mockClient.ts`.
* `VITE_USE_MOCK=false`: Network calls route through `src/api/client.ts` to `http://localhost:8000`.

---

## 3. Directory Layout

```text
src/
├── api/
│   ├── client.ts          # Real fetch client for FastAPI endpoints
│   ├── mockClient.ts      # Offline mock database (cases, zimni diaries, Amoy proofs)
│   ├── index.ts           # Dynamic switcher based on VITE_USE_MOCK
│   └── types.ts           # Shared TypeScript interfaces (Dossier, DAG nodes, RBAC)
├── components/
│   ├── GovHeader.tsx      # MHA/NCRB top navigation + Station Duty Roster switcher
│   ├── CaseDossierView.tsx# FIR summary, Sec. 228A IPC victim card, Zimni diary & Malkhana
│   ├── CaseGraphView.tsx  # GitLens-style visual DAG powered by Dagre
│   ├── NodeInspector.tsx  # Slide-over drawer with SHA-256 hash & Polygon Amoy verification
│   ├── DocumentViewer.tsx # Certified paper record with normalized PII redaction boxes
│   ├── AuditLogView.tsx   # Sec. 65B legal schedule with one-click Court CSV export
│   └── UploadPanel.tsx    # Evidence file ingestion and ledger anchoring trigger
├── pages/
│   ├── CaseListPage.tsx   # State Case Register / Docket search portal (/cases)
│   ├── CaseDetailPage.tsx # Primary case management workspace (/case/:id)
│   └── LoginPage.tsx      # Departmental authentication screen (/login)
├── App.tsx                # Client-side router configuration
└── main.tsx               # Application entry point
```

---

## 4. Implemented Features

* **Station Role-Based Access Control (RBAC):**  
  Switch active roles via the top-right duty roster selector:
  * **Investigating Officer (IO):** Add Zimni diary entries, register seized property, upload evidence, and toggle unredacted records.
  * **Supervisory ACP / SP:** Operational oversight and custody sign-off.
  * **Forensic Specialist (FSL):** Evidence intake and analysis hash tracking.
  * **Judicial Magistrate / Auditor:** Read-only inspection; all write actions (`Upload Evidence`, `Anchor to Polygon`) are automatically hidden.

* **Case Dossier, Zimni Diary & Malkhana:**  
  * *Victim Identity Safeguard:* Enforces Section 228A IPC compliance with masked identifier chips.
  * *Zimni Diary (Sec. 172 Cr.P.C. / Sec. 192 BNSS):* Chronological timeline with an interactive modal to add new daily entries live.
  * *Malkhana Property Register:* Tracks seized exhibits, custody locations (Malkhana Store, FSL, Court Safe), and seal integrity states.

* **Document Vault & PII Masking:**  
  Renders certified paper records with interactive bounding boxes over detected PII. Authorized officers can toggle the unredacted original via the header ribbon.

* **Visual Custody Graph (GitLens DAG):**  
  Renders the evidentiary lifecycle (`UPLOAD` → `OCR_COMPLETE` → `REDACTED` → `ANCHORED`) across parallel document lanes. Clicking any node slides out `NodeInspector` to inspect the canonical SHA-256 hash and verify Merkle proofs against Polygon Amoy.

* **Court Audit Schedule:**  
  High-contrast, legal evidence schedule with one-click Section 65B CSV file export.

* **Out-of-Band Tamper Simulation:**  
  The top-bar tamper toggle simulates a digest mismatch, demonstrating cryptographic audit rejection.

---

## 5. Backend Core Integration Contract

The real client in `src/api/client.ts` expects the following FastAPI endpoints:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/auth/me` | Fetches active user session and role |
| `GET` | `/cases/{case_id}/graph` | Returns nodes (`GraphNodeData[]`) and edges (`GraphEdgeData[]`) |
| `GET` | `/documents/{doc_id}/redactions` | Returns normalized coordinate boxes (`RedactionBox[]`) |
| `POST` | `/cases/{case_id}/documents` | Multipart form file upload (`file: File`) |
| `POST` | `/cases/{case_id}/anchor` | Triggers a Merkle batch anchoring commit |
| `GET` | `/anchors/verify?hash={hash}` | Checks hash against Polygon Amoy and returns proof object |

All data structures are typed in `src/api/types.ts`.

---

## 6. Next Steps for Incoming Developers

1. **Set Up `main` Branch:** Merge branch `maria` into `main` or set `maria` as the default branch on GitHub.
2. **Connect Live API:** Once `lexvault-backend` is running on port 8000, set `VITE_USE_MOCK=false` in `.env` and verify live payload mapping in `src/api/client.ts`.
3. **Live PDF Ingestion:** Replace the static FIR text in `src/components/DocumentViewer.tsx` with a PDF renderer (`react-pdf` / `pdfjs`) streaming from MinIO pre-signed URLs.