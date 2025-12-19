// Core types for the dating app

export interface UserProfile {
  id: string;
  name: string;
  age?: number;
  gender?: 'male' | 'female' | 'non-binary' | 'other' | string;
  lookingFor?: ('male' | 'female' | 'non-binary' | 'other' | string)[];
  bio?: string;
  avatar?: string;
  interests?: string[];
  location?: string;
  occupation?: string;
  education?: string;
  // Personality traits for compatibility scoring (1-10)
  traits?: {
    adventurous: number;
    intellectual: number;
    social: number;
    romantic: number;
    ambitious: number;
    creative: number;
    spontaneous: number;
    traditional: number;
  };
  preferences?: {
    ageMin: number;
    ageMax: number;
    maxDistance: number;
  };
}

export interface CompatibilityScore {
  userId1: string;
  userId2: string;
  score: number; // 0-100
  breakdown: {
    interestMatch: number;
    traitCompatibility: number;
    preferenceMatch: number;
    conversationQuality?: number;
  };
  calculatedAt: Date;
}

export interface SpeedDatingEvent {
  id: string;
  name: string;
  description?: string;
  hostId: string;
  maxParticipants: number;
  roundDuration: number; // in seconds
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  currentRound: number;
  participants: string[]; // user IDs
  waitlist: string[]; // user IDs
  waitingRoom: string[]; // users waiting to be matched
  activeRooms: SpeedDatingRoom[];
  scheduledStart?: Date;
  // Legacy fields for compatibility
  startTime?: Date;
  endTime?: Date;
  maxSeats?: number;
  currentParticipants?: string[];
  roundDurationMinutes?: number;
  theme?: string;
  ageRange?: { min: number; max: number };
}

export interface SpeedDatingRoom {
  id: string;
  eventId: string;
  channelName: string; // Agora channel name
  participants: string[]; // user IDs (usually 2)
  roundNumber: number;
  status: 'waiting' | 'active' | 'completed';
  startedAt?: Date;
  endedAt?: Date;
  // Legacy fields for compatibility
  startTime?: Date;
  endTime?: Date;
  transcript?: TranscriptEntry[];
  aiSummary?: string;
  compatibilityNotes?: string;
}

export interface TranscriptEntry {
  speakerId: string;
  text: string;
  timestamp: Date;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export interface Match {
  id: string;
  user1Id: string;
  user2Id: string;
  eventId?: string;
  roomId?: string;
  compatibilityScore: number;
  status: 'pending' | 'accepted' | 'rejected' | 'mutual';
  user1Action?: 'like' | 'pass' | 'liked' | 'passed';
  user2Action?: 'like' | 'pass' | 'liked' | 'passed';
  createdAt?: Date;
  transcript?: string;
  aiSummary?: string;
  conversationSummary?: string;
}

export interface EventRound {
  roundNumber: number;
  startTime: Date;
  endTime: Date;
  rooms: SpeedDatingRoom[];
  waitingUsers: string[]; // Users who couldn't be matched this round
}

export interface EventState {
  event: SpeedDatingEvent;
  currentRound: number;
  rounds: EventRound[];
  matchHistory: Map<string, Set<string>>; // tracks who has met whom
  compatibilityScores: Map<string, CompatibilityScore>;
  activeRooms: SpeedDatingRoom[];
  waitingRoom: string[]; // users waiting to be matched
}

// Agora related types
export interface AgoraTokenRequest {
  channelName: string;
  uid: string;
  role?: 'publisher' | 'subscriber';
  expirationSeconds?: number;
}

export interface AgoraTokenResponse {
  token: string;
  channelName: string;
  uid: string;
  expiresAt: number;
}

// WebSocket event types for real-time updates
export type SocketEvent = 
  | { type: 'ROUND_STARTING'; data: { roundNumber: number; startsIn: number } }
  | { type: 'MATCHED'; data: { roomId: string; partnerId: string; partnerProfile: Partial<UserProfile> } }
  | { type: 'WAITING'; data: { position: number; message: string } }
  | { type: 'ROUND_ENDING'; data: { endsIn: number } }
  | { type: 'ROOM_CHANGE'; data: { newRoomId: string; newPartnerId: string } }
  | { type: 'EVENT_ENDED'; data: { matches: Match[] } }
  | { type: 'CONNECTION_STATUS'; data: { status: 'connected' | 'disconnected' | 'reconnecting' } };

// UI State types
export interface SpeedDatingUIState {
  currentPhase: 'lobby' | 'waiting' | 'matched' | 'in-call' | 'rating' | 'results';
  currentPartner: UserProfile | null;
  currentRoom: SpeedDatingRoom | null;
  timeRemaining: number; // seconds
  roundNumber: number;
  totalRounds: number;
  pendingMatches: Match[];
}
