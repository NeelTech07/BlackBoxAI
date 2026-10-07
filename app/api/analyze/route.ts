import { NextResponse } from 'next/server';
import {
  StructuredEvent,
  TranscriptSegment,
  Episode,
  ExecutiveSummary,
  RequiresAttentionItem,
} from '@/types/blackbox';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { transcript, segments }: { transcript?: string; segments?: TranscriptSegment[] } = body;

    const fullTranscript = transcript || (segments ? segments.map((s) => s.text).join(' ') : '');

    if (!fullTranscript || fullTranscript.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Empty transcript provided for AI analysis.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY || process.env.XAI_API_KEY;

    if (apiKey && apiKey.trim() !== '' && !apiKey.includes('your_')) {
      try {
        const aiResult = await analyzeWithGroq(fullTranscript, segments || [], apiKey);
        return NextResponse.json({
          success: true,
          ...aiResult,
        });
      } catch (err: any) {
        console.warn('Groq AI API error, falling back to local clinical parser:', err?.message);
      }
    }

    // Fallback deterministic local clinical parser engine
    const localResult = analyzeWithLocalEngine(fullTranscript, segments || []);
    return NextResponse.json({
      success: true,
      ...localResult,
    });
  } catch (err: any) {
    console.error('API Analyze error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to process transcript.' },
      { status: 500 }
    );
  }
}

