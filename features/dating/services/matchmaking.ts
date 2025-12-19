// Matchmaking algorithm for speed dating events

import type { 
  UserProfile, 
  CompatibilityScore, 
  SpeedDatingRoom,
  EventState 
} from '../types';

/**
 * Calculate compatibility score between two users
 */
export function calculateCompatibility(user1: UserProfile, user2: UserProfile): CompatibilityScore {
  const interestMatch = calculateInterestMatch(user1.interests, user2.interests);
  const traitCompatibility = calculateTraitCompatibility(user1.traits, user2.traits);
  const preferenceMatch = calculatePreferenceMatch(user1, user2);
  
  // Weighted score calculation
  const weights = {
    interests: 0.3,
    traits: 0.4,
    preferences: 0.3,
  };
  
  const overallScore = Math.round(
    interestMatch * weights.interests +
    traitCompatibility * weights.traits +
    preferenceMatch * weights.preferences
  );
  
  return {
    userId1: user1.id,
    userId2: user2.id,
    score: overallScore,
    breakdown: {
      interestMatch,
      traitCompatibility,
      preferenceMatch,
    },
    calculatedAt: new Date(),
  };
}

/**
 * Calculate interest overlap percentage
 */
function calculateInterestMatch(interests1: string[], interests2: string[]): number {
  if (interests1.length === 0 || interests2.length === 0) return 50;
  
  const set1 = new Set(interests1.map(i => i.toLowerCase()));
  const set2 = new Set(interests2.map(i => i.toLowerCase()));
  
  let matchCount = 0;
  set1.forEach(interest => {
    if (set2.has(interest)) matchCount++;
  });
  
  const totalUnique = new Set([...interests1, ...interests2]).size;
  const overlapRatio = matchCount / Math.min(set1.size, set2.size);
  
  // Bonus for having variety
  const varietyBonus = Math.min(totalUnique / 10, 1) * 20;
  
  return Math.min(100, Math.round(overlapRatio * 80 + varietyBonus));
}

/**
 * Calculate personality trait compatibility using complementary matching
 */
function calculateTraitCompatibility(
  traits1: UserProfile['traits'], 
  traits2: UserProfile['traits']
): number {
  // Some traits are better when similar, others when complementary
  const similarityTraits: (keyof UserProfile['traits'])[] = [
    'intellectual', 'social', 'romantic', 'traditional'
  ];
  
  const complementaryTraits: (keyof UserProfile['traits'])[] = [
    'adventurous', 'ambitious', 'creative', 'spontaneous'
  ];
  
  let similarityScore = 0;
  similarityTraits.forEach(trait => {
    const diff = Math.abs(traits1[trait] - traits2[trait]);
    similarityScore += (10 - diff) / 10;
  });
  similarityScore = (similarityScore / similarityTraits.length) * 100;
  
  let complementaryScore = 0;
  complementaryTraits.forEach(trait => {
    // Ideal is when combined they're around 12-15 (not too extreme either way)
    const combined = traits1[trait] + traits2[trait];
    const ideal = 12;
    const deviation = Math.abs(combined - ideal);
    complementaryScore += Math.max(0, (10 - deviation)) / 10;
  });
  complementaryScore = (complementaryScore / complementaryTraits.length) * 100;
  
  return Math.round((similarityScore * 0.6 + complementaryScore * 0.4));
}

/**
 * Calculate how well users' preferences align
 */
function calculatePreferenceMatch(user1: UserProfile, user2: UserProfile): number {
  let score = 100;
  
  // Gender preference check
  if (!user1.lookingFor.includes(user2.gender)) score -= 30;
  if (!user2.lookingFor.includes(user1.gender)) score -= 30;
  
  // Age preference check
  if (user2.age < user1.preferences.ageMin || user2.age > user1.preferences.ageMax) {
    score -= 20;
  }
  if (user1.age < user2.preferences.ageMin || user1.age > user2.preferences.ageMax) {
    score -= 20;
  }
  
  return Math.max(0, score);
}

/**
 * Create optimal pairings for a round using the Hungarian algorithm approach
 * Prioritizes high compatibility while ensuring variety (avoiding repeat matches)
 */
export function createOptimalPairings(
  participants: UserProfile[],
  matchHistory: Map<string, Set<string>>,
  compatibilityCache: Map<string, CompatibilityScore>
): { pairs: [UserProfile, UserProfile][]; waitlist: UserProfile[] } {
  const pairs: [UserProfile, UserProfile][] = [];
  const available = new Set(participants.map(p => p.id));
  const waitlist: UserProfile[] = [];
  
  // Build a score matrix with penalties for previous matches
  const scoreMatrix: Map<string, Map<string, number>> = new Map();
  
  participants.forEach(user1 => {
    const scores = new Map<string, number>();
    participants.forEach(user2 => {
      if (user1.id === user2.id) return;
      
      const cacheKey = [user1.id, user2.id].sort().join('-');
      let compatibility = compatibilityCache.get(cacheKey);
      
      if (!compatibility) {
        compatibility = calculateCompatibility(user1, user2);
        compatibilityCache.set(cacheKey, compatibility);
      }
      
      let adjustedScore = compatibility.score;
      
      // Heavy penalty if already matched before
      const previousMatches = matchHistory.get(user1.id) || new Set();
      if (previousMatches.has(user2.id)) {
        adjustedScore -= 1000; // Effectively prevents rematch
      }
      
      scores.set(user2.id, adjustedScore);
    });
    scoreMatrix.set(user1.id, scores);
  });
  
  // Greedy matching with best available pairs
  const matched = new Set<string>();
  
  // Get all possible pairs sorted by score
  const allPairs: { user1: UserProfile; user2: UserProfile; score: number }[] = [];
  
  participants.forEach((user1, i) => {
    participants.slice(i + 1).forEach(user2 => {
      const score1 = scoreMatrix.get(user1.id)?.get(user2.id) || 0;
      const score2 = scoreMatrix.get(user2.id)?.get(user1.id) || 0;
      const avgScore = (score1 + score2) / 2;
      
      // Only consider valid pairs (positive score means not previously matched)
      if (avgScore > -500) {
        allPairs.push({ user1, user2, score: avgScore });
      }
    });
  });
  
  // Sort by score descending
  allPairs.sort((a, b) => b.score - a.score);
  
  // Match greedily
  for (const { user1, user2 } of allPairs) {
    if (!matched.has(user1.id) && !matched.has(user2.id)) {
      pairs.push([user1, user2]);
      matched.add(user1.id);
      matched.add(user2.id);
      available.delete(user1.id);
      available.delete(user2.id);
    }
  }
  
  // Any remaining users go to waitlist
  participants.forEach(p => {
    if (available.has(p.id)) {
      waitlist.push(p);
    }
  });
  
  return { pairs, waitlist };
}

