// Dating Events API - Using SQLite Database
import { DEMO_USERS } from '@/features/dating/data/demoUsers';
import {
  addParticipant,
  createEvent,
  createUser,
  getAllEvents,
  getEvent,
  getUser,
  removeParticipant,
} from '@/features/dating/database/datingService';
import type { UserProfile } from '@/features/dating/types';
import { NextRequest, NextResponse } from 'next/server';

// Initialize demo data on first load
let initialized = false;

function ensureInitialized() {
  if (!initialized) {
    // Register demo users
    for (const user of DEMO_USERS) {
      const existing = getUser(user.id);
      if (!existing) {
        createUser(user);
      }
    }
    
    // Create a demo event
    const existingEvents = getAllEvents();
    if (existingEvents.length === 0) {
      createEvent({
        id: `event-${Date.now()}-demo`,
        name: 'Friday Night Speed Dating 💕',
        description: 'Meet amazing people in 5-minute rounds!',
        hostId: 'system',
        maxParticipants: 40,
        roundDuration: 300,
        status: 'upcoming',
      });
    }
    
    initialized = true;
    console.log('🚀 Dating app initialized with demo data');
  }
}

// GET - List all events
export async function GET(request: NextRequest) {
  ensureInitialized();
  
  const { searchParams } = new URL(request.url);
  const activeOnly = searchParams.get('active') === 'true';
  
  let events = getAllEvents();
  
  if (activeOnly) {
    events = events.filter(e => e.status === 'active');
  }
  
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
        const { name, description, maxSeats, roundDurationMinutes, hostId } = body;
        
        if (!name || !maxSeats || !hostId) {
          return NextResponse.json(
            { success: false, error: 'Missing required fields: name, maxSeats, hostId' },
            { status: 400 }
          );
        }
        
        const event = createEvent({
          id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name,
          description: description || '',
          hostId,
          maxParticipants: maxSeats,
          roundDuration: (roundDurationMinutes || 5) * 60,
          status: 'upcoming',
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
          createUser(userProfile as UserProfile);
        }
        
        const event = getEvent(eventId);
        if (!event) {
          return NextResponse.json(
            { success: false, error: 'Event not found' },
            { status: 404 }
          );
        }
        
        const joined = addParticipant(eventId, userId);
        const updatedEvent = getEvent(eventId);
        const position = updatedEvent?.participants.indexOf(userId) ?? -1;
        
        return NextResponse.json({
          success: true,
          joined,
          position: position + 1,
          isWaitlisted: !joined,
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
        
        removeParticipant(eventId, userId);
        
        return NextResponse.json({ success: true });
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