async function analyzeWithGroq(
  fullTranscript: string,
  segments: TranscriptSegment[],
  apiKey: string
): Promise<{
  episodes: Episode[];
  executiveSummary: ExecutiveSummary;
  requiresAttention: RequiresAttentionItem[];
  events: StructuredEvent[];
}> {
  const prompt = `You are CARE BLACKBOX Clinical Intelligence Engine.
Analyze the following clinical voice recording transcript and reconstruct the episodic clinical narrative.

CRITICAL CLINICAL RULES:
1. Do NOT invent facts or infer unmentioned details. If details are not explicitly mentioned, use "Not mentioned" or "Not confirmed".
2. Every action must have an explicit status: "REQUESTED", "IN_PROGRESS", "COMPLETED", "UNCONFIRMED", "NOT_STARTED", "CANCELLED".
3. If an item (such as a crash cart, blood test, or doctor response) was requested but its completion or arrival was NOT verbally stated in the audio, its status MUST be "UNCONFIRMED" or "REQUESTED".
4. Every action and event MUST contain the exact verbatim sentence from the transcript in "sourceTranscript" for auditability and traceability.
5. If there are unconfirmed critical actions (like crash cart called with no verbal arrival confirmation), generate a "requiresAttention" item with severity "CRITICAL".

RAW CLINICAL TRANSCRIPT:
${segments.length > 0 ? segments.map((s) => `[${s.timestamp}] ${s.text}`).join('\n') : fullTranscript}

Return ONLY valid JSON matching this exact structure:
{
  "episodes": [
    {
      "title": "Title string describing clinical story episode",
      "timeWindow": "HH:MM:SS - HH:MM:SS",
      "location": "Location or 'Not mentioned'",
      "peopleInvolved": ["Role 1", "Role 2"],
      "summary": "2-3 sentence episode narrative summary",
      "riskLevel": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
      "observations": ["Observation / vital quote"],
      "unresolvedItems": ["Unconfirmed items"],
      "actions": [
        {
          "description": "Action description",
          "requestedBy": "Role or 'Not mentioned'",
          "assignedTo": "Role or 'Not mentioned'",
          "status": "REQUESTED" | "IN_PROGRESS" | "COMPLETED" | "UNCONFIRMED" | "NOT_STARTED" | "CANCELLED",
          "sourceTranscript": "Verbatim quote",
          "timestamp": "HH:MM:SS"
        }
      ]
    }
  ],
  "executiveSummary": {
    "situation": "Overview of event situation",
    "keyFindings": ["Clinical finding 1"],
    "actionsTaken": ["Action completed 1"],
    "outstandingActions": ["Outstanding or unconfirmed item 1"],
    "escalations": ["Escalation made 1"],
    "patientOutcome": "Patient current status/outcome",
    "operationalConcerns": ["System or operational concern 1"]
  },
  "requiresAttention": [
    {
      "severity": "CRITICAL" | "HIGH",
      "issue": "Specific unconfirmed risk or safety warning",
      "recommendedAction": "Action required by care team",
      "sourceTranscript": "Verbatim quote"
    }
  ],
  "events": [
    {
      "timestamp": "HH:MM:SS",
      "type": "Category string",
      "description": "Clear clinical description",
      "people": "Role or 'Not mentioned'",
      "location": "Location or 'Not mentioned'",
      "status": "Observed" | "Requested" | "Completed" | "Pending" | "Unknown",
      "confidence": "High" | "Medium" | "Low",
      "sourceTranscript": "Verbatim quote"
    }
  ]
}`;

  const isGroq = apiKey.startsWith('gsk_');
  const endpoint = isGroq
    ? 'https://api.groq.com/openai/v1/chat/completions'
    : 'https://api.x.ai/v1/chat/completions';

  const model = isGroq ? 'openai/gpt-oss-120b' : 'grok-2-latest';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI API HTTP ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content;
  if (!rawContent) throw new Error('Empty content received from AI engine');

  const parsed = JSON.parse(rawContent);
  const now = Date.now();

  const episodes: Episode[] = (parsed.episodes || []).map((ep: any, idx: number) => ({
    id: `ep-${now}-${idx}`,
    title: ep.title || 'Clinical Episode',
    timeWindow: ep.timeWindow || '10:00:00 - 10:05:00',
    location: ep.location || 'Not mentioned',
    peopleInvolved: Array.isArray(ep.peopleInvolved) ? ep.peopleInvolved : ['Care Team'],
    summary: ep.summary || fullTranscript.substring(0, 100),
    riskLevel: ep.riskLevel || 'MEDIUM',
    observations: Array.isArray(ep.observations) ? ep.observations : [],
    unresolvedItems: Array.isArray(ep.unresolvedItems) ? ep.unresolvedItems : [],
    actions: (ep.actions || []).map((act: any, aIdx: number) => ({
      id: `act-${now}-${idx}-${aIdx}`,
      description: act.description || 'Clinical action',
      requestedBy: act.requestedBy || 'Care Staff',
      assignedTo: act.assignedTo || 'Unassigned',
      status: act.status || 'UNCONFIRMED',
      sourceTranscript: act.sourceTranscript || fullTranscript.substring(0, 50),
      timestamp: act.timestamp || '10:00:00',
    })),
  }));

  const executiveSummary: ExecutiveSummary = parsed.executiveSummary || {
    situation: fullTranscript.substring(0, 150),
    keyFindings: ['Clinical recording captured.'],
    actionsTaken: ['Recording indexed.'],
    outstandingActions: ['Review full transcript.'],
    escalations: [],
    patientOutcome: 'Monitoring ongoing.',
    operationalConcerns: [],
  };

  const requiresAttention: RequiresAttentionItem[] = (parsed.requiresAttention || []).map((att: any, idx: number) => ({
    id: `att-${now}-${idx}`,
    severity: att.severity || 'HIGH',
    issue: att.issue || 'Action requires verification',
    recommendedAction: att.recommendedAction || 'Verify with bedside nurse',
    sourceTranscript: att.sourceTranscript,
  }));

  const events: StructuredEvent[] = (parsed.events || []).map((evt: any, idx: number) => ({
    id: `evt-ai-${now}-${idx}`,
    timestamp: evt.timestamp || '10:00:00',
    type: evt.type || 'Clinical Event',
    description: evt.description || 'Observed clinical event.',
    people: evt.people || 'Not mentioned',
    location: evt.location || 'Not mentioned',
    status: evt.status || 'Observed',
    confidence: evt.confidence || 'High',
    sourceTranscript: evt.sourceTranscript || fullTranscript.substring(0, 50),
  }));

  return {
    episodes,
    executiveSummary,
    requiresAttention,
    events,
  };
}

