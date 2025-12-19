"use client";

import { 
  IconCalendar, 
  IconClock, 
  IconHeart, 
  IconLogout, 
  IconSparkles, 
  IconUsers,
  IconCheck,
  IconPlayerPlay,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import type { SpeedDatingEvent, UserProfile } from "../types";

interface EventLobbyProps {
  event: SpeedDatingEvent;
  currentUser: UserProfile;
  participants: UserProfile[];
  onStart?: () => void;
  onLeave: () => void;
  isHost: boolean;
}

export function EventLobby({ 
  event, 
  currentUser, 
  participants, 
  onStart, 
  onLeave,
  isHost 
}: EventLobbyProps) {
  const [countdown, setCountdown] = useState<number | null>(null);
  
  // Countdown to event start
  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const start = new Date(event.startTime).getTime();
      const diff = start - now;
      
      if (diff <= 0) {
        setCountdown(null);
      } else {
        setCountdown(Math.floor(diff / 1000));
      }
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [event.startTime]);
  
  const formatCountdown = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m ${secs}s`;
    }
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };
  
  const startDate = new Date(event.startTime);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-rose-950/20 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500/20 text-rose-300 rounded-full text-sm font-medium mb-4">
            <IconSparkles size={16} />
            You&apos;re In!
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-4">{event.name}</h1>
          <p className="text-gray-400 max-w-xl mx-auto">{event.description}</p>
        </div>
        
        {/* Event info cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-10">
          <div className="bg-gray-900/60 backdrop-blur border border-gray-800 rounded-2xl p-6 text-center">
            <IconCalendar size={28} className="mx-auto text-rose-400 mb-3" />
            <div className="text-gray-400 text-sm mb-1">Date & Time</div>
            <div className="text-white font-semibold">
              {startDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
            <div className="text-gray-300 text-sm">
              {startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </div>
          </div>
          
          <div className="bg-gray-900/60 backdrop-blur border border-gray-800 rounded-2xl p-6 text-center">
            <IconClock size={28} className="mx-auto text-rose-400 mb-3" />
            <div className="text-gray-400 text-sm mb-1">Date Duration</div>
            <div className="text-white font-semibold">{event.roundDurationMinutes} minutes</div>
            <div className="text-gray-300 text-sm">per connection</div>
          </div>
          
          <div className="bg-gray-900/60 backdrop-blur border border-gray-800 rounded-2xl p-6 text-center">
            <IconUsers size={28} className="mx-auto text-rose-400 mb-3" />
            <div className="text-gray-400 text-sm mb-1">Participants</div>
            <div className="text-white font-semibold">{event.currentParticipants.length} / {event.maxSeats}</div>
            <div className="text-gray-300 text-sm">spots filled</div>
          </div>
        </div>
        
        {/* Countdown or status */}
        <div className="bg-gray-900/60 backdrop-blur border border-gray-800 rounded-2xl p-8 text-center mb-10">
          {event.status === 'active' ? (
            <div>
              <div className="text-emerald-400 text-lg font-semibold mb-2 flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                Event is Live!
              </div>
              <p className="text-gray-400">The event has started. Get ready for your first match!</p>
            </div>
          ) : countdown !== null ? (
            <div>
              <div className="text-gray-400 text-sm mb-2">Event starts in</div>
              <div className="text-5xl font-mono font-bold text-white mb-2">
                {formatCountdown(countdown)}
              </div>
              <p className="text-gray-400 text-sm">Get comfortable, check your camera, and get ready to mingle!</p>
            </div>
          ) : (
            <div>
              <div className="text-rose-400 text-lg font-semibold mb-2">Ready to Start!</div>
              <p className="text-gray-400">Waiting for the host to begin the event...</p>
            </div>
          )}
        </div>
        
        {/* Participant list */}
        <div className="bg-gray-900/60 backdrop-blur border border-gray-800 rounded-2xl p-6 mb-6">
          <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
            <IconHeart size={20} className="text-rose-400" />
            Who&apos;s Joining
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {/* Current user first */}
            <div className="flex flex-col items-center p-4 bg-gradient-to-br from-rose-500/10 to-purple-500/10 border border-rose-500/30 rounded-xl">
              <div className="relative">
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name}
                  className="w-16 h-16 rounded-full border-2 border-rose-500"
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center">
                  <IconCheck size={12} className="text-white" />
                </div>
              </div>
              <div className="mt-2 text-white font-medium text-sm text-center">{currentUser.name}</div>
              <div className="text-rose-400 text-xs">You</div>
            </div>
            
            {/* Other participants */}
            {participants
              .filter(p => p.id !== currentUser.id)
              .slice(0, 19)
              .map(participant => (
                <div 
                  key={participant.id}
                  className="flex flex-col items-center p-4 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-colors"
                >
                  <img 
                    src={participant.avatar} 
                    alt={participant.name}
                    className="w-16 h-16 rounded-full border-2 border-gray-700"
                  />
                  <div className="mt-2 text-white font-medium text-sm text-center truncate w-full">
                    {participant.name}
                  </div>
                  <div className="text-gray-500 text-xs">{participant.age}</div>
                </div>
              ))}
            
            {/* More indicator */}
            {participants.length > 20 && (
              <div className="flex flex-col items-center justify-center p-4 bg-gray-800/30 rounded-xl">
                <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center text-gray-400">
                  +{participants.length - 20}
                </div>
                <div className="mt-2 text-gray-500 text-sm">more</div>
              </div>
            )}
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center justify-center gap-4">
          {isHost && event.status === 'upcoming' && (
            <button
              onClick={onStart}
              className="px-8 py-4 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-rose-500/25 transition-all"
            >
              <IconPlayerPlay size={20} />
              Start Event
            </button>
          )}
          
          <button
            onClick={onLeave}
            className="px-6 py-4 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white font-medium rounded-xl flex items-center gap-2 transition-all"
          >
            <IconLogout size={20} />
            Leave Event
          </button>
        </div>
      </div>
    </div>
  );
}

