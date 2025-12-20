"use client";

import { CURRENT_TEST_USER, DEMO_USERS } from "@/features/dating/data/demoUsers";
import type { SpeedDatingEvent, UserProfile } from "@/features/dating/types";
import {
  IconCheck,
  IconCopy,
  IconHeart,
  IconRefresh,
  IconUserCircle,
  IconUsers,
} from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const ALL_USERS = [CURRENT_TEST_USER, ...DEMO_USERS];

function JoinPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventIdParam = searchParams.get('eventId');
  
  const [events, setEvents] = useState<SpeedDatingEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>(eventIdParam || '');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<string>('');
  
  // Fetch active events
  useEffect(() => {
    fetchEvents();
  }, []);
  
  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/dating/events?active=true');
      const data = await response.json();
      if (data.success) {
        setEvents(data.events);
        if (data.events.length > 0 && !selectedEvent) {
          setSelectedEvent(data.events[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };
  
  const handleJoin = async () => {
    if (!selectedEvent || !selectedUser) {
      setStatus('Please select an event and a user');
      return;
    }
    
    setLoading(true);
    setStatus('Joining event...');
    
    try {
      // Register profile
      await fetch('/api/dating/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          profile: selectedUser,
        }),
      });
      
      // Join event
      const response = await fetch('/api/dating/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'join',
          eventId: selectedEvent,
          userId: selectedUser.id,
          userProfile: selectedUser,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStatus(`✅ Joined as ${selectedUser.name}!`);
        // Store selected user in sessionStorage for this tab
        sessionStorage.setItem('datingUserId', selectedUser.id);
        sessionStorage.setItem('datingUserProfile', JSON.stringify(selectedUser));
        
        setTimeout(() => {
          router.push(`/dating/event/${selectedEvent}?userId=${selectedUser.id}`);
        }, 1000);
      } else {
        setStatus(`❌ ${data.error}`);
      }
    } catch (error) {
      setStatus(`❌ Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };
  
  const copyJoinLink = () => {
    const url = `${window.location.origin}/dating/join?eventId=${selectedEvent}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const currentEvent = events.find(e => e.id === selectedEvent);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-rose-950/20 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-4">Join Speed Dating</h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Select a user and join an event. Open this page in multiple browser windows 
            (or incognito) to test with different users.
          </p>
        </div>
        
        {/* Multi-user testing instructions */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-8">
          <h3 className="text-blue-300 font-semibold mb-2">🧪 Multi-User Testing</h3>
          <ol className="text-gray-300 text-sm space-y-1 list-decimal list-inside">
            <li>Open this page in <strong>Window 1</strong> (normal browser)</li>
            <li>Select a user (e.g., Alex Chen) and join the event</li>
            <li>Open this page in <strong>Window 2</strong> (incognito or different browser)</li>
            <li>Select a <strong>different user</strong> (e.g., Jordan Taylor) and join the same event</li>
            <li>Start the event from the demo page and watch the matchmaking!</li>
          </ol>
        </div>
        
        {/* Event Selection */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold flex items-center gap-2">
              <IconHeart size={20} className="text-rose-400" />
              Select Event
            </h2>
            <div className="flex gap-2">
              <button
                onClick={fetchEvents}
                className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white"
              >
                <IconRefresh size={18} />
              </button>
              {selectedEvent && (
                <button
                  onClick={copyJoinLink}
                  className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white flex items-center gap-2 text-sm"
                >
                  {copied ? <IconCheck size={16} className="text-emerald-400" /> : <IconCopy size={16} />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
              )}
            </div>
          </div>
          
          {events.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No active events found.</p>
              <a href="/dating/demo" className="text-rose-400 hover:underline mt-2 inline-block">
                Create a demo event first →
              </a>
            </div>
          ) : (
            <div className="space-y-2">
              {events.map(event => (
                <button
                  key={event.id}
                  onClick={() => setSelectedEvent(event.id)}
                  className={`w-full p-4 rounded-xl text-left transition-all ${
                    selectedEvent === event.id
                      ? 'bg-rose-500/20 border-2 border-rose-500'
                      : 'bg-gray-800/50 border-2 border-transparent hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-semibold">{event.name}</h3>
                      <p className="text-gray-400 text-sm">
                        {event?.currentParticipants?.length || 0} / {event.maxSeats} participants
                        {event.status === 'active' && (
                          <span className="ml-2 text-emerald-400">● Live</span>
                        )}
                      </p>
                    </div>
                    {selectedEvent === event.id && (
                      <IconCheck size={20} className="text-rose-400" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* User Selection */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 mb-6">
          <h2 className="text-white font-bold mb-4 flex items-center gap-2">
            <IconUserCircle size={20} className="text-purple-400" />
            Select Your Identity
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {ALL_USERS.map(user => {
              const isJoined = currentEvent?.currentParticipants?.includes(user.id) || false;
              
              return (
                <button
                  key={user.id}
                  onClick={() => !isJoined && setSelectedUser(user)}
                  disabled={isJoined}
                  className={`p-4 rounded-xl text-center transition-all ${
                    selectedUser?.id === user.id
                      ? 'bg-purple-500/20 border-2 border-purple-500 ring-2 ring-purple-500/50'
                      : isJoined
                        ? 'bg-gray-800/30 border-2 border-transparent opacity-50 cursor-not-allowed'
                        : 'bg-gray-800/50 border-2 border-transparent hover:bg-gray-800 hover:border-gray-700'
                  }`}
                >
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="w-16 h-16 rounded-full mx-auto mb-2 border-2 border-gray-700"
                  />
                  <div className="text-white text-sm font-medium truncate">{user.name.split(' ')[0]}</div>
                  <div className="text-gray-500 text-xs">{user.age}, {user.gender}</div>
                  {isJoined && (
                    <div className="text-amber-400 text-xs mt-1">Already joined</div>
                  )}
                </button>
              );
            })}
          </div>
          
          {selectedUser && (
            <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
              <div className="flex items-center gap-4">
                <img 
                  src={selectedUser.avatar} 
                  alt={selectedUser.name}
                  className="w-12 h-12 rounded-full border-2 border-purple-500"
                />
                <div>
                  <div className="text-white font-semibold">{selectedUser.name}</div>
                  <div className="text-gray-400 text-sm">{selectedUser.occupation} • {selectedUser.location}</div>
                  <div className="flex gap-1 mt-1">
                    {selectedUser.interests?.slice(0, 3).map(i => (
                      <span key={i} className="px-2 py-0.5 bg-purple-500/30 text-purple-300 rounded-full text-xs">
                        {i}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Join Button */}
        <div className="text-center">
          <button
            onClick={handleJoin}
            disabled={loading || !selectedEvent || !selectedUser}
            className="px-8 py-4 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 disabled:from-gray-700 disabled:to-gray-700 text-white font-semibold rounded-xl flex items-center gap-2 mx-auto transition-all disabled:cursor-not-allowed"
          >
            <IconUsers size={20} />
            {loading ? 'Joining...' : 'Join Event'}
          </button>
          
          {status && (
            <p className={`mt-4 ${status.startsWith('✅') ? 'text-emerald-400' : status.startsWith('❌') ? 'text-red-400' : 'text-gray-400'}`}>
              {status}
            </p>
          )}
        </div>
        
        {/* Current participants */}
        {currentEvent && currentEvent.currentParticipants?.length && currentEvent.currentParticipants.length > 0 && (
          <div className="mt-8 bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-white font-bold mb-4">
              Current Participants ({currentEvent.currentParticipants?.length || 0})
            </h3>
            <div className="flex flex-wrap gap-2">
              {currentEvent.currentParticipants.map(userId => {
                const user = ALL_USERS.find(u => u.id === userId);
                return (
                  <div key={userId} className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-full">
                    {user ? (
                      <>
                        <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full" />
                        <span className="text-white text-sm">{user.name.split(' ')[0]}</span>
                      </>
                    ) : (
                      <span className="text-gray-400 text-sm">{userId}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-rose-950/20 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <JoinPageContent />
    </Suspense>
  );
}

