"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import type { 
  SpeedDatingEvent, 
  SpeedDatingRoom, 
  UserProfile,
  SpeedDatingUIState 
} from '../types';

interface UseSpeedDatingOptions {
  eventId: string;
  userId: string;
  onRoomChange?: (room: SpeedDatingRoom | null) => void;
  onEventEnd?: () => void;
}

interface SpeedDatingState {
  event: SpeedDatingEvent | null;
  currentRoom: SpeedDatingRoom | null;
  partner: UserProfile | null;
  timeRemaining: number;
  roundNumber: number;
  isWaiting: boolean;
  waitingPosition: number | null;
  isLoading: boolean;
  error: string | null;
  phase: SpeedDatingUIState['currentPhase'];
}

export function useSpeedDating({ eventId, userId, onRoomChange, onEventEnd }: UseSpeedDatingOptions) {
  const [state, setState] = useState<SpeedDatingState>({
    event: null,
    currentRoom: null,
    partner: null,
    timeRemaining: 0,
    roundNumber: 0,
    isWaiting: false,
    waitingPosition: null,
    isLoading: true,
    error: null,
    phase: 'lobby',
  });
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const prevRoomRef = useRef<string | null>(null);
  
  // Fetch event state
  const fetchEventState = useCallback(async () => {
    try {
      const response = await fetch(`/api/dating/events/${eventId}?userId=${userId}`);
      const data = await response.json();
      
      if (!data.success) {
        setState(prev => ({ ...prev, error: data.error, isLoading: false }));
        return;
      }
      
      const event = data.event as SpeedDatingEvent;
      const userState = data.userState;
      
      // Determine phase
      let phase: SpeedDatingUIState['currentPhase'] = 'lobby';
      if (event.status === 'completed') {
        phase = 'results';
        if (onEventEnd) onEventEnd();
      } else if (event.status === 'active') {
        if (userState?.isInRoom) {
          phase = 'in-call';
        } else if (userState?.isWaiting) {
          phase = 'waiting';
        } else {
          phase = 'matched';
        }
      }
      
      // Handle room changes
      const newRoomId = userState?.room?.id || null;
      if (newRoomId !== prevRoomRef.current) {
        prevRoomRef.current = newRoomId;
        if (onRoomChange && userState?.room) {
          onRoomChange(userState.room);
        }
      }
      
      // Calculate time remaining if in a room
      let timeRemaining = 0;
      if (userState?.room?.endTime) {
        const endTime = new Date(userState.room.endTime).getTime();
        timeRemaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      }
      
      setState(prev => ({
        ...prev,
        event,
        currentRoom: userState?.room || null,
        roundNumber: data.currentRound,
        isWaiting: userState?.isWaiting || false,
        waitingPosition: userState?.waitingPosition,
        timeRemaining,
        isLoading: false,
        phase,
        error: null,
      }));
    } catch (error) {
      console.error('Failed to fetch event state:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to fetch event state', 
        isLoading: false 
      }));
    }
  }, [eventId, userId, onRoomChange, onEventEnd]);
  
  // Join event
  const joinEvent = useCallback(async (userProfile?: UserProfile) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const response = await fetch('/api/dating/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'join',
          eventId,
          userId,
          userProfile,
        }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        setState(prev => ({ ...prev, error: data.error, isLoading: false }));
        return false;
      }
      
      await fetchEventState();
      return true;
    } catch (error) {
      console.error('Failed to join event:', error);
      setState(prev => ({ ...prev, error: 'Failed to join event', isLoading: false }));
      return false;
    }
  }, [eventId, userId, fetchEventState]);
  
  // Leave event
  const leaveEvent = useCallback(async () => {
    try {
      const response = await fetch('/api/dating/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'leave',
          eventId,
          userId,
        }),
      });
      
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Failed to leave event:', error);
      return false;
    }
  }, [eventId, userId]);
  
  // Start polling for updates
  useEffect(() => {
    fetchEventState();
    
    // Poll every 2 seconds for updates
    pollRef.current = setInterval(fetchEventState, 2000);
    
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, [fetchEventState]);
  
  // Timer countdown
  useEffect(() => {
    if (state.timeRemaining > 0 && state.phase === 'in-call') {
      timerRef.current = setInterval(() => {
        setState(prev => ({
          ...prev,
          timeRemaining: Math.max(0, prev.timeRemaining - 1),
        }));
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [state.phase, state.currentRoom?.id]);
  
  // Format time remaining
  const formatTimeRemaining = useCallback(() => {
    const minutes = Math.floor(state.timeRemaining / 60);
    const seconds = state.timeRemaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [state.timeRemaining]);
  
  return {
    ...state,
    joinEvent,
    leaveEvent,
    refetch: fetchEventState,
    formatTimeRemaining,
  };
}

