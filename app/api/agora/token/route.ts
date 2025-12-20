// Agora Token Generation API
import { NextRequest, NextResponse } from 'next/server';
import { RtcTokenBuilder, RtcRole } from 'agora-token';

// Agora credentials from environment
const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID || '';
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { channelName, uid, role = 'publisher', expirationSeconds = 3600 } = body;
    
    if (!channelName) {
      return NextResponse.json(
        { error: 'Channel name is required' },
        { status: 400 }
      );
    }
    
    if (!APP_ID) {
      return NextResponse.json(
        { error: 'Agora App ID not configured. Add NEXT_PUBLIC_AGORA_APP_ID to .env.local' },
        { status: 500 }
      );
    }
    
    // If no certificate, return null token (works for testing mode in Agora Console)
    if (!APP_CERTIFICATE) {
      console.warn('No AGORA_APP_CERTIFICATE - returning null token. Enable "App ID" mode in Agora Console for testing.');
      return NextResponse.json({
        token: null,
        channelName,
        uid: uid || Math.floor(Math.random() * 100000),
        appId: APP_ID,
        message: 'No certificate configured. Make sure your Agora project uses "App ID" authentication mode for testing.',
      });
    }
    
    const rtcRole = role === 'subscriber' ? RtcRole.SUBSCRIBER : RtcRole.PUBLISHER;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationSeconds;
    
    // Generate numeric UID (Agora requires numeric UID for token generation)
    // If uid is a string, hash it to a number
    let numericUid: number;
    if (typeof uid === 'number') {
      numericUid = uid;
    } else if (typeof uid === 'string') {
      // Simple string hash to number
      numericUid = Math.abs(uid.split('').reduce((acc, char) => {
        return ((acc << 5) - acc) + char.charCodeAt(0);
      }, 0)) % 1000000;
    } else {
      numericUid = Math.floor(Math.random() * 100000);
    }
    
    // Generate RTC token
    const token = RtcTokenBuilder.buildTokenWithUid(
      APP_ID,
      APP_CERTIFICATE,
      channelName,
      numericUid,
      rtcRole,
      privilegeExpiredTs,
      privilegeExpiredTs
    );
    
    return NextResponse.json({
      token,
      channelName,
      uid: numericUid,
      appId: APP_ID,
      expiresAt: privilegeExpiredTs * 1000,
    });
  } catch (error) {
    console.error('Token generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate token', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Agora Token API',
    usage: 'POST with { channelName, uid?, role?, expirationSeconds? }',
    configured: {
      appId: !!APP_ID,
      certificate: !!APP_CERTIFICATE,
    },
    note: APP_CERTIFICATE 
      ? 'Token authentication enabled' 
      : 'No certificate - using App ID only mode. Set AGORA_APP_CERTIFICATE in .env.local for token auth.',
  });
}
