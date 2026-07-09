# VocalGrade AI — System Architecture

*Livo AI Technical Assessment — Saad Iqbal Chavhan*

## 1. Components and Data Flow

```
Browser (Client)          Next.js API Route         Gemini API              Results
Next.js UI          →     (Vercel serverless)   →   (gemini-3.1-flash-lite) → rendered
Audio upload +             In-memory audio            Scores audio,           in browser
duration check              buffer only                returns JSON
                                                                                  │
                                                                                  ▼
                                                                    buffer discarded after
                                                                    response (no disk / DB)
```

The app has three parts: a Next.js frontend that captures and validates audio in the browser, a Next.js API route (running as a Vercel serverless function) that acts as a thin proxy, and the Gemini API that performs the actual scoring. There is no database and no file storage anywhere in the flow. Audio exists only as an in-memory buffer for the duration of a single request, then is discarded when the function invocation ends.

## 2. Models and APIs Used, and Why

**Model:** Google Gemini (`gemini-3.1-flash-lite`), called via the `@google/genai` SDK from the API route.

Why this over a dedicated pronunciation-assessment API (e.g. Azure AI Speech Pronunciation Assessment): a purpose-built pronunciation API would give more precise phoneme-level scoring out of the box. I chose Gemini instead because it accepts audio directly as a multimodal input and can be constrained to return a structured JSON schema (score plus per-word error tags) in a single call, which meant no separate STT step, no phoneme-alignment library, and a much smaller integration surface to build and test within the assessment timeline. The trade-off is that the scoring is LLM-judged rather than derived from a dedicated acoustic model, so it is less precise at the phoneme level than a purpose-built pronunciation API would be.

## 3. Scoring and Highlighting Methodology

- The API route sends the raw audio buffer to Gemini with a prompt instructing it to act as a pronunciation evaluator and return a fixed JSON schema: an overall pronunciation score, an accuracy score, and a word-by-word array with each word's text, a confidence/accuracy value, and an error tag (none, mispronunciation, or omission).
- The JSON schema is enforced on the API call so the response is always structured and parseable, rather than free-form text that would need separate parsing/regex.
- The frontend maps each word's error tag directly to a highlight color: green for no issue, amber for mispronunciation, red with strikethrough for an omitted/skipped word. Hovering a word shows its confidence score and error type.
- This means the model itself decides what counts as a mistake; there is no separate rules-based scoring layer. That is a deliberate simplification given the timeline (see Trade-offs).

## 4. DPDP Act 2023 Compliance

**Storage:** None. Audio is held only as an in-memory buffer inside the serverless function for the duration of one request. It is never written to disk, a database, or any cache.

**Retention:** Zero. The buffer is released when the function returns its response, which is typically within a few seconds. There is no retention period to configure because nothing is persisted.

**Consent:** The user must check an explicit, plain-language consent box before the submit button is enabled. No audio is uploaded until consent is given.

**Data residency:** This is a known limitation of the current build: audio is sent to Google's Gemini API, which processes requests on Google's general-purpose infrastructure rather than a guaranteed India-region endpoint. A production version handling real user data under DPDP would need to move to Vertex AI with an India region configured, or a self-hosted/India-hosted model, to make a firm data-residency guarantee rather than relying on the public Gemini API's default routing.

**Deletion:** Not applicable in the traditional sense — since nothing is stored, there is no user data to locate or delete. This also means there is currently no way for a user to request deletion of past results, because past results do not exist anywhere after the response is shown once.

## 5. Trade-offs and What I'd Build Next

- Chose a general multimodal model (Gemini) with JSON-schema enforcement over building a custom STT + phoneme-alignment pipeline, to fit the assessment timeline. Trade-off: lower scoring precision than a purpose-built pronunciation API, in exchange for a much smaller, faster-to-build integration.
- No user accounts, no history, fully stateless per request. This keeps the compliance story simple and honest, but means a learner can't track improvement over time — the single biggest feature gap versus a real product.
- With another week: move audio processing to an India-region endpoint for a real data-residency guarantee; add opt-in, explicitly consented history storage (with a user-facing deletion control) for learners who want progress tracking; add a fallback scoring path in case the Gemini API is rate-limited or unavailable; and replace LLM-judged scoring with a hybrid approach — a dedicated phoneme-alignment model for the numeric score, with the LLM used only to generate human-readable explanations of each flagged word.
