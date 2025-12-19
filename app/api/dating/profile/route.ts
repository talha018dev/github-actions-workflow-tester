// User Profile API for dating
import { NextRequest, NextResponse } from 'next/server';
import { registerUserProfile, getUserProfile } from '@/features/dating/services/eventManager';
import type { UserProfile } from '@/features/dating/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  if (!userId) {
    return NextResponse.json(
      { success: false, error: 'userId is required' },
      { status: 400 }
    );
  }
  
  const profile = getUserProfile(userId);
  
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
        const requiredFields = ['name', 'age', 'gender', 'lookingFor'];
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
          age: profile.age,
          gender: profile.gender,
          lookingFor: profile.lookingFor,
          bio: profile.bio || '',
          avatar: profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`,
          interests: profile.interests || [],
          location: profile.location || '',
          occupation: profile.occupation || '',
          education: profile.education || '',
          traits: profile.traits || {
            adventurous: 5,
            intellectual: 5,
            social: 5,
            romantic: 5,
            ambitious: 5,
            creative: 5,
            spontaneous: 5,
            traditional: 5,
          },
          preferences: profile.preferences || {
            ageMin: 18,
            ageMax: 99,
            maxDistance: 100,
          },
        };
        
        registerUserProfile(fullProfile);
        
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

