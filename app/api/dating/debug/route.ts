// Debug API to check database state
import { NextResponse } from 'next/server';
import { getDebugInfo, getAllEvents, getUser } from '@/features/dating/database/datingService';

export async function GET() {
  const debugInfo = getDebugInfo();
  const events = getAllEvents();
  
  const detailedEvents = events.map(event => {
    // Get profile info for participants
    const participantDetails = event.participants.map(id => {
      const profile = getUser(id);
      return { id, hasProfile: !!profile, name: profile?.name };
    });
    
    return {
      id: event.id,
      name: event.name,
      status: event.status,
      participants: participantDetails,
      participantCount: event.participants.length,
      waitlist: event.waitlist,
      currentRound: event.currentRound,
      activeRooms: event.activeRooms.map(room => ({
        id: room.id,
        channelName: room.channelName,
        participants: room.participants,
        roundNumber: room.roundNumber,
        status: room.status,
      })),
      activeRoomCount: event.activeRooms.length,
    };
  });
  
  return NextResponse.json({
    message: 'Dating Database Debug Info (SQLite In-Memory)',
    timestamp: new Date().toISOString(),
    summary: debugInfo,
    events: detailedEvents,
  });
}
