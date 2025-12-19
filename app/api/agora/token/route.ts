// Agora Token Generation API
import { NextRequest, NextResponse } from 'next/server';

// Agora credentials from environment
const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID || '';
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE || '';

// Token roles
const RtcRole = {
  PUBLISHER: 1,
  SUBSCRIBER: 2,
};

/**
 * Simple Agora RTC token generator
 * In production, use the official agora-access-token package
 */
function generateRtcToken(
  appId: string,
  appCertificate: string,
  channelName: string,
  uid: number | string,
  role: number,
  privilegeExpiredTs: number
): string {
  // For development/demo, we'll use a simplified approach
  // In production, install and use: npm install agora-access-token
  
  // If no certificate is provided, return empty (works for testing with App ID only)
  if (!appCertificate) {
    console.warn('No Agora App Certificate provided - using App ID only mode');
    return '';
  }
  
  // Generate a basic token structure
  // Note: This is a placeholder - in production use the official SDK
  const message = {
    appId,
    channelName,
    uid: typeof uid === 'string' ? uid : uid.toString(),
    role,
    expireAt: privilegeExpiredTs,
    salt: Math.floor(Math.random() * 100000),
  };
  
  // Encode the message (simplified - use proper signing in production)
  const encoded = Buffer.from(JSON.stringify(message)).toString('base64');
  
  return encoded;
}

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
        { error: 'Agora App ID not configured' },
        { status: 500 }
      );
    }
    
    const rtcRole = role === 'subscriber' ? RtcRole.SUBSCRIBER : RtcRole.PUBLISHER;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationSeconds;
    
    // Generate user ID if not provided
    const finalUid = uid || Math.floor(Math.random() * 100000);
    
    // Generate token
    const token = generateRtcToken(
      APP_ID,
      APP_CERTIFICATE,
      channelName,
      finalUid,
      rtcRole,
      privilegeExpiredTs
    );
    
    return NextResponse.json({
      token,
      channelName,
      uid: finalUid.toString(),
      appId: APP_ID,
      expiresAt: privilegeExpiredTs * 1000, // Convert to milliseconds
    });
  } catch (error) {
    console.error('Token generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Agora Token API',
    usage: 'POST with { channelName, uid?, role?, expirationSeconds? }',
  });
}

