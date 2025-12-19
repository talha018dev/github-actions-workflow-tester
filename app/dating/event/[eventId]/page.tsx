"use client";

import { EventLobby } from "@/features/dating/components/EventLobby";
import { MatchResults } from "@/features/dating/components/MatchResults";
import { SpeedDatingRoomComponent } from "@/features/dating/components/SpeedDatingRoom";
import { WaitingRoom } from "@/features/dating/components/WaitingRoom";
import { useSpeedDating } from "@/features/dating/hooks/useSpeedDating";
import type { Match, SpeedDatingRoom, UserProfile } from "@/features/dating/types";
import { IconLoader2 } from "@tabler/icons-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useState } from "react";

// Demo user - in production this would come from auth
const DEMO_USER: UserProfile = {
  id: "current-user",
  name: "Alex",
  age: 28,
  gender: "female",
  lookingFor: ["male", "female", "non-binary"],
  bio: "Looking for meaningful connections!",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=currentuser",
  interests: ["Travel", "Music", "Photography", "Cooking"],
  location: "New York, NY",
  occupation: "Software Engineer",
  education: "MIT",
  traits: {
    adventurous: 8,
    intellectual: 7,
    social: 6,
    romantic: 8,
    ambitious: 9,
    creative: 7,
    spontaneous: 6,
    traditional: 4,
  },
  preferences: {
    ageMin: 24,
    ageMax: 38,
    maxDistance: 50,
  },
};

