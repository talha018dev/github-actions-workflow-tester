// Dating Events API
import { NextRequest, NextResponse } from 'next/server';
import {
  createEvent,
  getAllEvents,
  getActiveEvents,
  joinEvent,
  leaveEvent,
  registerUserProfile,
  initializeDemoEvent,
} from '@/features/dating/services/eventManager';
import type { UserProfile } from '@/features/dating/types';

// Initialize demo event on first load
let initialized = false;

function ensureInitialized() {
  if (!initialized) {
    initializeDemoEvent();
    initialized = true;
  }
}

// GET - List all events
export async function GET(request: NextRequest) {
  ensureInitialized();
  
  const { searchParams } = new URL(request.url);
  const activeOnly = searchParams.get('active') === 'true';
  
  const events = activeOnly ? getActiveEvents() : getAllEvents();
  
  return NextResponse.json({
    success: true,
    events,
    count: events.length,
  });
}

// POST - Create a new event or join an event
export async function POST(request: NextRequest) {
  ensureInitialized();
  
  try {
    const body = await request.json();
    const { action } = body;
    
    switch (action) {
      case 'create': {
        const { name, description, maxSeats, roundDurationMinutes, hostId, theme, ageRange, startTime, endTime } = body;
        
        if (!name || !maxSeats || !hostId) {
          return NextResponse.json(
            { success: false, error: 'Missing required fields: name, maxSeats, hostId' },
            { status: 400 }
          );
        }
        
        const event = createEvent({
          name,
          description: description || '',
          maxSeats,
          roundDurationMinutes: roundDurationMinutes || 5,
          hostId,
          theme,
          ageRange,
          startTime: startTime ? new Date(startTime) : new Date(Date.now() + 60 * 60 * 1000),
          endTime: endTime ? new Date(endTime) : new Date(Date.now() + 3 * 60 * 60 * 1000),
        });
        
        return NextResponse.json({
          success: true,
          event,
        });
      }
      
      case 'join': {
        const { eventId, userId, userProfile } = body;
        
        if (!eventId || !userId) {
          return NextResponse.json(
            { success: false, error: 'Missing required fields: eventId, userId' },
            { status: 400 }
          );
        }
        
        // Register user profile if provided
        if (userProfile) {
          registerUserProfile(userProfile as UserProfile);
        }
        
        const result = joinEvent(eventId, userId);
        
        if (!result.success) {
          return NextResponse.json(
            { success: false, error: result.error },
            { status: 400 }
          );
        }
        
        return NextResponse.json({
          success: true,
          position: result.position,
          isWaitlisted: result.position! > 40, // Assuming 40 max seats
        });
      }
      
      case 'leave': {
        const { eventId, userId } = body;
        
        if (!eventId || !userId) {
          return NextResponse.json(
            { success: false, error: 'Missing required fields: eventId, userId' },
            { status: 400 }
          );
        }
        
        const success = leaveEvent(eventId, userId);
        
        return NextResponse.json({ success });
      }
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: create, join, or leave' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Event API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

