"use client";

import { EventCard } from "@/features/dating/components/EventCard";
import { CURRENT_TEST_USER } from "@/features/dating/data/demoUsers";
import type { SpeedDatingEvent } from "@/features/dating/types";
import { 
  IconCalendarEvent, 
  IconHeart, 
  IconSparkles, 
  IconUserPlus,
  IconFlame,
  IconUsers,
  IconVideo,
  IconRocket,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Use the demo user for testing
const DEMO_USER = CURRENT_TEST_USER;

export default function DatingPage() {
  const [events, setEvents] = useState<SpeedDatingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinedEvents, setJoinedEvents] = useState<Set<string>>(new Set());
  const router = useRouter();
  
  // Fetch events
  useEffect(() => {
    fetchEvents();
  }, []);
  
  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/dating/events');
      const data = await response.json();
      
      if (data.success) {
        setEvents(data.events);
        
        // Check which events current user has joined
        const joined = new Set<string>();
        data.events.forEach((event: SpeedDatingEvent) => {
          if (event.currentParticipants.includes(DEMO_USER.id) || 
              event.waitlist.includes(DEMO_USER.id)) {
            joined.add(event.id);
          }
        });
        setJoinedEvents(joined);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleJoinEvent = async (eventId: string) => {
    try {
      const response = await fetch('/api/dating/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'join',
          eventId,
          userId: DEMO_USER.id,
          userProfile: DEMO_USER,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setJoinedEvents(prev => new Set([...prev, eventId]));
        // Navigate to the event page
        router.push(`/dating/event/${eventId}`);
      } else {
        alert(data.error || 'Failed to join event');
      }
    } catch (error) {
      console.error('Failed to join event:', error);
      alert('Failed to join event');
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-rose-950/20">
      {/* Hero section */}
      <div className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500/20 text-rose-300 rounded-full text-sm font-medium mb-6">
              <IconFlame size={16} className="animate-pulse" />
              Speed Dating Reimagined
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-500">Perfect Match</span>
              <br />in Minutes
            </h1>
            
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
              Join virtual speed dating events, meet amazing people, and let our AI 
              help you find meaningful connections through 5-minute video dates.
            </p>
            
            {/* Feature highlights */}
            <div className="flex flex-wrap justify-center gap-6 mb-12">
              <div className="flex items-center gap-2 text-gray-300">
                <IconVideo size={20} className="text-rose-400" />
                <span>HD Video Calls</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <IconSparkles size={20} className="text-purple-400" />
                <span>AI Matching</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <IconUsers size={20} className="text-blue-400" />
                <span>40 People Per Event</span>
              </div>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            <div className="bg-gray-900/40 backdrop-blur border border-gray-800 rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold text-white mb-1">5</div>
              <div className="text-gray-400 text-sm">Min per Date</div>
            </div>
            <div className="bg-gray-900/40 backdrop-blur border border-gray-800 rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold text-rose-400 mb-1">40</div>
              <div className="text-gray-400 text-sm">Max Participants</div>
            </div>
            <div className="bg-gray-900/40 backdrop-blur border border-gray-800 rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-1">AI</div>
              <div className="text-gray-400 text-sm">Smart Matching</div>
            </div>
            <div className="bg-gray-900/40 backdrop-blur border border-gray-800 rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold text-emerald-400 mb-1">∞</div>
              <div className="text-gray-400 text-sm">Possibilities</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Events section */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <IconCalendarEvent size={28} className="text-rose-400" />
              Upcoming Events
            </h2>
            <p className="text-gray-400 mt-1">Join an event and start meeting new people</p>
          </div>
          
          <div className="flex gap-3">
            <a 
              href="/dating/demo"
              className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-xl flex items-center gap-2 transition-colors"
            >
              <IconRocket size={20} />
              Try Demo
            </a>
            <button className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl flex items-center gap-2 transition-colors">
              <IconUserPlus size={20} />
              Create Event
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-900/40 border border-gray-800 rounded-2xl h-80 animate-pulse" />
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <EventCard 
                key={event.id}
                event={event}
                onJoin={handleJoinEvent}
                isJoined={joinedEvents.has(event.id)}
                currentUserId={DEMO_USER.id}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-900/40 border border-gray-800 rounded-2xl">
            <IconHeart size={64} className="mx-auto text-gray-700 mb-4" />
            <h3 className="text-white font-bold text-xl mb-2">No Events Yet</h3>
            <p className="text-gray-400 mb-6">Be the first to create a speed dating event!</p>
            <button className="px-8 py-4 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-semibold rounded-xl flex items-center gap-2 mx-auto transition-all">
              <IconCalendarEvent size={20} />
              Create First Event
            </button>
          </div>
        )}
      </div>
      
      {/* How it works section */}
      <div className="bg-gray-900/40 border-t border-gray-800 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Our smart matchmaking system pairs you with compatible people for 5-minute video dates
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: 1,
                title: "Join an Event",
                desc: "Browse upcoming events and join one that fits your schedule",
                icon: IconCalendarEvent,
              },
              {
                step: 2,
                title: "Get Matched",
                desc: "Our AI pairs you with compatible participants every 5 minutes",
                icon: IconSparkles,
              },
              {
                step: 3,
                title: "Video Date",
                desc: "Have a quick video chat with your match and see if there's chemistry",
                icon: IconVideo,
              },
              {
                step: 4,
                title: "Connect",
                desc: "Like the people you clicked with and start chatting if it's mutual!",
                icon: IconHeart,
              },
            ].map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-500/20 to-purple-500/20 border border-rose-500/30 flex items-center justify-center mx-auto mb-4">
                  <Icon size={28} className="text-rose-400" />
                </div>
                <div className="text-rose-400 text-sm font-medium mb-2">Step {step}</div>
                <h3 className="text-white font-bold mb-2">{title}</h3>
                <p className="text-gray-400 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

