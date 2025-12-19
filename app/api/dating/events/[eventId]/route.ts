// Individual Event API
import { NextRequest, NextResponse } from 'next/server';
import {
  getEventState,
  startEvent,
  endEvent,
  getUserRoom,
  isUserWaiting,
  startNextRound,
} from '@/features/dating/services/eventManager';

type RouteParams = {
  params: Promise<{ eventId: string }>;
};

// GET - Get event details and current state
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { eventId } = await params;
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  const eventState = getEventState(eventId);
  
  if (!eventState) {
    return NextResponse.json(
      { success: false, error: 'Event not found' },
      { status: 404 }
    );
  }
  
  const response: Record<string, unknown> = {
    success: true,
    event: eventState.event,
    currentRound: eventState.currentRound,
    totalRounds: eventState.rounds.length,
    participantCount: eventState.event.currentParticipants.length,
    waitlistCount: eventState.event.waitlist.length,
  };
  
  // If userId provided, include their specific state
  if (userId) {
    const userRoom = getUserRoom(eventId, userId);
    const isWaiting = isUserWaiting(eventId, userId);
    
    response.userState = {
      isInRoom: !!userRoom,
      room: userRoom ? {
        id: userRoom.id,
        eventId: userRoom.eventId,
        channelName: userRoom.channelName,
        participants: userRoom.participants, // Include full participants array
        partnerId: userRoom.participants.find(id => id !== userId),
        roundNumber: userRoom.roundNumber,
        startTime: userRoom.startTime,
        endTime: userRoom.endTime,
        status: userRoom.status,
      } : null,
      isWaiting,
      waitingPosition: isWaiting ? eventState.waitingRoom.indexOf(userId) + 1 : null,
    };
  }
  
  return NextResponse.json(response);
}

// POST - Control event (start, next round, end)
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { eventId } = await params;
  
  try {
    const body = await request.json();
    const { action } = body;
    
    const eventState = getEventState(eventId);
    
    if (!eventState) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }
    
    switch (action) {
      case 'start': {
        const result = await startEvent(eventId);
        
        if (!result.success) {
          return NextResponse.json(
            { success: false, error: result.error },
            { status: 400 }
          );
        }
        
        const updatedState = getEventState(eventId);
        
        return NextResponse.json({
          success: true,
          message: 'Event started',
          currentRound: updatedState?.currentRound,
          activeRooms: updatedState?.activeRooms.length,
        });
      }
      
      case 'nextRound': {
        const round = await startNextRound(eventId);
        
        if (!round) {
          return NextResponse.json(
            { success: false, error: 'Failed to start next round' },
            { status: 500 }
          );
        }
        
        return NextResponse.json({
          success: true,
          round: {
            roundNumber: round.roundNumber,
            startTime: round.startTime,
            endTime: round.endTime,
            roomCount: round.rooms.length,
            waitingCount: round.waitingUsers.length,
          },
        });
      }
      
      case 'end': {
        const matches = await endEvent(eventId);
        
        return NextResponse.json({
          success: true,
          message: 'Event ended',
          matchCount: matches.length,
          matches,
        });
      }
      
      case 'getRoomInfo': {
        const { userId } = body;
        
        if (!userId) {
          return NextResponse.json(
            { success: false, error: 'userId required' },
            { status: 400 }
          );
        }
        
        const userRoom = getUserRoom(eventId, userId);
        const isWaiting = isUserWaiting(eventId, userId);
        
        return NextResponse.json({
          success: true,
          hasRoom: !!userRoom,
          room: userRoom,
          isWaiting,
          waitingPosition: isWaiting ? eventState.waitingRoom.indexOf(userId) + 1 : null,
        });
      }
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: start, nextRound, end, or getRoomInfo' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Event control error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

