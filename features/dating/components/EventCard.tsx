"use client";

import { IconCalendar, IconUsers, IconClock, IconHeart } from "@tabler/icons-react";
import type { SpeedDatingEvent } from "../types";

interface EventCardProps {
  event: SpeedDatingEvent;
  onJoin: (eventId: string) => void;
  isJoined?: boolean;
  currentUserId?: string;
}

export function EventCard({ event, onJoin, isJoined, currentUserId }: EventCardProps) {
  const isParticipant = currentUserId && event.currentParticipants?.includes(currentUserId) || false;
  const isWaitlisted = currentUserId && event.waitlist?.includes(currentUserId) || false;
  const spotsLeft = event.maxSeats ? event.maxSeats - (event.currentParticipants?.length || 0) : 0;
  const isFull = spotsLeft <= 0;
  
  const startDate = new Date(event.startTime || '');
  const formattedDate = startDate.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
  const formattedTime = startDate.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit' 
  });
  
  const getStatusColor = () => {
    switch (event.status) {
      case 'active': return 'bg-emerald-500';
      case 'upcoming': return 'bg-amber-500';
      case 'completed': return 'bg-gray-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };
  
  const getStatusText = () => {
    switch (event.status) {
      case 'active': return 'Live Now';
      case 'upcoming': return 'Upcoming';
      case 'completed': return 'Ended';
      case 'cancelled': return 'Cancelled';
      default: return event.status;
    }
  };
  
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-950/40 via-purple-950/30 to-indigo-950/40 border border-rose-500/20 hover:border-rose-500/40 transition-all duration-300 group">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {/* Status badge */}
      <div className="absolute top-4 right-4 z-10">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor()}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5 animate-pulse" />
          {getStatusText()}
        </span>
      </div>
      
      {/* Theme/Category badge */}
      {event.theme && (
        <div className="absolute top-4 left-4 z-10">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <IconHeart size={12} className="mr-1" />
            {event.theme}
          </span>
        </div>
      )}
      
      <div className="p-6 pt-14">
        {/* Title */}
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-rose-200 transition-colors">
          {event.name}
        </h3>
        
        {/* Description */}
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {event.description}
        </p>
        
        {/* Event details */}
        <div className="space-y-2 mb-5">
          <div className="flex items-center text-gray-300 text-sm">
            <IconCalendar size={16} className="mr-2 text-rose-400" />
            {formattedDate} at {formattedTime}
          </div>
          
          <div className="flex items-center text-gray-300 text-sm">
            <IconClock size={16} className="mr-2 text-rose-400" />
            {event.roundDurationMinutes} min per date
          </div>
          
          <div className="flex items-center text-gray-300 text-sm">
            <IconUsers size={16} className="mr-2 text-rose-400" />
            {event.currentParticipants?.length || 0} / {event.maxSeats || 0} joined
            {event.waitlist.length > 0 && (
              <span className="ml-2 text-amber-400">
                (+{event.waitlist.length} waitlist)
              </span>
            )}
          </div>
          
          {event.ageRange && (
            <div className="text-gray-400 text-xs">
              Ages {event.ageRange.min} - {event.ageRange.max}
            </div>
          )}
        </div>
        
        {/* Progress bar for spots */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{spotsLeft > 0 ? `${spotsLeft} spots left` : 'Event full'}</span>
            <span>{Math.round((event.currentParticipants?.length || 0 / (event?.maxSeats || 0)) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                isFull ? 'bg-red-500' : spotsLeft <= 5 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, (event.currentParticipants?.length || 0 / (event?.maxSeats || 0)) * 100)}%` }}
            />
          </div>
        </div>
        
        {/* Action button */}
        {isParticipant || isJoined ? (
          <button className="w-full py-3 rounded-xl bg-emerald-600 text-white font-semibold cursor-default flex items-center justify-center gap-2">
            <IconHeart size={18} className="fill-current" />
            You&apos;re In!
          </button>
        ) : isWaitlisted ? (
          <button className="w-full py-3 rounded-xl bg-amber-600 text-white font-semibold cursor-default flex items-center justify-center gap-2">
            <IconUsers size={18} />
            On Waitlist
          </button>
        ) : event.status === 'completed' || event.status === 'cancelled' ? (
          <button 
            disabled
            className="w-full py-3 rounded-xl bg-gray-700 text-gray-400 font-semibold cursor-not-allowed"
          >
            Event Ended
          </button>
        ) : (
          <button
            onClick={() => onJoin(event.id)}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-semibold transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-rose-500/25"
          >
            <IconHeart size={18} />
            {isFull ? 'Join Waitlist' : 'Join Event'}
          </button>
        )}
      </div>
    </div>
  );
}

