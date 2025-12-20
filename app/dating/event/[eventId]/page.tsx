"use client";

import { EventLobby } from "@/features/dating/components/EventLobby";
import { MatchResults } from "@/features/dating/components/MatchResults";
import { SpeedDatingRoomComponent } from "@/features/dating/components/SpeedDatingRoom";
import { WaitingRoom } from "@/features/dating/components/WaitingRoom";
import { CURRENT_TEST_USER, DEMO_USERS } from "@/features/dating/data/demoUsers";
import { useSpeedDating } from "@/features/dating/hooks/useSpeedDating";
import type { Match, SpeedDatingRoom, UserProfile } from "@/features/dating/types";
import { IconLoader2 } from "@tabler/icons-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

// All available demo users
const ALL_DEMO_USERS: UserProfile[] = [CURRENT_TEST_USER, ...DEMO_USERS];

export default function EventPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = params.eventId as string;
  const userIdParam = searchParams.get('userId');
  
  // Get current user from URL param, session storage, or default
  const [currentUser, setCurrentUser] = useState<UserProfile>(CURRENT_TEST_USER);
  
  useEffect(() => {
    // Try to get user from URL param first
    if (userIdParam) {
      const user = ALL_DEMO_USERS.find(u => u.id === userIdParam);
      if (user) {
        setCurrentUser(user);
        return;
      }
    }
    
    // Try session storage
    if (typeof window !== 'undefined') {
      const storedProfile = sessionStorage.getItem('datingUserProfile');
      if (storedProfile) {
        try {
          const user = JSON.parse(storedProfile) as UserProfile;
          setCurrentUser(user);
          return;
        } catch (e) {
          console.warn('Failed to parse stored profile:', e);
        }
      }
    }
    
    // Default to test user
    setCurrentUser(CURRENT_TEST_USER);
  }, [userIdParam]);
  
  const [matches, setMatches] = useState<Match[]>([]);
  console.log('🚀 - EventPage - matches:', matches)
  const [currentPartner, setCurrentPartner] = useState<UserProfile | null>(null);
  const [previousMatches, setPreviousMatches] = useState<{
    oderId: string;
    partnerName: string;
    partnerAvatar: string;
    roundNumber: number;
  }[]>([]);
  
  const handleRoomChange = useCallback((room: SpeedDatingRoom | null) => {
    if (room && room.participants) {
      const partnerId = room.participants.find(id => id !== currentUser.id);
      const partner = partnerId ? ALL_DEMO_USERS.find(p => p.id === partnerId) : null;
      setCurrentPartner(partner || null);
      
      // Add to previous matches if this is a new partner
      if (partner && partnerId && room.roundNumber) {
        setPreviousMatches(prev => {
          const alreadyMatched = prev.some(m => m.oderId === partnerId);
          if (!alreadyMatched) {
            return [...prev, {
              oderId: partnerId,
              partnerName: partner.name,
              partnerAvatar: partner.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${partnerId}`,
              roundNumber: room.roundNumber,
            }];
          }
          return prev;
        });
      }
    } else {
      setCurrentPartner(null);
    }
  }, [currentUser.id]);
  
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
    userId: currentUser.id,
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
    return ALL_DEMO_USERS.find(p => p.id === userId) || null;
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
          currentUser={currentUser}
          participants={ALL_DEMO_USERS}
          onStart={handleStartEvent}
          onLeave={handleLeaveEvent}
          isHost={event.hostId === currentUser.id}
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
        // Calculate total rounds based on participant count
        const totalParticipants = event.currentParticipants?.length || event.participants?.length || 4;
        const totalRounds = Math.max(Math.ceil(Math.log2(totalParticipants)) + 1, 3);
        
        return (
          <SpeedDatingRoomComponent
            room={currentRoom}
            currentUser={currentUser}
            partner={currentPartner}
            timeRemaining={timeRemaining}
            roundNumber={roundNumber}
            totalRounds={totalRounds}
            previousMatches={previousMatches}
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
          currentUserId={currentUser.id}
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
          currentUser={currentUser}
          participants={ALL_DEMO_USERS}
          onStart={handleStartEvent}
          onLeave={handleLeaveEvent}
          isHost={event.hostId === currentUser.id}
        />
      );
  }
}

