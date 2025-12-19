import { db, queries } from './index';
import type { UserProfile, SpeedDatingEvent, SpeedDatingRoom, Match } from '../types';

// ============ USER OPERATIONS ============

export function createUser(user: UserProfile): UserProfile {
  queries.users.insert.run({
    id: user.id,
    name: user.name,
    age: user.age || null,
    gender: user.gender || null,
    bio: user.bio || null,
    avatar: user.avatar || null,
    interests: JSON.stringify(user.interests || []),
    lookingFor: JSON.stringify(user.lookingFor || []),
    location: user.location || null,
  });
  return user;
}

export function getUser(userId: string): UserProfile | null {
  const row = queries.users.getById.get(userId) as Record<string, unknown> | undefined;
  if (!row) return null;
  
  return {
    id: row.id as string,
    name: row.name as string,
    age: row.age as number,
    gender: row.gender as string,
    bio: row.bio as string,
    avatar: row.avatar as string,
    interests: JSON.parse((row.interests as string) || '[]'),
    lookingFor: JSON.parse((row.lookingFor as string) || '[]'),
    location: row.location as string,
  };
}

export function getAllUsers(): UserProfile[] {
  const rows = queries.users.getAll.all() as Record<string, unknown>[];
  return rows.map(row => ({
    id: row.id as string,
    name: row.name as string,
    age: row.age as number,
    gender: row.gender as string,
    bio: row.bio as string,
    avatar: row.avatar as string,
    interests: JSON.parse((row.interests as string) || '[]'),
    lookingFor: JSON.parse((row.lookingFor as string) || '[]'),
    location: row.location as string,
  }));
}

// ============ EVENT OPERATIONS ============

