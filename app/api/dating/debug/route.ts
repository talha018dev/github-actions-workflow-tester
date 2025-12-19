// Debug API to check event state
import { NextResponse } from 'next/server';
import { getEventState, getAllEvents, getUserProfile } from '@/features/dating/services/eventManager';

export async function GET() {
  const events = getAllEvents();
  
  const debugInfo = events.map(event => {
    const state = getEventState(event.id);
    
    // Get profile info for participants
    const participantDetails = event.currentParticipants.map(id => {
      const profile = getUserProfile(id);
      return { id, hasProfile: !!profile, name: profile?.name };
    });
    
    return {
      id: event.id,
      name: event.name,
      status: event.status,
      participants: participantDetails,
      participantCount: event.currentParticipants.length,
      waitlist: event.waitlist,
      waitingRoom: state?.waitingRoom || [],
      currentRound: state?.currentRound || 0,
      activeRooms: state?.activeRooms?.map(room => ({
        id: room.id,
        channelName: room.channelName,
        participants: room.participants,
        status: room.status,
      })) || [],
      activeRoomCount: state?.activeRooms?.length || 0,
    };
  });
  
  return NextResponse.json({
    message: 'Dating Events Debug Info',
    timestamp: new Date().toISOString(),
    totalEvents: events.length,
    events: debugInfo,
  });
}

