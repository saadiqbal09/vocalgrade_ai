# VocalGrade AI

An English pronunciation assessment web app built for the Livo AI technical evaluation. Users upload a 30-45 second audio clip and get a pronunciation score with word-level feedback on what went wrong. Built with a zero-storage architecture to keep DPDP Act 2023 compliance simple and real, not just documented.

## Live Links

- **Live app:** https://vocalgradeai.vercel.app
- **Source code:** https://github.com/saadiqbal09/vocalgrade_ai

## Tech Stack

- **Frontend/Backend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Speech scoring:** Google Gemini (`gemini-3.1-flash-lite`) via the `@google/genai` SDK
- **Hosting:** Vercel (Node.js runtime)

## How It Works

1. User records or uploads an audio clip (30-45 seconds, enforced client-side via the Web Audio API before upload).
2. The audio is sent to the backend as an in-memory buffer — never written to disk or a database.
3. The buffer is passed to Gemini, which returns a structured score (accuracy, fluency) plus word-level tags (correct / mispronounced / unclear).
4. Results are rendered in the browser. The audio buffer is discarded immediately after the response is sent — nothing is retained.

## DPDP Act 2023 Compliance

- **No storage:** Audio exists only as an in-memory buffer during the request. No database, no disk writes, no caching of raw audio.
- **Immediate deletion:** Once the response is sent back to the browser, the buffer is released and garbage collected. There is nothing to manually delete because nothing persists.
- **Consent:** Users must check a plain-language consent box before the audio is uploaded — no processing happens until they do.

## Notable Engineering Details

- Client-side duration validation (30-45s) before any network call, so invalid files never reach the backend.
- Round-trip latency (upload → score) is measured and shown to the user, typically ~4-5 seconds.

## Local Setup

```bash
git clone https://github.com/saadiqbal09/vocalgrade_ai.git
cd vocalgrade_ai
npm install
```

Create a `.env.local` file in the root with your Gemini API key:

```
GEMINI_API_KEY=your_api_key_here
```

Run the dev server:

```bash
npm run dev
```

Open http://localhost:3000.

## Trade-offs and Next Steps

- Chose a managed multimodal model (Gemini) over building a custom phoneme-alignment pipeline, given the assessment timeline. Trade-off: less control over exactly how errors are classified, in exchange for a much faster, still-defensible build.
- No user accounts or history — every session is stateless by design, which is also what keeps the compliance story simple.
- With more time: add pronunciation history/progress tracking (which would require rethinking the zero-storage model and adding proper consent + retention controls), and a fallback/offline scoring path in case the Gemini API is unavailable.
