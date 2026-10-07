# CARE BLACKBOX — The Black Box for Safer Healthcare

Real-time clinical voice capture, structured event conversion, and hospital memory platform.

CARE BLACKBOX records bedside voice, streams live transcription, converts raw speech into auditable clinical episodes, actions, and executive summaries, and preserves institutional knowledge across sessions, shifts, wards, nurses, and hospitals.

Built with Next.js 14, React 18, Tailwind CSS, AssemblyAI Realtime, and Grok / Groq LLMs (with full local fallback).

## Features

### Black Box Recorder (`/`)
- One-click `START BLACK BOX` capture with pause / resume / stop
- Live audio waveform (32-band voice spectrum + mic level)
- Realtime transcript stream (partial + final segments)
- Session timer, `READY / CONNECTING / LISTENING / PAUSED / COMPLETE` states
- Simulated Voice Capture mode when no API key / mic (demo phrases)
- Session summary modal on stop + JSON export
- Local persistence via `localStorage`

### AI Clinical Intelligence (`/api/analyze`)
- `POST /api/analyze` with `{ transcript, segments }`
- Groq (`gsk_*`) → `https://api.groq.com/openai/v1/chat/completions` (`openai/gpt-oss-120b`)
- xAI fallback → `https://api.x.ai/v1/chat/completions` (`grok-2-latest`)
- Deterministic local clinical parser fallback (no key required)
- Strict rules: no invented facts, explicit `REQUESTED | IN_PROGRESS | COMPLETED | UNCONFIRMED | NOT_STARTED | CANCELLED`, verbatim `sourceTranscript` for every action/event, `CRITICAL` flag for unconfirmed crash-cart etc.
- Output: `episodes[]`, `executiveSummary`, `requiresAttention[]`, `events[]`

### Realtime STT (`/api/assemblyai/token`)
- `GET / POST /api/assemblyai/token` → short-lived AssemblyAI V3 streaming token
- Client streams 16kHz PCM via `wss://streaming.assemblyai.com/v3/ws?token=...&sample_rate=16000`
- `universal-3-5-pro` speech model, `Turn` handling with `end_of_turn`
- Auto-fallback to simulated mode if key missing / socket error

### Dashboard (`/dashboard`)
- Overview: metrics grid + sessions table + `START NEW BLACK BOX SESSION`
- Session detail (`/dashboard/session/[id]`): timeline, transcript, episodes, summary, requires-attention
- Sessions list, export (JSON), settings
- Care Memory (`/dashboard/care-memory`): patterns, critical incidents, shifts, unresolved actions with verbatim evidence quotes
- Nurse Memory (`/dashboard/nurse-memory`) + Hospital Memory (`/dashboard/hospital-memory`): aggregated trends per nurse / unit / ward

## Tech Stack

- `next@14.2.15`, `react@18.3.1`, `typescript@5.6.3`
- `tailwindcss@3.4.14`, `framer-motion@11.11.9`, `lucide-react@0.453.0`
- `ws@8.21.3`, `clsx`, `tailwind-merge`
- AssemblyAI Streaming V3, Groq / xAI Chat Completions

## Project Structure

```
app/
  page.tsx                    # Hero + BlackBoxRecorder
  layout.tsx
  dashboard/
    page.tsx                  # Overview
    session/[id]/page.tsx
    sessions/ care-memory/ nurse-memory/ hospital-memory/ export/ settings/
  api/
    analyze/route.ts          # Groq/xAI + local engine
    assemblyai/token/route.ts # V3 token
components/
  blackbox/ BlackBoxHero.tsx BlackBoxRecorder.tsx AudioWaveform.tsx LiveTranscriptStream.tsx SessionSummaryModal.tsx
  dashboard/ Sidebar.tsx MetricsGrid.tsx SessionsTable.tsx AutoProcessingControl.tsx
  timeline/ EventTimeline.tsx
  transcript/ RawTranscriptViewer.tsx
  ui/ Button.tsx Card.tsx Badge.tsx
lib/
  assemblyai/useRealtimeAudio.ts
  storage/sessions.ts         # localStorage CRUD + aggregateCareMemoryPatterns
types/blackbox.ts             # TranscriptSegment, StructuredEvent, Episode, CareAction, BlackBoxSession, etc.
```

## Getting Started

```bash
git clone https://github.com/NeelTech07/BlackBoxAI.git
cd BlackBoxAI
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

Create `.env.local` (see `.env.example`):

```env
# AssemblyAI API Key for Realtime Speech-to-Text
ASSEMBLYAI_API_KEY=your_assemblyai_key_here

# xAI / Grok API Key for Structured AI Clinical Event Extraction
XAI_API_KEY=your_xai_api_key_here

# Optional: Groq key (takes precedence if starts with gsk_)
GROQ_API_KEY=gsk_your_key_here
```

> No keys? App still runs in Simulated Local Mode for both STT and analysis.

## Scripts

```bash
npm run dev    # dev server
npm run build  # production build
npm run start  # start production
npm run lint   # next lint
```

## How It Works

1. `BlackBoxRecorder` → `createSession()` → `useRealtimeAudio.startRecording()`
2. `useRealtimeAudio` fetches `/api/assemblyai/token` → WebSocket PCM streaming or simulated phrases
3. Final `TranscriptSegment`s saved via `saveTranscriptSegment()` in `localStorage`
4. On stop → `updateSession(status: needs_processing)` → summary modal
5. Dashboard triggers `POST /api/analyze` → episodes + summary + requiresAttention → `processed`
6. Care / Nurse / Hospital Memory aggregate patterns with verbatim quotes + risk levels

## License

Private / All rights reserved. For clinical safety evaluation only — not a medical device.
