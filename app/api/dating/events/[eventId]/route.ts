// Individual Event API - Using SQLite Database
import {
  getEvent,
  getEventMatches,
  getUserRoom,
  startNextRound,
  updateEventStatus,
  updateRoomStatus,
} from '@/features/dating/database/datingService';
import { NextRequest, NextResponse } from 'next/server';

type RouteParams = {
  params: Promise<{ eventId: string }>;
};

// GET - Get event details and current state
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { eventId } = await params;
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  const event = getEvent(eventId);
  
  if (!event) {
    return NextResponse.json(
      { success: false, error: 'Event not found' },
      { status: 404 }
    );
  }
  
  const response: Record<string, unknown> = {
    success: true,
    event: {
      id: event.id,
      name: event.name,
      description: event.description,
      status: event.status,
      currentRound: event.currentRound,
      maxParticipants: event.maxParticipants,
      roundDuration: event.roundDuration,
      currentParticipants: event.participants,
    },
    currentRound: event.currentRound,
    participantCount: event.participants.length,
    waitlistCount: event.waitlist.length,
  };
  
  // If userId provided, include their specific state
  if (userId) {
    const userRoom = getUserRoom(eventId, userId);
    const isWaiting = event.waitlist.includes(userId);
    
    response.userState = {
      isInRoom: !!userRoom,
      room: userRoom ? {
        id: userRoom.id,
        eventId: userRoom.eventId,
        channelName: userRoom.channelName,
        participants: userRoom.participants,
        partnerId: userRoom.participants.find(id => id !== userId),
        roundNumber: userRoom.roundNumber,
        startTime: userRoom.startedAt,
        endTime: userRoom.endedAt,
        status: userRoom.status,
      } : null,
      isWaiting,
      waitingPosition: isWaiting ? event.waitlist.indexOf(userId) + 1 : null,
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
    
    const event = getEvent(eventId);
    
    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }
    
    switch (action) {
      case 'start': {
        if (event.participants.length < 2) {
          return NextResponse.json(
            { success: false, error: 'Need at least 2 participants to start' },
            { status: 400 }
          );
        }
        
        // Start first round
        const result = startNextRound(eventId);
        
        return NextResponse.json({
          success: true,
          message: 'Event started',
          currentRound: result.round,
          activeRooms: result.rooms.length,
        });
      }
      
      case 'nextRound': {
        const result = startNextRound(eventId);
        
        return NextResponse.json({
          success: true,
          round: {
            roundNumber: result.round,
            roomCount: result.rooms.length,
          },
        });
      }
      
      case 'end': {
        // Mark all rooms as completed
        for (const room of event.activeRooms) {
          updateRoomStatus(room.id, 'completed');
        }
        
        updateEventStatus(eventId, 'completed', event.currentRound);
        const matches = getEventMatches(eventId);
        
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
        const isWaiting = event.waitlist.includes(userId);
        
        return NextResponse.json({
          success: true,
          hasRoom: !!userRoom,
          room: userRoom,
          isWaiting,
          waitingPosition: isWaiting ? event.waitlist.indexOf(userId) + 1 : null,
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
