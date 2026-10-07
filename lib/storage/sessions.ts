import {
  BlackBoxSession,
  TranscriptSegment,
  StructuredEvent,
  Episode,
  ExecutiveSummary,
  RequiresAttentionItem,
  CareMemoryPattern,
  CareActionStatus,
} from '@/types/blackbox';

const STORAGE_KEY = 'care_blackbox_sessions_v3';
const INITIALIZED_KEY = 'care_blackbox_initialized_v3';
const DELETED_IDS_KEY = 'care_blackbox_deleted_ids_v3';

// 4 Realistic Simulated Clinical Demo Sessions with Recurring Pattern (Ward 5B Crash Cart Delay)
const INITIAL_DEMO_SESSIONS: BlackBoxSession[] = [
  {
    id: 'session-demo-5b-01',
    title: 'Ward 5B - Acute Respiratory Deterioration',
    startTime: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    endTime: new Date(Date.now() - 1000 * 60 * 60 * 3 + 272000).toISOString(),
    durationSeconds: 272,
    status: 'processed',
    wordCount: 84,
    isSimulated: true,
    location: 'Ward 5B, Bed 4',
    unit: 'Emergency & General Medicine',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3 + 272000).toISOString(),
    segments: [
      { id: 'seg-101', timestamp: '10:42:04', text: 'Doctor, Mr. 1042 in Ward 5B is becoming breathless. His oxygen saturation is 88%.', isFinal: true, confidence: 0.98 },
      { id: 'seg-102', timestamp: '10:42:09', text: 'Okay, start high-flow oxygen at 15 liters per minute and call respiratory.', isFinal: true, confidence: 0.96 },
      { id: 'seg-103', timestamp: '10:42:15', text: 'Respiratory therapist has been notified.', isFinal: true, confidence: 0.97 },
      { id: 'seg-104', timestamp: '10:42:22', text: 'Should I bring the crash cart to Bed 4?', isFinal: true, confidence: 0.99 },
      { id: 'seg-105', timestamp: '10:42:27', text: 'Yes, bring crash cart to Ward 5B immediately.', isFinal: true, confidence: 0.95 },
      { id: 'seg-106', timestamp: '10:42:35', text: 'Crash cart requested from central supply.', isFinal: true, confidence: 0.94 },
      { id: 'seg-107', timestamp: '10:42:50', text: 'High-flow oxygen initiated. Saturation now slowly rising to 91%.', isFinal: true, confidence: 0.97 },
    ],
    events: [
      { id: 'evt-1', timestamp: '10:42:04', type: 'Patient deterioration', description: 'SpO2 drop to 88% with severe breathlessness in Ward 5B Bed 4.', people: 'Bedside Nurse', location: 'Ward 5B, Bed 4', status: 'Observed', confidence: 'High', sourceTranscript: 'Doctor, Mr. 1042 in Ward 5B is becoming breathless. His oxygen saturation is 88%.' },
      { id: 'evt-2', timestamp: '10:42:09', type: 'Treatment initiation', description: 'High-flow oxygen at 15L/min ordered.', people: 'On-call Physician', location: 'Ward 5B', status: 'Requested', confidence: 'High', sourceTranscript: 'Okay, start high-flow oxygen at 15 liters per minute and call respiratory.' },
      { id: 'evt-3', timestamp: '10:42:27', type: 'Equipment request', description: 'Crash cart requested for Ward 5B Bed 4.', people: 'Bedside Nurse', location: 'Ward 5B, Bed 4', status: 'Requested', confidence: 'High', sourceTranscript: 'Yes, bring crash cart to Ward 5B immediately.' },
    ],
    episodes: [
      {
        id: 'ep-101',
        title: 'Acute Respiratory Deterioration & Resuscitation Prep',
        timeWindow: '10:42:04 - 10:42:50',
        location: 'Ward 5B, Bed 4',
        peopleInvolved: ['Bedside Nurse', 'On-call Physician', 'Respiratory Therapist'],
        summary: 'Patient Mr. 1042 experienced acute desaturation to 88%. High-flow oxygen was initiated with partial response (91%). Crash cart was requested from central supply, but physical arrival at Bed 4 was unconfirmed in session audio.',
        riskLevel: 'CRITICAL',
        observations: ['SpO2 dropped to 88%', 'Patient visibly breathless', 'Post-oxygen SpO2 91%'],
        unresolvedItems: ['Crash cart arrival unconfirmed in Ward 5B'],
        actions: [
          { id: 'act-1', description: 'Initiate high-flow oxygen 15L/min', requestedBy: 'Physician', assignedTo: 'Bedside Nurse', status: 'COMPLETED', sourceTranscript: 'High-flow oxygen initiated. Saturation now slowly rising to 91%.', timestamp: '10:42:50' },
          { id: 'act-2', description: 'Call Respiratory Therapist', requestedBy: 'Physician', assignedTo: 'Charge Nurse', status: 'COMPLETED', sourceTranscript: 'Respiratory therapist has been notified.', timestamp: '10:42:15' },
          { id: 'act-3', description: 'Deliver Crash Cart to Ward 5B Bed 4', requestedBy: 'Bedside Nurse', assignedTo: 'Central Supply / Runner', status: 'UNCONFIRMED', sourceTranscript: 'Crash cart requested from central supply.', timestamp: '10:42:35' },
        ],
      },
    ],
    executiveSummary: {
      situation: 'Mr. 1042 in Ward 5B Bed 4 suffered sudden respiratory desaturation down to 88%.',
      keyFindings: ['Severe desaturation to 88% SpO2.', 'High-flow O2 (15L) improved saturation to 91%.'],
      actionsTaken: ['High-flow oxygen 15L started.', 'Respiratory therapist notified.'],
      outstandingActions: ['Confirm crash cart delivery and readiness in Ward 5B.'],
      escalations: ['On-call physician alerted.', 'Crash cart requested.'],
      patientOutcome: 'SpO2 stabilized at 91% on high-flow O2. Bedside monitoring ongoing.',
      operationalConcerns: ['Crash cart requested from central supply but physical arrival was NOT verbally confirmed.'],
    },
    requiresAttention: [
      {
        id: 'att-101',
        severity: 'CRITICAL',
        issue: 'Crash Cart Arrival Unconfirmed in Ward 5B',
        recommendedAction: 'Verify physical presence and equipment readiness of crash cart at Ward 5B Bed 4 immediately.',
        sourceTranscript: 'Crash cart requested from central supply.',
      },
    ],
  },
  {
    id: 'session-demo-5b-02',
    title: 'Ward 5B - Night Shift Hypotensive Emergency',
    startTime: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    endTime: new Date(Date.now() - 1000 * 60 * 60 * 14 + 195000).toISOString(),
    durationSeconds: 195,
    status: 'processed',
    wordCount: 68,
    isSimulated: true,
    location: 'Ward 5B, Bed 2',
    unit: 'Emergency & General Medicine',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 14 + 195000).toISOString(),
    segments: [
      { id: 'seg-201', timestamp: '03:15:10', text: 'Patient in Ward 5B Bed 2 had sudden drop in blood pressure to 80 over 50.', isFinal: true, confidence: 0.99 },
      { id: 'seg-202', timestamp: '03:15:18', text: 'Call on-call physician and dispatch crash cart to Ward 5B.', isFinal: true, confidence: 0.97 },
      { id: 'seg-203', timestamp: '03:15:26', text: 'Physician notified. Crash cart request placed to supply room.', isFinal: true, confidence: 0.95 },
      { id: 'seg-204', timestamp: '03:16:02', text: 'Is the crash cart here in 5B yet?', isFinal: true, confidence: 0.98 },
      { id: 'seg-205', timestamp: '03:16:10', text: 'No response from supply on crash cart delivery yet.', isFinal: true, confidence: 0.94 },
      { id: 'seg-206', timestamp: '03:16:30', text: 'Administering 500ml normal saline bolus as ordered.', isFinal: true, confidence: 0.96 },
    ],
    events: [
      { id: 'evt-21', timestamp: '03:15:10', type: 'Patient deterioration', description: 'BP dropped to 80/50 mmHg.', people: 'Night Nurse', location: 'Ward 5B, Bed 2', status: 'Observed', confidence: 'High', sourceTranscript: 'Patient in Ward 5B Bed 2 had sudden drop in blood pressure to 80 over 50.' },
      { id: 'evt-22', timestamp: '03:15:18', type: 'Equipment request', description: 'Crash cart dispatched to Ward 5B.', people: 'Night Nurse', location: 'Ward 5B', status: 'Requested', confidence: 'High', sourceTranscript: 'Call on-call physician and dispatch crash cart to Ward 5B.' },
    ],
    episodes: [
      {
        id: 'ep-201',
        title: 'Acute Hypotension & Delayed Equipment Response',
        timeWindow: '03:15:10 - 03:16:30',
        location: 'Ward 5B, Bed 2',
        peopleInvolved: ['Night Nurse', 'On-call Physician'],
        summary: 'Bed 2 developed acute hypotension (80/50 mmHg). Saline bolus was initiated. Crash cart was requested but remained unconfirmed and delayed from central supply room.',
        riskLevel: 'CRITICAL',
        observations: ['BP 80/50 mmHg', 'Unresponsive supply room status'],
        unresolvedItems: ['Crash cart delivery delay in Ward 5B'],
        actions: [
          { id: 'act-21', description: 'Administer 500ml Normal Saline Bolus', requestedBy: 'Physician', assignedTo: 'Night Nurse', status: 'COMPLETED', sourceTranscript: 'Administering 500ml normal saline bolus as ordered.', timestamp: '03:16:30' },
          { id: 'act-22', description: 'Dispatch Crash Cart to Ward 5B', requestedBy: 'Night Nurse', assignedTo: 'Supply Room', status: 'UNCONFIRMED', sourceTranscript: 'No response from supply on crash cart delivery yet.', timestamp: '03:16:10' },
        ],
      },
    ],
    executiveSummary: {
      situation: 'Acute hypotension (80/50) in Ward 5B Bed 2 during night shift.',
      keyFindings: ['BP dropped to 80/50.', 'Central supply delayed on crash cart response.'],
      actionsTaken: ['Physician notified.', '500ml normal saline bolus administered.'],
      outstandingActions: ['Verify why supply room delayed crash cart dispatch to Ward 5B.'],
      escalations: ['Urgent supply escalation needed for Ward 5B equipment routing.'],
      patientOutcome: 'IV fluids running. Awaiting blood pressure re-check.',
      operationalConcerns: ['RECURRING ISSUE: Second incident of unconfirmed/delayed crash cart arrival in Ward 5B.'],
    },
    requiresAttention: [
      {
        id: 'att-201',
        severity: 'CRITICAL',
        issue: 'Repeated Delay in Crash Cart Dispatch to Ward 5B',
        recommendedAction: 'Audit central supply dispatch response times for Ward 5B emergency requests.',
        sourceTranscript: 'No response from supply on crash cart delivery yet.',
      },
    ],
  },
  {
    id: 'session-demo-icu-03',
    title: 'ICU Handoff - Post-Operative Emergency Transfer',
    startTime: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
    endTime: new Date(Date.now() - 1000 * 60 * 60 * 22 + 310000).toISOString(),
    durationSeconds: 310,
    status: 'processed',
    wordCount: 112,
    isSimulated: true,
    location: 'ICU Bed 6',
    unit: 'Intensive Care Unit',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 22 + 310000).toISOString(),
    segments: [
      { id: 'seg-301', timestamp: '14:20:05', text: 'Post-op handoff for Patient 889 following emergency exploratory laparotomy.', isFinal: true, confidence: 0.98 },
      { id: 'seg-302', timestamp: '14:20:15', text: 'Extubated in recovery 45 minutes ago. SpO2 96% on 2L nasal cannula.', isFinal: true, confidence: 0.97 },
      { id: 'seg-303', timestamp: '14:20:25', text: 'Arterial blood gas was ordered in recovery before transfer.', isFinal: true, confidence: 0.96 },
      { id: 'seg-304', timestamp: '14:20:38', text: 'ABG lab result is still pending.', isFinal: true, confidence: 0.95 },
      { id: 'seg-305', timestamp: '14:20:50', text: 'Surgical drain output 40ml serosanguinous. IV morphine running for pain.', isFinal: true, confidence: 0.99 },
    ],
    events: [
      { id: 'evt-31', timestamp: '14:20:05', type: 'Patient transfer', description: 'Emergency post-op laparotomy transfer to ICU Bed 6.', people: 'OR Nurse / ICU Nurse', location: 'ICU Bed 6', status: 'Completed', confidence: 'High', sourceTranscript: 'Post-op handoff for Patient 889 following emergency exploratory laparotomy.' },
      { id: 'evt-32', timestamp: '14:20:25', type: 'Lab request', description: 'Arterial blood gas lab test ordered.', people: 'Recovery Team', location: 'ICU / Lab', status: 'Pending', confidence: 'High', sourceTranscript: 'Arterial blood gas was ordered in recovery before transfer.' },
    ],
    episodes: [
      {
        id: 'ep-301',
        title: 'Post-Operative Recovery Handoff & Lab Tracking',
        timeWindow: '14:20:05 - 14:20:50',
        location: 'ICU Bed 6',
        peopleInvolved: ['OR Nurse', 'ICU Receiving Nurse'],
        summary: 'Patient transferred post-laparotomy. Vitals and SpO2 (96%) stable. ABG ordered prior to transfer remains unconfirmed and pending from central lab.',
        riskLevel: 'MEDIUM',
        observations: ['SpO2 96% on 2L NC', 'Drain output 40ml serosanguinous'],
        unresolvedItems: ['Post-op ABG lab result pending'],
        actions: [
          { id: 'act-31', description: 'Process post-op Arterial Blood Gas (ABG)', requestedBy: 'Recovery Nurse', assignedTo: 'Central Lab', status: 'UNCONFIRMED', sourceTranscript: 'ABG lab result is still pending.', timestamp: '14:20:38' },
        ],
      },
    ],
    executiveSummary: {
      situation: 'Post-op ICU transfer following emergency laparotomy.',
      keyFindings: ['Stable vitals on 2L oxygen cannula.', 'Drain active with 40ml serosanguinous output.'],
      actionsTaken: ['Patient safely settled in ICU Bed 6.', 'IV pain regimen maintained.'],
      outstandingActions: ['Follow up on pending ABG result from central lab.'],
      escalations: ['None required immediately.'],
      patientOutcome: 'Comfortable in ICU Bed 6. Baseline recovery underway.',
      operationalConcerns: ['Lab turnaround delay for post-op ABG sample.'],
    },
    requiresAttention: [],
  },
];

