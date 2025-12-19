// Event management service for speed dating

import type {
  SpeedDatingEvent,
  EventState,
  EventRound,
  SpeedDatingRoom,
  UserProfile,
  CompatibilityScore,
  Match,
} from '../types';
import {
  createOptimalPairings,
  generateRoomAssignments,
  updateMatchHistory,
  calculateRequiredRounds,
} from './matchmaking';

// In-memory store (replace with database in production)
const events: Map<string, EventState> = new Map();
const userProfiles: Map<string, UserProfile> = new Map();

/**
 * Create a new speed dating event
 */
export function createEvent(eventData: Omit<SpeedDatingEvent, 'id' | 'currentParticipants' | 'waitlist' | 'status'>): SpeedDatingEvent {
  const event: SpeedDatingEvent = {
    ...eventData,
    id: generateEventId(),
    currentParticipants: [],
    waitlist: [],
    status: 'upcoming',
  };
  
  const eventState: EventState = {
    event,
    currentRound: 0,
    rounds: [],
    matchHistory: new Map(),
    compatibilityScores: new Map(),
    activeRooms: [],
    waitingRoom: [],
  };
  
  events.set(event.id, eventState);
  return event;
}

/**
 * Join an event
 */
export function joinEvent(eventId: string, userId: string): { success: boolean; position?: number; error?: string } {
  const eventState = events.get(eventId);
  if (!eventState) {
    return { success: false, error: 'Event not found' };
  }
  
  const { event } = eventState;
  
  // Check if already registered
  if (event.currentParticipants.includes(userId) || event.waitlist.includes(userId)) {
    return { success: false, error: 'Already registered for this event' };
  }
  
  // Check if event has started
  if (event.status === 'active') {
    return { success: false, error: 'Event has already started' };
  }
  
  if (event.status === 'completed' || event.status === 'cancelled') {
    return { success: false, error: 'Event is not available' };
  }
  
  // Add to participants or waitlist
  if (event.currentParticipants.length < event.maxSeats) {
    event.currentParticipants.push(userId);
    return { success: true, position: event.currentParticipants.length };
  } else {
    event.waitlist.push(userId);
    return { success: true, position: event.maxSeats + event.waitlist.length };
  }
}

/**
 * Leave an event
 */
export function leaveEvent(eventId: string, userId: string): boolean {
  const eventState = events.get(eventId);
  if (!eventState) return false;
  
  const { event } = eventState;
  
  // Remove from participants
  const participantIndex = event.currentParticipants.indexOf(userId);
  if (participantIndex > -1) {
    event.currentParticipants.splice(participantIndex, 1);
    
    // Move first person from waitlist to participants
    if (event.waitlist.length > 0) {
      const promoted = event.waitlist.shift()!;
      event.currentParticipants.push(promoted);
    }
    return true;
  }
  
  // Remove from waitlist
  const waitlistIndex = event.waitlist.indexOf(userId);
  if (waitlistIndex > -1) {
    event.waitlist.splice(waitlistIndex, 1);
    return true;
  }
  
  return false;
}

/**
 * Start the event - begins the first round
 */
export async function startEvent(eventId: string): Promise<{ success: boolean; error?: string }> {
  const eventState = events.get(eventId);
  if (!eventState) {
    return { success: false, error: 'Event not found' };
  }
  
  const { event } = eventState;
  
  if (event.status !== 'upcoming') {
    return { success: false, error: 'Event cannot be started' };
  }
  
  if (event.currentParticipants.length < 2) {
    return { success: false, error: 'Need at least 2 participants' };
  }
  
  event.status = 'active';
  eventState.currentRound = 0;
  
  // Start first round
  await startNextRound(eventId);
  
  return { success: true };
}

/**
 * Start the next round of speed dating
 */
export async function startNextRound(eventId: string): Promise<EventRound | null> {
  const eventState = events.get(eventId);
  if (!eventState) return null;
  
  const { event } = eventState;
  eventState.currentRound++;
  
  // Get user profiles for all participants
  const participants: UserProfile[] = [];
  
  // Add users from waiting room first
  eventState.waitingRoom.forEach(userId => {
    const profile = userProfiles.get(userId);
    if (profile) participants.push(profile);
  });
  
  // Add current participants not in waiting room
  event.currentParticipants.forEach(userId => {
    if (!eventState.waitingRoom.includes(userId)) {
      const profile = userProfiles.get(userId);
      if (profile) participants.push(profile);
    }
  });
  
  // If no profiles found, use dummy data for demo
  const availableParticipants = participants.length > 0 
    ? participants 
    : event.currentParticipants.map(id => createDemoProfile(id));
  
  // Create optimal pairings
  const { pairs, waitlist } = createOptimalPairings(
    availableParticipants,
    eventState.matchHistory,
    eventState.compatibilityScores
  );
  
  // Generate room assignments
  const rooms = generateRoomAssignments(
    eventId,
    eventState.currentRound,
    pairs,
    event.roundDurationMinutes
  );
  
  // Update match history
  updateMatchHistory(eventState.matchHistory, rooms);
  
  // Create round
  const round: EventRound = {
    roundNumber: eventState.currentRound,
    startTime: new Date(),
    endTime: new Date(Date.now() + event.roundDurationMinutes * 60 * 1000),
    rooms,
    waitingUsers: waitlist.map(p => p.id),
  };
  
  eventState.rounds.push(round);
  eventState.activeRooms = rooms;
  eventState.waitingRoom = waitlist.map(p => p.id);
  
  // Schedule next round
  setTimeout(() => {
    endCurrentRound(eventId);
  }, event.roundDurationMinutes * 60 * 1000);
  
  return round;
}

