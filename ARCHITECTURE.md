# VocalGrade AI — System Architecture Document
**Author:** Saad Iqbal Chavhan  
**Target:** SWE Technical Evaluation (Livo AI)  
**Deployment Context:** Ephemeral Multi-modal Inference Framework  

---

## 1. Component Architecture & System Topography

VocalGrade AI is built on a serverless, decoupled architecture designed for low latency, client-side safety validation, and automated compute teardowns.
Client Web Browser (Next.js SPA)]
│
│ (1) Local Audio File Integrity & Constraints Check (30-45s)
▼
[Serverless API Execution Node (Vercel Edge/Node.js Runtime)]
│
│ (2) Volatile RAM Buffer Object (Zero Disk Writes)
▼
[Google Multimodal Cloud Model Mesh (Gemini 3.1 Flash-Lite)]
│
│ (3) High-Speed Ephemeral Inference Mapping
▼
[JSON Metadata Structured Data Output Payload]
│
│ (4) Telemetry Engine Parsing & Token Render Loop
▼
[Client Interface View Update (UI Updates / Component Refresh)]
### Component Breakdown:
1. **Client Single Page Application (Next.js + Tailwind CSS):** Handles hardware validation (Web Audio API) to ensure zero unauthorized payload sizes reach the serverless infrastructure. Includes a custom pipeline UX interstitial to showcase candidate engineering profiles during transport.
2. **Serverless API Layer (Vercel Node.js Runtime):** Instantiates runtime instances *inside* the execution frame to prevent state leaks or credential loss across cold starts.
3. **Multimodal Inference Node (Google Gemini API):** Operates on the high-concurrency `gemini-3.1-flash-lite` engine to calculate pronunciation metrics and phonetic breakdowns under tight latency boundaries.

---

## 2. Model Selection & Rationale

| Selected Core Model | Considered Alternatives | Strategic Engineering Rationale |
| :--- | :--- | :--- |
| **Gemini 3.1 Flash-Lite** | Whisper Large + Claude 3.5 Sonnet Pipeline | **Consolidated Pipe:** Combining separate STT models with downstream LLM assessors doubles latency and costs. Flash-Lite processes multi-modal audio directly in a single context block, dropping response latency down to **~4.8 seconds**. |
| **Gemini 3.1 Flash-Lite** | Gemini 3.5 Flash | **Free Tier Stability:** While the standard Flash tier frequently hits global server saturation (HTTP 503 Spikes), the Flash-Lite engine delivers reliable, low-congestion public channels without performance degrading. |

---

## 3. Pronunciation Evaluation & Structured Diagnostics

* **Audio Processing:** Raw binary streams are extracted, converted cleanly to a memory-isolated Base64 block, and evaluated natively by the model using structural scoring prompts.
* **Deterministic Contract Enforcement:** The backend enforces a strict structural JSON schema via the SDK configuration layer. The model is constrained to map sequential words back into an exact object model matching individual error fields:
  * `None`: Perfect phonetic alignment (Green Badge).
  * `Mispronunciation`: Accent variation or structural distortion (Amber Badge).
  * `Omission`: Dropped vocabulary segments or missing speech frames (Red Strikethrough Badge).

---

## 4. DPDP Act 2023 Compliance Framework

Compliance is engineered into the system topology as a foundational element, not handled as an afterthought:

* **Informed Consent Lifecycle:** The core application loop features a strict, blocking interaction barrier. No telemetry data is streamed, read, or generated unless the user checks the explicit DPDP authorization token.
* **Zero Persistent Footprint (Data Minimization):** The platform maintains no database connections, file logs, caching arrays, or block storage mounts. Audio content is stored strictly in volatile RAM as an array buffer.
* **Immediate Purging:** Once the multi-modal payload finishes execution and returns the JSON diagnostics, the RAM memory spaces are immediately cleared out by the runtime engine's native garbage collector. The retention window is precisely equal to the request execution duration (~4.8s).
* **Residency & Sovereignty:** In production deployment environments, execution frames default to regional localization edges to honor sovereign border requirements.

---

## 5. Explicit Engineering Trade-offs

1. **Omission of Analytics & Logging:** To maintain an airtight, zero-retention privacy posture under the DPDP Act 2023, standard error-tracking telemetry and request logging are completely omitted by design.
2. **Stateless Progress Engine:** Users cannot save their scores over time natively. Building a progress dashboard would require persistent cloud databases, introducing storage compliance risks under Indian data protection laws.

### What to Build Next (Next-Week Roadmap)
If allocated an additional week of development time, the following features would be implemented:
* **Localized Audio Processing (WebAssembly):** Compile an optimized on-device phonetic scoring matrix directly in the user's browser using WASM. This would drop network latency to zero and provide absolute privacy, since data would never leave the client's local computer.
