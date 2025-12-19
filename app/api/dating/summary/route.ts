// AI Summary Generation API for dating conversations
import { NextRequest, NextResponse } from 'next/server';

// In production, use OpenAI or another LLM provider
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface TranscriptEntry {
  speaker: string;
  text: string;
  timestamp: number;
}

/**
 * Generate an AI summary of a dating conversation
 * Analyzes the transcript for:
 * - Compatibility signals
 * - Shared interests discussed
 * - Conversation quality
 * - Key talking points
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transcript, user1Name, user2Name } = body as {
      transcript: TranscriptEntry[];
      user1Name?: string;
      user2Name?: string;
    };
    
    if (!transcript || transcript.length === 0) {
      return NextResponse.json({
        success: true,
        summary: "No conversation to summarize yet.",
        highlights: [],
        compatibilitySignals: [],
        conversationScore: 0,
      });
    }
    
    // Format transcript for analysis
    const formattedTranscript = transcript
      .map(entry => `${entry.speaker}: ${entry.text}`)
      .join('\n');
    
    // If OpenAI is configured, use it
    if (OPENAI_API_KEY) {
      const response = await generateOpenAISummary(formattedTranscript, user1Name, user2Name);
      return NextResponse.json(response);
    }
    
    // Otherwise, use mock analysis
    const mockSummary = generateMockSummary(transcript, user1Name, user2Name);
    return NextResponse.json(mockSummary);
    
  } catch (error) {
    console.error('Summary generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}

/**
 * Generate summary using OpenAI
 */
async function generateOpenAISummary(
  transcript: string, 
  user1Name?: string, 
  user2Name?: string
) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an AI dating coach analyzing a speed dating conversation. 
            Provide a brief, insightful summary that highlights:
            1. Key conversation topics
            2. Shared interests or values discovered
            3. Signs of compatibility or chemistry
            4. Overall conversation quality
            
            Be positive but realistic. Format your response as JSON with:
            - summary: A 2-3 sentence overview
            - highlights: Array of 3-5 notable moments
            - compatibilitySignals: Array of positive compatibility indicators
            - conversationScore: 1-100 rating of conversation quality
            - sharedInterests: Array of interests both mentioned`
          },
          {
            role: 'user',
            content: `Analyze this speed dating conversation between ${user1Name || 'User 1'} and ${user2Name || 'User 2'}:\n\n${transcript}`
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });
    
    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    try {
      const parsed = JSON.parse(content);
      return { success: true, ...parsed };
    } catch {
      return {
        success: true,
        summary: content,
        highlights: [],
        compatibilitySignals: [],
        conversationScore: 70,
      };
    }
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
}

/**
 * Generate mock summary when OpenAI is not available
 */
function generateMockSummary(
  transcript: TranscriptEntry[],
  user1Name?: string,
  user2Name?: string
) {
  // Analyze transcript length and content
  const messageCount = transcript.length;
  const avgMessageLength = transcript.reduce((sum, t) => sum + t.text.length, 0) / messageCount;
  
  // Extract potential topics (simple keyword matching)
  const allText = transcript.map(t => t.text.toLowerCase()).join(' ');
  
  const topicKeywords: Record<string, string[]> = {
    travel: ['travel', 'trip', 'vacation', 'country', 'visit', 'abroad', 'adventure'],
    music: ['music', 'song', 'concert', 'band', 'listen', 'play', 'guitar', 'piano'],
    food: ['food', 'restaurant', 'cook', 'eat', 'cuisine', 'recipe', 'dinner'],
    work: ['work', 'job', 'career', 'office', 'company', 'business', 'profession'],
    hobbies: ['hobby', 'fun', 'weekend', 'free time', 'enjoy', 'like to'],
    sports: ['sport', 'gym', 'workout', 'fitness', 'run', 'exercise', 'yoga'],
    movies: ['movie', 'film', 'watch', 'netflix', 'show', 'series', 'actor'],
    books: ['book', 'read', 'author', 'story', 'novel'],
  };
  
  const foundTopics: string[] = [];
  Object.entries(topicKeywords).forEach(([topic, keywords]) => {
    if (keywords.some(kw => allText.includes(kw))) {
      foundTopics.push(topic);
    }
  });
  
  // Calculate a conversation score
  let score = 50; // Base score
  score += Math.min(messageCount * 2, 20); // More messages = better
  score += Math.min(avgMessageLength / 5, 15); // Longer messages = more engaged
  score += foundTopics.length * 5; // More topics = deeper conversation
  score = Math.min(score, 100);
  
  // Generate summary
  const summaryTemplates = [
    `${user1Name || 'You'} and ${user2Name || 'your match'} had an engaging conversation covering ${foundTopics.slice(0, 3).join(', ') || 'various topics'}. The discussion showed good rapport and mutual interest.`,
    `The conversation between ${user1Name || 'you'} and ${user2Name || 'your match'} flowed naturally, with both participants showing genuine curiosity about each other's ${foundTopics[0] || 'interests'}.`,
    `A lively exchange where ${user1Name || 'you'} and ${user2Name || 'your match'} discovered common ground in ${foundTopics.slice(0, 2).join(' and ') || 'shared experiences'}.`,
  ];
  
  const highlights = [
    foundTopics.length > 2 ? `Discussed multiple shared interests including ${foundTopics.slice(0, 2).join(' and ')}` : null,
    messageCount > 5 ? 'Maintained an engaging back-and-forth dialogue' : null,
    avgMessageLength > 50 ? 'Both participants shared thoughtful, detailed responses' : null,
    'Showed genuine interest in learning about each other',
  ].filter(Boolean) as string[];
  
  const compatibilitySignals = [
    foundTopics.includes('travel') ? '🌍 Both enjoy exploring new places' : null,
    foundTopics.includes('music') ? '🎵 Shared appreciation for music' : null,
    foundTopics.includes('food') ? '🍕 Food enthusiasts' : null,
    foundTopics.includes('hobbies') ? '⭐ Similar lifestyle preferences' : null,
    messageCount > 8 ? '💬 Natural conversation flow' : null,
  ].filter(Boolean) as string[];
  
  return {
    success: true,
    summary: summaryTemplates[Math.floor(Math.random() * summaryTemplates.length)],
    highlights: highlights.slice(0, 4),
    compatibilitySignals: compatibilitySignals.slice(0, 3),
    conversationScore: Math.round(score),
    sharedInterests: foundTopics,
    messageCount,
  };
}

export async function GET() {
  return NextResponse.json({
    message: 'AI Summary API for dating conversations',
    usage: 'POST with { transcript: TranscriptEntry[], user1Name?, user2Name? }',
  });
}

