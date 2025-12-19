// Debug API to check event state
import { NextResponse } from 'next/server';
import { getEventState, getAllEvents } from '@/features/dating/services/eventManager';

export async function GET() {
  const events = getAllEvents();
  
  const debugInfo = events.map(event => {
    const state = getEventState(event.id);
    return {
      id: event.id,
      name: event.name,
      status: event.status,
      participants: event.currentParticipants,
      participantCount: event.currentParticipants.length,
      waitlist: event.waitlist,
      currentRound: state?.currentRound || 0,
      activeRooms: state?.activeRooms?.length || 0,
    };
  });
  
  return NextResponse.json({
    message: 'Dating Events Debug Info',
    timestamp: new Date().toISOString(),
    totalEvents: events.length,
    events: debugInfo,
  });
}

