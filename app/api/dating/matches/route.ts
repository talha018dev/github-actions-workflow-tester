// Matches API for speed dating
import { NextRequest, NextResponse } from 'next/server';
import type { Match } from '@/features/dating/types';

// In-memory store for matches (replace with database in production)
const matches: Map<string, Match> = new Map();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const eventId = searchParams.get('eventId');
  
  let userMatches = Array.from(matches.values());
  
  if (userId) {
    userMatches = userMatches.filter(m => m.user1Id === userId || m.user2Id === userId);
  }
  
  if (eventId) {
    userMatches = userMatches.filter(m => m.eventId === eventId);
  }
  
  return NextResponse.json({
    success: true,
    matches: userMatches,
    count: userMatches.length,
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
        
        const match = matches.get(matchId);
        if (!match) {
          return NextResponse.json(
            { success: false, error: 'Match not found' },
            { status: 404 }
          );
        }
        
        // Update the appropriate user's action
        if (match.user1Id === userId) {
          match.user1Action = userAction;
        } else if (match.user2Id === userId) {
          match.user2Action = userAction;
        } else {
          return NextResponse.json(
            { success: false, error: 'User not part of this match' },
            { status: 400 }
          );
        }
        
        // Check if it's a mutual match
        if (match.user1Action === 'liked' && match.user2Action === 'liked') {
          match.status = 'mutual';
        } else if (match.user1Action && match.user2Action) {
          // Both have acted but not both liked
          match.status = 'rejected';
        }
        
        matches.set(matchId, match);
        
        return NextResponse.json({
          success: true,
          match,
          isMutual: match.status === 'mutual',
        });
      }
      
      case 'create': {
        // Create a new match record (called by event manager)
        const { user1Id, user2Id, eventId, roomId, compatibilityScore } = body;
        
        if (!user1Id || !user2Id) {
          return NextResponse.json(
            { success: false, error: 'Missing required fields: user1Id, user2Id' },
            { status: 400 }
          );
        }
        
        const newMatch: Match = {
          id: `match-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          user1Id,
          user2Id,
          eventId,
          roomId,
          compatibilityScore: compatibilityScore || 50,
          status: 'pending',
          createdAt: new Date(),
        };
        
        matches.set(newMatch.id, newMatch);
        
        return NextResponse.json({
          success: true,
          match: newMatch,
        });
      }
      
      case 'updateSummary': {
        // Update match with conversation summary
        const { conversationSummary } = body;
        
        if (!matchId || !conversationSummary) {
          return NextResponse.json(
            { success: false, error: 'Missing required fields: matchId, conversationSummary' },
            { status: 400 }
          );
        }
        
        const match = matches.get(matchId);
        if (!match) {
          return NextResponse.json(
            { success: false, error: 'Match not found' },
            { status: 404 }
          );
        }
        
        match.conversationSummary = conversationSummary;
        matches.set(matchId, match);
        
        return NextResponse.json({
          success: true,
          match,
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

