export type ConnectionState = 
  | 'READY' 
  | 'CONNECTING' 
  | 'LISTENING' 
  | 'PAUSED' 
  | 'DISCONNECTED' 
  | 'ERROR';

export interface TranscriptSegment {
  id: string;
  timestamp: string; // HH:MM:SS format
  text: string;
  isFinal: boolean;
  confidence?: number;
}

export type EventStatus = 'Observed' | 'Requested' | 'Completed' | 'Pending' | 'Unknown';
export type EventConfidence = 'High' | 'Medium' | 'Low';

export interface StructuredEvent {
  id: string;
  timestamp: string;
  type: string;
  description: string;
  people?: string;
  location?: string;
  status: EventStatus;
  confidence: EventConfidence;
  sourceTranscript: string; // Exact sentence from raw transcript for traceability
}

export type CareActionStatus = 
  | 'REQUESTED' 
  | 'IN_PROGRESS' 
  | 'COMPLETED' 
  | 'UNCONFIRMED' 
  | 'NOT_STARTED' 
  | 'CANCELLED';

export interface CareAction {
  id: string;
  description: string;
  requestedBy?: string;
  assignedTo?: string;
  status: CareActionStatus;
  sourceTranscript: string;
  timestamp: string;
}

export interface Episode {
  id: string;
  title: string;
  timeWindow: string; // e.g. "10:42:04 - 10:42:40"
  location: string;
  peopleInvolved: string[];
  summary: string;
  actions: CareAction[];
  observations: string[];
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  unresolvedItems: string[];
}

export interface ExecutiveSummary {
  situation: string;
  keyFindings: string[];
  actionsTaken: string[];
  outstandingActions: string[];
  escalations: string[];
  patientOutcome: string;
  operationalConcerns: string[];
}

export interface RequiresAttentionItem {
  id: string;
  severity: 'CRITICAL' | 'HIGH';
  issue: string;
  recommendedAction: string;
  sourceSessionId?: string;
  sourceTranscript?: string;
}

export interface EvidenceQuote {
  sessionId: string;
  sessionTitle: string;
  timestamp: string;
  quote: string;
  actionStatus?: CareActionStatus;
}

export interface CareMemoryPattern {
  id: string;
  title: string;
  category: string;
  occurrencesCount: number;
  affectedLocations: string[];
  summary: string;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  evidenceQuotes: EvidenceQuote[];
  recommendedFix?: string;
}

export type SessionStatus = 'recording' | 'completed' | 'needs_processing' | 'processed';

export interface BlackBoxSession {
  id: string;
  title: string;
  startTime: string;
  endTime?: string;
  durationSeconds: number;
  segments: TranscriptSegment[];
  events?: StructuredEvent[];
  episodes?: Episode[];
  executiveSummary?: ExecutiveSummary;
  requiresAttention?: RequiresAttentionItem[];
  wordCount: number;
  status: SessionStatus;
  isSimulated?: boolean;
  location?: string;
  unit?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyzeTranscriptResponse {
  success: boolean;
  events: StructuredEvent[];
  episodes?: Episode[];
  executiveSummary?: ExecutiveSummary;
  requiresAttention?: RequiresAttentionItem[];
  engine?: string;
  error?: string;
}

export interface AssemblyAITokenResponse {
  token?: string;
  error?: string;
  isSimulated?: boolean;
}
