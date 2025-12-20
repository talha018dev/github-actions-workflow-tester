// Matches API for speed dating - Using SQLite Database
import { NextRequest, NextResponse } from 'next/server';
import {
  getEventMatches,
  getUserMatches,
  updateMatchAction,
  updateMatchTranscript,
  createMatch,
} from '@/features/dating/database/datingService';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const eventId = searchParams.get('eventId');
  
  if (!eventId) {
    return NextResponse.json(
      { success: false, error: 'eventId is required' },
      { status: 400 }
    );
  }
  
  let matches;
  
  if (userId) {
    matches = getUserMatches(eventId, userId);
  } else {
    matches = getEventMatches(eventId);
  }
  
  return NextResponse.json({
    success: true,
    matches,
    count: matches.length,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, matchId, userId, userAction } = body;
    
    switch (action) {
      case 'rate': {
        // User rates their match (like or pass)
        if (!matchId || !userId || !userAction) {
          return NextResponse.json(
            { success: false, error: 'Missing required fields: matchId, userId, userAction' },
            { status: 400 }
          );
        }
        
        updateMatchAction(matchId, userId, userAction);
        
        return NextResponse.json({
          success: true,
          message: 'Match action recorded',
        });
      }
      
      case 'create': {
        // Create a new match record
        const { user1Id, user2Id, eventId, roomId, compatibilityScore } = body;
        
        if (!user1Id || !user2Id || !eventId) {
          return NextResponse.json(
            { success: false, error: 'Missing required fields: user1Id, user2Id, eventId' },
            { status: 400 }
          );
        }
        
        const newMatch = createMatch({
          id: `match-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          user1Id,
          user2Id,
          eventId,
          roomId: roomId || '',
          compatibilityScore: compatibilityScore || 50,
          status: 'pending',
        });
        
        return NextResponse.json({
          success: true,
          match: newMatch,
        });
      }
      
      case 'updateSummary': {
        // Update match with conversation summary
        const { transcript, aiSummary } = body;
        
        if (!matchId) {
          return NextResponse.json(
            { success: false, error: 'Missing required field: matchId' },
            { status: 400 }
          );
        }
        
        updateMatchTranscript(matchId, transcript || '', aiSummary);
        
        return NextResponse.json({
          success: true,
          message: 'Transcript updated',
        });
      }
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: rate, create, or updateSummary' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Match API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