// Demo participants for the lobby
const DEMO_PARTICIPANTS: UserProfile[] = [
  DEMO_USER,
  ...Array.from({ length: 11 }, (_, i) => ({
    id: `user-${i + 1}`,
    name: ["Jordan", "Taylor", "Morgan", "Casey", "Riley", "Quinn", "Drew", "Avery", "Jamie", "Cameron", "Sam"][i],
    age: 25 + Math.floor(Math.random() * 10),
    gender: ["male", "female", "non-binary"][Math.floor(Math.random() * 3)] as "male" | "female" | "non-binary",
    lookingFor: ["male", "female", "non-binary"] as ("male" | "female" | "non-binary")[],
    bio: "Excited to meet new people!",
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`,
    interests: ["Travel", "Music", "Cooking", "Fitness", "Art", "Movies", "Reading", "Gaming"].sort(() => Math.random() - 0.5).slice(0, 4),
    location: "New York, NY",
    occupation: "Professional",
    education: "University Graduate",
    traits: {
      adventurous: Math.floor(Math.random() * 10) + 1,
      intellectual: Math.floor(Math.random() * 10) + 1,
      social: Math.floor(Math.random() * 10) + 1,
      romantic: Math.floor(Math.random() * 10) + 1,
      ambitious: Math.floor(Math.random() * 10) + 1,
      creative: Math.floor(Math.random() * 10) + 1,
      spontaneous: Math.floor(Math.random() * 10) + 1,
      traditional: Math.floor(Math.random() * 10) + 1,
    },
    preferences: {
      ageMin: 21,
      ageMax: 45,
      maxDistance: 50,
    },
  })),
];

export default function EventPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  
  const [matches, setMatches] = useState<Match[]>([]);
  const [currentPartner, setCurrentPartner] = useState<UserProfile | null>(null);
  
  const handleRoomChange = useCallback((room: SpeedDatingRoom | null) => {
    if (room) {
      const partnerId = room.participants.find(id => id !== DEMO_USER.id);
      const partner = DEMO_PARTICIPANTS.find(p => p.id === partnerId);
      setCurrentPartner(partner || null);
    } else {
      setCurrentPartner(null);
    }
  }, []);
  
  const handleEventEnd = useCallback(() => {
    // Fetch final matches
    fetchMatches();
  }, []);
  
  const {
    event,
    currentRoom,
    timeRemaining,
    roundNumber,
    isWaiting,
    waitingPosition,
    isLoading,
    error,
    phase,
    leaveEvent,
    formatTimeRemaining,
  } = useSpeedDating({
    eventId,
    userId: DEMO_USER.id,
    onRoomChange: handleRoomChange,
    onEventEnd: handleEventEnd,
  });
  
  const fetchMatches = async () => {
    try {
      const response = await fetch(`/api/dating/events/${eventId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'end' }),
      });
      
      const data = await response.json();
      if (data.success && data.matches) {
        setMatches(data.matches);
      }
    } catch (error) {
      console.error('Failed to fetch matches:', error);
    }
  };
  
  const handleStartEvent = async () => {
    try {
      const response = await fetch(`/api/dating/events/${eventId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' }),
      });
      
      const data = await response.json();
      if (!data.success) {
        alert(data.error || 'Failed to start event');
      }
    } catch (error) {
      console.error('Failed to start event:', error);
      alert('Failed to start event');
    }
  };
  
  const handleLeaveEvent = async () => {
    const success = await leaveEvent();
    if (success) {
      router.push('/dating');
    }
  };
  
  const handleLike = () => {
    console.log('Liked partner:', currentPartner?.name);
    // In production, send to API
  };
  
  const handlePass = () => {
    console.log('Passed partner:', currentPartner?.name);
    // In production, send to API
  };
  
  const handleAcceptMatch = (matchId: string) => {
    console.log('Accepted match:', matchId);
    // Update match status via API
    setMatches(prev => prev.map(m => 
      m.id === matchId 
        ? { ...m, user1Action: 'liked' as const }
        : m
    ));
  };
  
  const handleRejectMatch = (matchId: string) => {
    console.log('Rejected match:', matchId);
    setMatches(prev => prev.map(m => 
      m.id === matchId 
        ? { ...m, user1Action: 'passed' as const }
        : m
    ));
  };
  
  const handleStartChat = (matchId: string) => {
    console.log('Starting chat for match:', matchId);
    // Navigate to chat page
  };
  
  const getUserProfile = (userId: string): UserProfile | null => {
    return DEMO_PARTICIPANTS.find(p => p.id === userId) || null;
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-rose-950/20 flex items-center justify-center">
        <div className="text-center">
          <IconLoader2 size={48} className="animate-spin text-rose-400 mx-auto mb-4" />
          <p className="text-gray-400">Loading event...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-rose-950/20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Event not found'}</p>
          <button 
            onClick={() => router.push('/dating')}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-colors"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }
  
  // Render based on phase
  switch (phase) {
    case 'lobby':
      return (
        <EventLobby
          event={event}
          currentUser={DEMO_USER}
          participants={DEMO_PARTICIPANTS}
          onStart={handleStartEvent}
          onLeave={handleLeaveEvent}
          isHost={event.hostId === DEMO_USER.id}
        />
      );
    
    case 'waiting':
      return (
        <WaitingRoom
          position={waitingPosition}
          totalWaiting={event.waitlist.length}
          eventName={event.name}
          roundNumber={roundNumber}
          onLeave={handleLeaveEvent}
        />
      );
    
    case 'in-call':
    case 'matched':
      if (currentRoom) {
        return (
          <SpeedDatingRoomComponent
            room={currentRoom}
            currentUser={DEMO_USER}
            partner={currentPartner}
            timeRemaining={timeRemaining}
            roundNumber={roundNumber}
            onLike={handleLike}
            onPass={handlePass}
            onLeave={handleLeaveEvent}
          />
        );
      }
      // Fallback to waiting if no room
      return (
        <WaitingRoom
          position={waitingPosition}
          totalWaiting={event.waitlist.length}
          eventName={event.name}
          roundNumber={roundNumber}
          onLeave={handleLeaveEvent}
        />
      );
    
    case 'results':
      return (
        <MatchResults
          matches={matches}
          currentUserId={DEMO_USER.id}
          getUserProfile={getUserProfile}
          onAccept={handleAcceptMatch}
          onReject={handleRejectMatch}
          onStartChat={handleStartChat}
        />
      );
    
    default:
      return (
        <EventLobby
          event={event}
          currentUser={DEMO_USER}
          participants={DEMO_PARTICIPANTS}
          onStart={handleStartEvent}
          onLeave={handleLeaveEvent}
          isHost={event.hostId === DEMO_USER.id}
        />
      );
  }
}

