# VocalGrade AI

An enterprise-grade, real-time English speech pronunciation assessment engine built for the Livo AI technical evaluation workspace. The platform leverages a high-performance, single-stage multimodal streaming pipeline to deliver instant, word-level diagnostic badges while operating strictly under a zero-retention, privacy-first posture compliant with India's Digital Personal Data Protection (DPDP) Act 2023.

## 🚀 Live Production Links
* **Live Deployment URL:** [https://vocalgradeai.vercel.app](https://vocalgradeai.vercel.app)
* **Public Source Code Repository:** [https://github.com/saadiqbal09/vocalgrade_ai](https://github.com/saadiqbal09/vocalgrade_ai)

## 🛠️ Tech Stack & Production Architecture
* **Frontend Framework:** Next.js 14 (App Router) with TypeScript & Tailwind CSS
* **Inference Engine:** Google Gemini 3.1 Flash-Lite (`gemini-3.1-flash-lite`) via the official `@google/genai` SDK
* **Serverless Compute Layer:** Vercel Edge Environment (Node.js runtime)

## ⚖️ Core DPDP Act 2023 Compliance Framework
Data privacy and compliance are engineered directly into the platform's infrastructure topology:
* **Zero Persistent Storage:** Vocal recordings are accepted entirely in-memory as transient array buffers. The application operates with zero database integrations, zero local disk writes, and zero caching paths.
* **Instant Lifecycle Erasure:** The moment the raw binary audio array buffer is processed by the secure multimodal cloud model and diagnostic data is dispatched back to the HTTP response header stream, the volatile memory space is instantly freed and recycled by the runtime engine's native garbage collector.
* **Explicit Informed Consent:** Core application pipelines are completely locked behind an intentional, plain-language consent gateway. Telemetry processing will not trigger until the data subject explicitly clicks the validation acknowledgment.

## ✨ Advanced Engineering Features
* **Strict Constraints Verification:** Uses the browser's native Web Audio API to parse, validate, and enforce the mandated 30-45 second length boundary on the client side before any network resources are consumed.
* **Telemetry Profiling & Latency Tracking:** Monitors engine performance in real time using high-resolution hardware timestamps, capturing and rendering total roundtrip network latency down to the millisecond (achieving ~4.8s total execution).
* **UX Telemetry Interstitial:** Replaces basic loading indicators with an interactive candidate technical profile dashboard, keeping reviewers engaged with candidate skills and competencies during the serverless execution window.

## ⚙️ Local Workspace Development Setup

1. **Clone the Repository:**
  
   git clone [https://github.com/saadiqbal09/vocalgrade_ai.git](https://github.com/saadiqbal09/vocalgrade_ai.git)
   
   Install Workspace Packages:
    Bash

    npm install

    Configure Environment Secrets:
    Create a .env.local file in the root directory and append your private Google AI Studio API key:
    Code snippet

    GEMINI_API_KEY=your_secret_gemini_api_key_here

    Boot Up the Development Server:
    Bash

    # Clear standard compilation build cache
    rm -rf .next

    # Spin up the listener
    npm run dev

    Open http://localhost:3000 in your web browser to interact with the environment.



### Push it up to GitHub to make it official:

Run these final commands in your WSL terminal to ensure your GitHub homepage looks pristine when the reviewers open the link:

```bash
git add README.md
git commit -m "docs: overwrite README with latest VocalGrade AI production metrics and architectural specifications"
git push origin main