/**
 * End the current round
 */
async function endCurrentRound(eventId: string): Promise<void> {
  const eventState = events.get(eventId);
  if (!eventState) return;
  
  const { event } = eventState;
  
  // Mark all rooms as completed
  eventState.activeRooms.forEach(room => {
    room.status = 'completed';
  });
  
  // Check if we should continue
  const maxRounds = calculateRequiredRounds(event.currentParticipants.length);
  
  if (eventState.currentRound >= maxRounds) {
    // End the event
    await endEvent(eventId);
  } else {
    // Start next round after a short break
    setTimeout(() => {
      startNextRound(eventId);
    }, 30 * 1000); // 30 second break between rounds
  }
}

/**
 * End the event and generate final matches
 */
export async function endEvent(eventId: string): Promise<Match[]> {
  const eventState = events.get(eventId);
  if (!eventState) return [];
  
  const { event } = eventState;
  event.status = 'completed';
  eventState.activeRooms = [];
  
  // Generate matches from the event
  const matches: Match[] = [];
  
  // Process all rooms and create potential matches
  eventState.rounds.forEach(round => {
    round.rooms.forEach(room => {
      const [user1Id, user2Id] = room.participants;
      const cacheKey = [user1Id, user2Id].sort().join('-');
      const compatibility = eventState.compatibilityScores.get(cacheKey);
      
      matches.push({
        id: `match-${room.id}`,
        user1Id,
        user2Id,
        eventId,
        roomId: room.id,
        compatibilityScore: compatibility?.score || 50,
        status: 'pending',
        createdAt: new Date(),
        conversationSummary: room.aiSummary,
      });
    });
  });
  
  return matches;
}

/**
 * Get current event state
 */
export function getEventState(eventId: string): EventState | null {
  return events.get(eventId) || null;
}

/**
 * Get room for a user in current round
 */
export function getUserRoom(eventId: string, userId: string): SpeedDatingRoom | null {
  const eventState = events.get(eventId);
  if (!eventState) return null;
  
  return eventState.activeRooms.find(room => 
    room.participants.includes(userId)
  ) || null;
}

/**
 * Check if user is on waitlist for current round
 */
export function isUserWaiting(eventId: string, userId: string): boolean {
  const eventState = events.get(eventId);
  if (!eventState) return false;
  
  return eventState.waitingRoom.includes(userId);
}

/**
 * Register a user profile
 */
export function registerUserProfile(profile: UserProfile): void {
  userProfiles.set(profile.id, profile);
}

/**
 * Get user profile
 */
export function getUserProfile(userId: string): UserProfile | null {
  return userProfiles.get(userId) || null;
}

/**
 * Get all active events
 */
export function getActiveEvents(): SpeedDatingEvent[] {
  const activeEvents: SpeedDatingEvent[] = [];
  events.forEach(state => {
    if (state.event.status === 'upcoming' || state.event.status === 'active') {
      activeEvents.push(state.event);
    }
  });
  return activeEvents;
}

/**
 * Get all events
 */
export function getAllEvents(): SpeedDatingEvent[] {
  return Array.from(events.values()).map(state => state.event);
}

// Helper functions
function generateEventId(): string {
  return `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function createDemoProfile(userId: string): UserProfile {
  const names = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Quinn', 'Drew'];
  const interests = ['Travel', 'Music', 'Cooking', 'Fitness', 'Art', 'Movies', 'Reading', 'Gaming', 'Photography', 'Dancing'];
  
  return {
    id: userId,
    name: names[Math.floor(Math.random() * names.length)],
    age: 25 + Math.floor(Math.random() * 15),
    gender: ['male', 'female', 'non-binary'][Math.floor(Math.random() * 3)] as 'male' | 'female' | 'non-binary',
    lookingFor: ['male', 'female', 'non-binary'],
    bio: 'Looking for meaningful connections!',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
    interests: interests.sort(() => Math.random() - 0.5).slice(0, 4),
    location: 'New York, NY',
    occupation: 'Professional',
    education: 'University Graduate',
    traits: {
      adventurous: Math.floor(Math.random() * 10) + 1,
      intellectual: Math.floor(Math.random() * 10) + 1,
      social: Math.floor(Math.random() * 10) + 1,
      romantic: Math.floor(Math.random() * 10) + 1,
      ambitious: Math.floor(Math.random() * 10) + 1,
      creative: Math.floor(Math.random() * 10) + 1,
      spontaneous: Math.floor(Math.random() * 10) + 1,
      traditional: Math.floor(Math.random() * 10) + 1,
    },
    preferences: {
      ageMin: 21,
      ageMax: 45,
      maxDistance: 50,
    },
  };
}

// Initialize with a demo event
export function initializeDemoEvent(): SpeedDatingEvent {
  const event = createEvent({
    name: 'Friday Night Speed Dating',
    description: 'Meet amazing singles in our virtual speed dating event! 5-minute dates, new matches every round.',
    startTime: new Date(Date.now() + 60 * 1000), // Starts in 1 minute
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
    maxSeats: 40,
    roundDurationMinutes: 5,
    hostId: 'host-1',
    theme: 'Casual Connections',
    ageRange: { min: 21, max: 45 },
  });
  
  // Add some demo participants
  for (let i = 1; i <= 12; i++) {
    const userId = `user-${i}`;
    registerUserProfile(createDemoProfile(userId));
    joinEvent(event.id, userId);
  }
  
  return event;
}