export function createEvent(event: Omit<SpeedDatingEvent, 'participants' | 'waitlist' | 'waitingRoom' | 'currentRound' | 'activeRooms'>): SpeedDatingEvent {
  const eventId = event.id || `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  queries.events.insert.run({
    id: eventId,
    name: event.name,
    description: event.description || null,
    hostId: event.hostId,
    maxParticipants: event.maxParticipants || 40,
    roundDuration: event.roundDuration || 300,
    status: event.status || 'upcoming',
    scheduledStart: event.scheduledStart?.toISOString() || null,
  });

  return {
    ...event,
    id: eventId,
    participants: [],
    waitlist: [],
    waitingRoom: [],
    currentRound: 0,
    activeRooms: [],
  };
}

export function getEvent(eventId: string): SpeedDatingEvent | null {
  const row = queries.events.getById.get(eventId) as Record<string, unknown> | undefined;
  if (!row) return null;

  // Get participants
  const participantRows = queries.participants.getByEvent.all(eventId) as { user_id: string }[];
  const participants = participantRows.map(p => p.user_id);

  // Get active rooms
  const roomRows = queries.rooms.getActiveByEvent.all(eventId) as Record<string, unknown>[];
  const activeRooms: SpeedDatingRoom[] = roomRows.map(r => {
    const roomParticipants = queries.rooms.getParticipants.all(r.id) as { user_id: string }[];
    return {
      id: r.id as string,
      eventId: r.event_id as string,
      channelName: r.channel_name as string,
      participants: roomParticipants.map(rp => rp.user_id),
      roundNumber: r.round_number as number,
      status: r.status as 'waiting' | 'active' | 'completed',
      startedAt: r.started_at ? new Date(r.started_at as string) : undefined,
      endedAt: r.ended_at ? new Date(r.ended_at as string) : undefined,
    };
  });

  // Get waitlist
  const waitlistRows = queries.waitlist.getByEvent.all(eventId) as { user_id: string }[];
  const waitlist = waitlistRows.map(w => w.user_id);

  return {
    id: row.id as string,
    name: row.name as string,
    description: row.description as string,
    hostId: row.host_id as string,
    maxParticipants: row.max_participants as number,
    roundDuration: row.round_duration as number,
    status: row.status as 'upcoming' | 'active' | 'completed',
    currentRound: row.current_round as number,
    scheduledStart: row.scheduled_start ? new Date(row.scheduled_start as string) : undefined,
    participants,
    waitlist,
    waitingRoom: [], // Computed at runtime
    activeRooms,
  };
}

export function getAllEvents(): SpeedDatingEvent[] {
  const rows = queries.events.getAll.all() as Record<string, unknown>[];
  return rows.map(row => getEvent(row.id as string)).filter(Boolean) as SpeedDatingEvent[];
}

export function updateEventStatus(eventId: string, status: 'upcoming' | 'active' | 'completed', currentRound: number): void {
  queries.events.updateStatus.run(status, currentRound, eventId);
}

// ============ PARTICIPANT OPERATIONS ============

export function addParticipant(eventId: string, userId: string): boolean {
  const event = getEvent(eventId);
  if (!event) return false;

  const count = (queries.participants.count.get(eventId) as { count: number }).count;
  
  if (count >= event.maxParticipants) {
    // Add to waitlist
    queries.waitlist.add.run(eventId, userId);
    return false;
  }

  queries.participants.add.run(eventId, userId);
  return true;
}

export function removeParticipant(eventId: string, userId: string): void {
  queries.participants.remove.run(eventId, userId);
  queries.waitlist.remove.run(eventId, userId);
}

export function getParticipantCount(eventId: string): number {
  return (queries.participants.count.get(eventId) as { count: number }).count;
}

// ============ ROOM OPERATIONS ============

export function createRoom(room: SpeedDatingRoom): SpeedDatingRoom {
  queries.rooms.insert.run({
    id: room.id,
    eventId: room.eventId,
    channelName: room.channelName,
    roundNumber: room.roundNumber,
    status: room.status || 'waiting',
  });

  // Add participants
  for (const participantId of room.participants) {
    queries.rooms.addParticipant.run(room.id, participantId);
    // Track previous match
    if (room.participants.length === 2) {
      const [user1, user2] = room.participants;
      queries.previousMatches.add.run(room.eventId, user1, user2, room.roundNumber);
    }
  }

  return room;
}

export function getRoom(roomId: string): SpeedDatingRoom | null {
  const row = queries.rooms.getById.get(roomId) as Record<string, unknown> | undefined;
  if (!row) return null;

  const participants = queries.rooms.getParticipants.all(roomId) as { user_id: string }[];
  
  return {
    id: row.id as string,
    eventId: row.event_id as string,
    channelName: row.channel_name as string,
    participants: participants.map(p => p.user_id),
    roundNumber: row.round_number as number,
    status: row.status as 'waiting' | 'active' | 'completed',
    startedAt: row.started_at ? new Date(row.started_at as string) : undefined,
    endedAt: row.ended_at ? new Date(row.ended_at as string) : undefined,
  };
}

export function getUserRoom(eventId: string, userId: string): SpeedDatingRoom | null {
  const row = queries.rooms.getRoomForUser.get(eventId, userId) as Record<string, unknown> | undefined;
  if (!row) return null;

  const participants = queries.rooms.getParticipants.all(row.id) as { user_id: string }[];
  
  return {
    id: row.id as string,
    eventId: row.event_id as string,
    channelName: row.channel_name as string,
    participants: participants.map(p => p.user_id),
    roundNumber: row.round_number as number,
    status: row.status as 'waiting' | 'active' | 'completed',
    startedAt: row.started_at ? new Date(row.started_at as string) : undefined,
    endedAt: row.ended_at ? new Date(row.ended_at as string) : undefined,
  };
}

export function updateRoomStatus(roomId: string, status: 'waiting' | 'active' | 'completed'): void {
  queries.rooms.updateStatus.run(status, roomId);
}

// ============ MATCH OPERATIONS ============

export function createMatch(match: Omit<Match, 'createdAt'>): Match {
  queries.matches.insert.run({
    id: match.id,
    eventId: match.eventId,
    roomId: match.roomId,
    user1Id: match.user1Id,
    user2Id: match.user2Id,
    compatibilityScore: match.compatibilityScore,
    status: match.status || 'pending',
  });

  return {
    ...match,
    createdAt: new Date(),
  };
}

export function getEventMatches(eventId: string): Match[] {
  const rows = queries.matches.getByEvent.all(eventId) as Record<string, unknown>[];
  return rows.map(row => ({
    id: row.id as string,
    eventId: row.event_id as string,
    roomId: row.room_id as string,
    user1Id: row.user1_id as string,
    user2Id: row.user2_id as string,
    compatibilityScore: row.compatibility_score as number,
    user1Action: row.user1_action as 'like' | 'pass' | undefined,
    user2Action: row.user2_action as 'like' | 'pass' | undefined,
    status: row.status as 'pending' | 'mutual' | 'rejected',
    transcript: row.transcript as string | undefined,
    aiSummary: row.ai_summary as string | undefined,
    createdAt: new Date(row.created_at as string),
  }));
}

export function getUserMatches(eventId: string, userId: string): Match[] {
  const rows = queries.matches.getByUser.all(eventId, userId, userId) as Record<string, unknown>[];
  return rows.map(row => ({
    id: row.id as string,
    eventId: row.event_id as string,
    roomId: row.room_id as string,
    user1Id: row.user1_id as string,
    user2Id: row.user2_id as string,
    compatibilityScore: row.compatibility_score as number,
    user1Action: row.user1_action as 'like' | 'pass' | undefined,
    user2Action: row.user2_action as 'like' | 'pass' | undefined,
    status: row.status as 'pending' | 'mutual' | 'rejected',
    transcript: row.transcript as string | undefined,
    aiSummary: row.ai_summary as string | undefined,
    createdAt: new Date(row.created_at as string),
  }));
}

export function updateMatchAction(matchId: string, userId: string, action: 'like' | 'pass'): void {
  queries.matches.updateAction.run(matchId, userId, action);
}

export function updateMatchTranscript(matchId: string, transcript: string, aiSummary?: string): void {
  queries.matches.updateTranscript.run(transcript, aiSummary || null, matchId);
}

// ============ MATCHMAKING ============

export function havePreviouslyMatched(eventId: string, user1Id: string, user2Id: string): boolean {
  const result = queries.previousMatches.exists.get(eventId, user1Id, user2Id, user2Id, user1Id);
  return !!result;
}

export function getAvailablePartnersForUser(eventId: string, userId: string): string[] {
  const event = getEvent(eventId);
  if (!event) return [];

  const previousMatchRows = queries.previousMatches.getByEvent.all(eventId) as { user1_id: string; user2_id: string }[];
  const matchedWith = new Set<string>();
  
  for (const row of previousMatchRows) {
    if (row.user1_id === userId) matchedWith.add(row.user2_id);
    if (row.user2_id === userId) matchedWith.add(row.user1_id);
  }

  return event.participants.filter(p => p !== userId && !matchedWith.has(p));
}

// ============ ROUND MANAGEMENT ============

export function startNextRound(eventId: string): { round: number; rooms: SpeedDatingRoom[] } {
  const event = getEvent(eventId);
  if (!event) throw new Error('Event not found');

  // Mark previous rooms as completed
  const prevRooms = queries.rooms.getActiveByEvent.all(eventId) as { id: string }[];
  for (const room of prevRooms) {
    queries.rooms.updateStatus.run('completed', room.id);
  }

  const newRound = event.currentRound + 1;
  updateEventStatus(eventId, 'active', newRound);

  // Get participants and create optimal pairings
  const participants = [...event.participants];
  const rooms: SpeedDatingRoom[] = [];
  const paired = new Set<string>();

  // Sort by available partners (users with fewer options go first)
  participants.sort((a, b) => {
    const aPartners = getAvailablePartnersForUser(eventId, a).length;
    const bPartners = getAvailablePartnersForUser(eventId, b).length;
    return aPartners - bPartners;
  });

  for (const userId of participants) {
    if (paired.has(userId)) continue;

    const availablePartners = getAvailablePartnersForUser(eventId, userId)
      .filter(p => !paired.has(p));

    if (availablePartners.length === 0) continue;

    // Pick the partner with fewest remaining options (greedy matching)
    const partner = availablePartners.reduce((best, curr) => {
      const bestOptions = getAvailablePartnersForUser(eventId, best).filter(p => !paired.has(p)).length;
      const currOptions = getAvailablePartnersForUser(eventId, curr).filter(p => !paired.has(p)).length;
      return currOptions < bestOptions ? curr : best;
    });

    paired.add(userId);
    paired.add(partner);

    const roomId = `${eventId}-r${newRound}-${rooms.length}`;
    const room: SpeedDatingRoom = {
      id: roomId,
      eventId,
      channelName: `speed-date-${roomId}`,
      participants: [userId, partner],
      roundNumber: newRound,
      status: 'active',
      startedAt: new Date(),
    };

    createRoom(room);
    
    // Create match record
    createMatch({
      id: `match-${roomId}`,
      eventId,
      roomId,
      user1Id: userId,
      user2Id: partner,
      compatibilityScore: Math.floor(Math.random() * 30) + 50, // 50-80 random score
      status: 'pending',
    });

    rooms.push(room);
  }

  // Users without pairs go to waitlist for this round
  const waitingUsers = participants.filter(p => !paired.has(p));
  for (const userId of waitingUsers) {
    queries.waitlist.add.run(eventId, userId);
  }

  console.log(`🎯 Round ${newRound}: Created ${rooms.length} rooms, ${waitingUsers.length} waiting`);

  return { round: newRound, rooms };
}

// ============ DEBUG ============

export function getDebugInfo() {
  const events = getAllEvents();
  const users = getAllUsers();
  
  return {
    totalEvents: events.length,
    totalUsers: users.length,
    events: events.map(e => ({
      id: e.id,
      name: e.name,
      status: e.status,
      participants: e.participants.length,
      currentRound: e.currentRound,
      activeRooms: e.activeRooms.length,
    })),
    users: users.map(u => ({ id: u.id, name: u.name })),
  };
}