/**
 * Generate room assignments for a round
 */
export function generateRoomAssignments(
  eventId: string,
  roundNumber: number,
  pairs: [UserProfile, UserProfile][],
  roundDurationMinutes: number
): SpeedDatingRoom[] {
  const now = new Date();
  const endTime = new Date(now.getTime() + roundDurationMinutes * 60 * 1000);
  
  return pairs.map(([user1, user2], index) => {
    const roomId = `${eventId}-r${roundNumber}-${index}`;
    const channelName = `speed-date-${roomId}`;
    
    return {
      id: roomId,
      eventId,
      channelName,
      participants: [user1.id, user2.id],
      roundNumber,
      startTime: now,
      endTime,
      status: 'waiting' as const,
    };
  });
}

/**
 * Update match history after a round
 */
export function updateMatchHistory(
  matchHistory: Map<string, Set<string>>,
  rooms: SpeedDatingRoom[]
): void {
  rooms.forEach(room => {
    const [user1Id, user2Id] = room.participants;
    
    if (!matchHistory.has(user1Id)) {
      matchHistory.set(user1Id, new Set());
    }
    if (!matchHistory.has(user2Id)) {
      matchHistory.set(user2Id, new Set());
    }
    
    matchHistory.get(user1Id)!.add(user2Id);
    matchHistory.get(user2Id)!.add(user1Id);
  });
}

/**
 * Calculate how many rounds are needed for everyone to meet
 */
export function calculateRequiredRounds(participantCount: number): number {
  // Each person can meet one new person per round
  // Total unique meetings needed = participantCount - 1
  // This is approximately log2(participantCount) rounds for good coverage
  return Math.ceil(Math.log2(participantCount)) + 2;
}

/**
 * AI-based match suggestions after the event
 */
export function generateAIMatchSuggestions(
  eventState: EventState,
  transcripts: Map<string, string> // roomId -> transcript
): { userId: string; suggestions: { partnerId: string; reason: string; score: number }[] }[] {
  const suggestions: Map<string, { partnerId: string; reason: string; score: number }[]> = new Map();
  
  // For each user, compile their interactions
  eventState.event.currentParticipants.forEach(userId => {
    const userSuggestions: { partnerId: string; reason: string; score: number }[] = [];
    
    // Get all rooms this user participated in
    eventState.rounds.forEach(round => {
      round.rooms
        .filter(room => room.participants && room.participants.includes(userId))
        .forEach(room => {
          const partnerId = room.participants.find(id => id !== userId);
          if (!partnerId) return;
          
          const cacheKey = [userId, partnerId].sort().join('-');
          const compatibility = eventState.compatibilityScores.get(cacheKey);
          
          if (compatibility) {
            let adjustedScore = compatibility.score;
            
            // Boost score based on transcript analysis (mock implementation)
            if (room.aiSummary) {
              // In real implementation, analyze sentiment and engagement
              adjustedScore += 10;
            }
            
            userSuggestions.push({
              partnerId,
              reason: generateMatchReason(compatibility),
              score: adjustedScore,
            });
          }
        });
    });
    
    // Sort by score and take top 5
    userSuggestions.sort((a, b) => b.score - a.score);
    suggestions.set(userId, userSuggestions.slice(0, 5));
  });
  
  return Array.from(suggestions.entries()).map(([userId, userSuggestions]) => ({
    userId,
    suggestions: userSuggestions,
  }));
}

/**
 * Generate a human-readable reason for a match
 */
function generateMatchReason(compatibility: CompatibilityScore): string {
  const reasons: string[] = [];
  
  if (compatibility.breakdown.interestMatch > 70) {
    reasons.push("You share many common interests");
  }
  if (compatibility.breakdown.traitCompatibility > 70) {
    reasons.push("Your personalities complement each other well");
  }
  if (compatibility.breakdown.preferenceMatch > 90) {
    reasons.push("You match each other's preferences");
  }
  if (compatibility.breakdown.conversationQuality && compatibility.breakdown.conversationQuality > 70) {
    reasons.push("Great conversation flow during your date");
  }
  
  if (reasons.length === 0) {
    reasons.push("Potential for a meaningful connection");
  }
  
  return reasons.join(". ") + ".";
}