function isClient(): boolean {
  return typeof window !== 'undefined';
}

function getDeletedIds(): string[] {
  if (!isClient()) return [];
  try {
    const raw = localStorage.getItem(DELETED_IDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveDeletedId(id: string): void {
  if (!isClient()) return;
  const deleted = getDeletedIds();
  if (!deleted.includes(id)) {
    deleted.push(id);
    localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(deleted));
  }
}

export function getSessions(): BlackBoxSession[] {
  if (!isClient()) return INITIAL_DEMO_SESSIONS;
  try {
    const deletedIds = getDeletedIds();
    const isInitialized = localStorage.getItem(INITIALIZED_KEY);

    let storedSessions: BlackBoxSession[] = [];
    const rawV3 = localStorage.getItem(STORAGE_KEY);
    const rawV2 = localStorage.getItem('care_blackbox_sessions_v2');
    const rawV1 = localStorage.getItem('care_blackbox_sessions_v1');

    if (rawV3) {
      try { storedSessions = JSON.parse(rawV3); } catch (e) {}
    } else if (rawV2) {
      try { storedSessions = JSON.parse(rawV2); } catch (e) {}
    } else if (rawV1) {
      try { storedSessions = JSON.parse(rawV1); } catch (e) {}
    }

    const sessionMap = new Map<string, BlackBoxSession>();

    // If first time initialization, seed demo sessions
    if (!isInitialized && storedSessions.length === 0) {
      INITIAL_DEMO_SESSIONS.forEach((s) => sessionMap.set(s.id, s));
      localStorage.setItem(INITIALIZED_KEY, 'true');
    } else {
      // Include initial demo sessions ONLY if they were never deleted
      INITIAL_DEMO_SESSIONS.forEach((s) => {
        if (!deletedIds.includes(s.id)) {
          sessionMap.set(s.id, s);
        }
      });
    }

    // Merge stored sessions
    storedSessions.forEach((s) => {
      if (s && s.id && !deletedIds.includes(s.id)) {
        sessionMap.set(s.id, s);
      }
    });

    const allSessions = Array.from(sessionMap.values()).filter((s) => !deletedIds.includes(s.id));

    // Sort: User recorded sessions first (non-simulated), then by createdAt desc
    allSessions.sort((a, b) => {
      if (a.isSimulated && !b.isSimulated) return 1;
      if (!a.isSimulated && b.isSimulated) return -1;
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(allSessions));
    return allSessions;
  } catch (err) {
    console.error('Failed to read sessions from localStorage:', err);
    return [];
  }
}

export function getSession(id: string): BlackBoxSession | null {
  const sessions = getSessions();
  return sessions.find((s) => s.id === id) || null;
}

export function createSession(title?: string): BlackBoxSession {
  const now = new Date();
  const id = `session-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const defaultTitle = title || `Clinical Capture ${timeStr}`;

  const newSession: BlackBoxSession = {
    id,
    title: defaultTitle,
    startTime: now.toISOString(),
    durationSeconds: 0,
    segments: [],
    wordCount: 0,
    status: 'recording',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    isSimulated: false,
  };

  if (isClient()) {
    localStorage.setItem(INITIALIZED_KEY, 'true');
    const sessions = getSessions();
    const updated = [newSession, ...sessions];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  return newSession;
}

export function saveTranscriptSegment(sessionId: string, segment: TranscriptSegment): void {
  if (!isClient()) return;
  const sessions = getSessions();
  const index = sessions.findIndex((s) => s.id === sessionId);
  if (index === -1) return;

  const session = sessions[index];
  const existingIdx = session.segments.findIndex((s) => s.id === segment.id);
  let updatedSegments: TranscriptSegment[];

  if (existingIdx !== -1) {
    updatedSegments = [...session.segments];
    updatedSegments[existingIdx] = segment;
  } else {
    updatedSegments = [...session.segments, segment];
  }

  const wordCount = updatedSegments.reduce((acc, seg) => acc + seg.text.trim().split(/\s+/).filter(Boolean).length, 0);

  const updatedSession: BlackBoxSession = {
    ...session,
    segments: updatedSegments,
    wordCount,
    updatedAt: new Date().toISOString(),
  };

  sessions[index] = updatedSession;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function updateSession(sessionData: Partial<BlackBoxSession> & { id: string }): BlackBoxSession | null {
  if (!isClient()) return null;
  const sessions = getSessions();
  const index = sessions.findIndex((s) => s.id === sessionData.id);
  if (index === -1) return null;

  const updatedSession: BlackBoxSession = {
    ...sessions[index],
    ...sessionData,
    updatedAt: new Date().toISOString(),
  };

  sessions[index] = updatedSession;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  return updatedSession;
}

export function deleteSession(id: string): void {
  if (!isClient()) return;
  saveDeletedId(id);
  const sessions = getSessions();
  const filtered = sessions.filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  localStorage.setItem('care_blackbox_sessions_v2', JSON.stringify(filtered));
  localStorage.setItem('care_blackbox_sessions_v1', JSON.stringify(filtered));
}

/**
 * CARE MEMORY Aggregation Engine
 */
export function aggregateCareMemoryPatterns(sessions: BlackBoxSession[]): CareMemoryPattern[] {
  const processed = sessions.filter((s) => s.status === 'processed');
  const patterns: CareMemoryPattern[] = [];

  // Pattern 1: Crash Cart Dispatch & Arrival Unconfirmed in Ward 5B
  const crashCartEvidence: CareMemoryPattern['evidenceQuotes'] = [];
  const affectedLocations = new Set<string>();

  processed.forEach((s) => {
    s.episodes?.forEach((ep) => {
      ep.actions.forEach((act) => {
        if (
          (act.description.toLowerCase().includes('crash cart') || act.sourceTranscript.toLowerCase().includes('crash cart')) &&
          (act.status === 'UNCONFIRMED' || act.status === 'REQUESTED' || act.status === 'IN_PROGRESS')
        ) {
          crashCartEvidence.push({
            sessionId: s.id,
            sessionTitle: s.title,
            timestamp: act.timestamp || '00:00',
            quote: act.sourceTranscript,
            actionStatus: act.status,
          });
          if (s.location) affectedLocations.add(s.location);
          if (ep.location) affectedLocations.add(ep.location);
        }
      });
    });

    s.requiresAttention?.forEach((att) => {
      if (att.issue.toLowerCase().includes('crash cart') && att.sourceTranscript) {
        if (!crashCartEvidence.some((e) => e.quote === att.sourceTranscript)) {
          crashCartEvidence.push({
            sessionId: s.id,
            sessionTitle: s.title,
            timestamp: s.startTime ? new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '00:00',
            quote: att.sourceTranscript,
            actionStatus: 'UNCONFIRMED',
          });
        }
      }
    });
  });

  if (crashCartEvidence.length > 0) {
    patterns.push({
      id: 'pat-crash-cart-5b',
      title: 'Crash Cart Arrival Delay & Unconfirmed Dispatch',
      category: 'Equipment & Safety Response',
      occurrencesCount: crashCartEvidence.length,
      affectedLocations: Array.from(affectedLocations).filter(Boolean).length > 0 ? Array.from(affectedLocations) : ['Ward 5B'],
      summary: 'Multiple emergency voice captures in Ward 5B show crash carts requested from central supply without verbal receipt or arrival confirmation in the audio record.',
      riskLevel: 'CRITICAL',
      evidenceQuotes: crashCartEvidence,
      recommendedFix: 'Establish dedicated Ward 5B emergency equipment bay and mandatory verbal confirmation protocol upon cart arrival.',
    });
  }

  // Pattern 2: Pending Lab Results & ABG Turnaround
  const labEvidence: CareMemoryPattern['evidenceQuotes'] = [];
  processed.forEach((s) => {
    s.episodes?.forEach((ep) => {
      ep.actions.forEach((act) => {
        if (
          (act.description.toLowerCase().includes('lab') || act.description.toLowerCase().includes('abg') || act.sourceTranscript.toLowerCase().includes('blood gas')) &&
          (act.status === 'UNCONFIRMED' || act.status === 'IN_PROGRESS' || act.status === 'REQUESTED')
        ) {
          labEvidence.push({
            sessionId: s.id,
            sessionTitle: s.title,
            timestamp: act.timestamp || '00:00',
            quote: act.sourceTranscript,
            actionStatus: act.status,
          });
        }
      });
    });
  });

  if (labEvidence.length > 0) {
    patterns.push({
      id: 'pat-lab-turnaround',
      title: 'Delayed STAT Lab & ABG Turnaround',
      category: 'Diagnostic & Lab Operations',
      occurrencesCount: labEvidence.length,
      affectedLocations: ['ICU Bed 6', 'Recovery Unit'],
      summary: 'Urgent post-operative arterial blood gas (ABG) lab requests remain unconfirmed across clinical handoffs.',
      riskLevel: 'MEDIUM',
      evidenceQuotes: labEvidence,
      recommendedFix: 'Implement automated STAT lab result alerts directly to receiving ICU bedside monitors.',
    });
  }

  return patterns;
}

export function exportSession(sessionId: string, format: 'json' | 'txt' | 'csv'): void {
  if (!isClient()) return;
  const session = getSession(sessionId);
  if (!session) return;

  let content = '';
  let mimeType = 'text/plain';
  let fileExtension = format;

  if (format === 'json') {
    content = JSON.stringify(session, null, 2);
    mimeType = 'application/json';
  } else if (format === 'txt') {
    content = `==================================================\n`;
    content += `CARE BLACKBOX - SESSION EXPORT\n`;
    content += `Title: ${session.title}\n`;
    content += `ID: ${session.id}\n`;
    content += `Date: ${new Date(session.startTime).toLocaleString()}\n`;
    content += `Duration: ${Math.floor(session.durationSeconds / 60)}m ${session.durationSeconds % 60}s\n`;
    content += `Status: ${session.status}\n`;
    content += `==================================================\n\n`;

    if (session.executiveSummary) {
      content += `--- EXECUTIVE CLINICAL SUMMARY --- \n`;
      content += `Situation: ${session.executiveSummary.situation}\n`;
      content += `Patient Outcome: ${session.executiveSummary.patientOutcome}\n\n`;
    }

    content += `--- RAW TRANSCRIPT --- \n\n`;
    session.segments.forEach((seg) => {
      content += `[${seg.timestamp}] ${seg.text}\n`;
    });
  } else if (format === 'csv') {
    mimeType = 'text/csv';
    content = `Type,Timestamp,Text / Description,Status,Source Sentence\n`;
    session.segments.forEach((seg) => {
      const cleanText = seg.text.replace(/"/g, '""');
      content += `"Transcript","${seg.timestamp}","${cleanText}","Captured",""\n`;
    });
  }

  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `care_blackbox_${session.id}_${Date.now()}.${fileExtension}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
