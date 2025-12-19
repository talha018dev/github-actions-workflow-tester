// User Profile API for dating - Using SQLite Database
import { createUser, getUser } from '@/features/dating/database/datingService';
import type { UserProfile } from '@/features/dating/types';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  if (!userId) {
    return NextResponse.json(
      { success: false, error: 'userId is required' },
      { status: 400 }
    );
  }
  
  const profile = getUser(userId);
  
  if (!profile) {
    return NextResponse.json(
      { success: false, error: 'Profile not found' },
      { status: 404 }
    );
  }
  
  return NextResponse.json({
    success: true,
    profile,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, profile } = body;
    
    switch (action) {
      case 'create':
      case 'update': {
        if (!profile || !profile.id) {
          return NextResponse.json(
            { success: false, error: 'Profile with id is required' },
            { status: 400 }
          );
        }
        
        // Validate required fields
        const requiredFields = ['name'];
        for (const field of requiredFields) {
          if (!profile[field]) {
            return NextResponse.json(
              { success: false, error: `Missing required field: ${field}` },
              { status: 400 }
            );
          }
        }
        
        // Set defaults for optional fields
        const fullProfile: UserProfile = {
          id: profile.id,
          name: profile.name,
          age: profile.age || 25,
          gender: profile.gender || 'other',
          lookingFor: profile.lookingFor || ['everyone'],
          bio: profile.bio || '',
          avatar: profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`,
          interests: profile.interests || [],
          location: profile.location || '',
        };
        
        createUser(fullProfile);
        
        return NextResponse.json({
          success: true,
          profile: fullProfile,
        });
      }
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: create or update' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