function analyzeWithLocalEngine(
  fullTranscript: string,
  segments: TranscriptSegment[]
): {
  episodes: Episode[];
  executiveSummary: ExecutiveSummary;
  requiresAttention: RequiresAttentionItem[];
  events: StructuredEvent[];
} {
  const lower = fullTranscript.toLowerCase();
  const now = Date.now();

  const lines = segments.length > 0
    ? segments
    : fullTranscript.split(/(?<=[.!?])\s+/).map((text, i) => ({
        id: `line-${i}`,
        timestamp: new Date(Date.now() + i * 5000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        text: text.trim(),
        isFinal: true,
      }));

  const events: StructuredEvent[] = [];
  lines.forEach((seg, i) => {
    const text = seg.text;
    if (!text || text.length < 3) return;

    const tLower = text.toLowerCase();
    let type = 'Clinical Observation';
    let status: StructuredEvent['status'] = 'Observed';

    if (tLower.includes('oxygen') || tLower.includes('breathless') || tLower.includes('saturation')) {
      type = 'Patient deterioration';
    } else if (tLower.includes('doctor') || tLower.includes('physician') || tLower.includes('call')) {
      type = 'Escalation';
      status = tLower.includes('called') || tLower.includes('notified') ? 'Completed' : 'Requested';
    } else if (tLower.includes('crash cart') || tLower.includes('equipment')) {
      type = 'Equipment request';
      status = 'Requested';
    }

    events.push({
      id: `evt-local-${now}-${i}`,
      timestamp: seg.timestamp || '10:42:00',
      type,
      description: text,
      people: 'Care Team',
      location: 'Ward / Unit',
      status,
      confidence: 'High',
      sourceTranscript: text,
    });
  });

  const isCrashCartMentioned = lower.includes('crash cart');
  const isCrashCartConfirmed = lower.includes('crash cart arrived') || lower.includes('crash cart is here');

  const requiresAttention: RequiresAttentionItem[] = [];
  if (isCrashCartMentioned && !isCrashCartConfirmed) {
    requiresAttention.push({
      id: `att-local-${now}-1`,
      severity: 'CRITICAL',
      issue: 'Crash Cart Arrival Unconfirmed in Audio Recording',
      recommendedAction: 'Verify physical presence and equipment readiness of crash cart immediately.',
      sourceTranscript: lines.find((l) => l.text.toLowerCase().includes('crash cart'))?.text || 'Crash cart requested',
    });
  }

  const episodeActions = lines
    .filter((l) => {
      const t = l.text.toLowerCase();
      return t.includes('call') || t.includes('start') || t.includes('bring') || t.includes('order') || t.includes('request') || t.includes('oxygen') || t.includes('cart');
    })
    .map((l, idx) => {
      const t = l.text.toLowerCase();
      let status: Episode['actions'][0]['status'] = 'REQUESTED';
      if (t.includes('notified') || t.includes('initiated') || t.includes('administered') || t.includes('completed')) {
        status = 'COMPLETED';
      } else if (t.includes('crash cart') && !isCrashCartConfirmed) {
        status = 'UNCONFIRMED';
      }

      return {
        id: `act-local-${now}-${idx}`,
        description: l.text,
        requestedBy: 'Care Staff',
        assignedTo: 'Care Team',
        status,
        sourceTranscript: l.text,
        timestamp: l.timestamp || '10:00:00',
      };
    });

  const episodes: Episode[] = [
    {
      id: `ep-local-${now}-1`,
      title: lower.includes('oxygen') || lower.includes('breathless') ? 'Acute Deterioration & Clinical Intervention' : 'Clinical Capture Episode',
      timeWindow: `${lines[0]?.timestamp || '10:00:00'} - ${lines[lines.length - 1]?.timestamp || '10:05:00'}`,
      location: 'Ward / Clinical Unit',
      peopleInvolved: ['Bedside Nurse', 'Physician', 'Care Team'],
      summary: fullTranscript.substring(0, 150) + '...',
      riskLevel: isCrashCartMentioned ? 'CRITICAL' : 'MEDIUM',
      observations: lines.filter((l) => l.text.toLowerCase().includes('saturation') || l.text.toLowerCase().includes('bp') || l.text.toLowerCase().includes('vitals')).map((l) => l.text),
      unresolvedItems: isCrashCartMentioned && !isCrashCartConfirmed ? ['Crash cart arrival unconfirmed'] : [],
      actions: episodeActions.length > 0 ? episodeActions : [
        {
          id: `act-fallback-${now}`,
          description: 'Document clinical voice capture',
          requestedBy: 'Care Staff',
          assignedTo: 'Care Team',
          status: 'COMPLETED',
          sourceTranscript: lines[0]?.text || fullTranscript.substring(0, 50),
          timestamp: lines[0]?.timestamp || '10:00:00',
        },
      ],
    },
  ];

  const executiveSummary: ExecutiveSummary = {
    situation: `Clinical capture recorded with ${lines.length} voice segments.`,
    keyFindings: lines.slice(0, 2).map((l) => l.text),
    actionsTaken: episodeActions.filter((a) => a.status === 'COMPLETED').map((a) => a.description),
    outstandingActions: episodeActions.filter((a) => a.status === 'UNCONFIRMED' || a.status === 'REQUESTED').map((a) => a.description),
    escalations: lines.filter((l) => l.text.toLowerCase().includes('doctor') || l.text.toLowerCase().includes('call')).map((l) => l.text),
    patientOutcome: 'Bedside monitoring ongoing.',
    operationalConcerns: isCrashCartMentioned && !isCrashCartConfirmed ? ['Crash cart requested but physical arrival not verbally confirmed.'] : [],
  };

  return {
    episodes,
    executiveSummary,
    requiresAttention,
    events,
  };
}
