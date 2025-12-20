"use client";

import { CURRENT_TEST_USER, DEMO_USERS } from "@/features/dating/data/demoUsers";
import type { SpeedDatingEvent } from "@/features/dating/types";
import {
    IconCheck,
    IconHeart,
    IconPlayerPlay,
    IconRefresh,
    IconRocket,
    IconUsers,
    IconVideo,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DemoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [event, setEvent] = useState<SpeedDatingEvent | null>(null);
  const [step, setStep] = useState<'setup' | 'users' | 'event' | 'started'>('setup');
  const [registeredUsers, setRegisteredUsers] = useState<string[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  
  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };
  
  // Step 1: Create demo event
  const createDemoEvent = async () => {
    setLoading(true);
    addLog("Creating demo speed dating event...");
    
    try {
      const response = await fetch('/api/dating/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          name: 'Demo Speed Dating Night 💕',
          description: 'A test event with 11 demo users + you! Experience the full speed dating flow.',
          maxSeats: 40,
          roundDurationMinutes: 1, // 1 minute for testing (instead of 5)
          hostId: CURRENT_TEST_USER.id,
          theme: 'Demo Event',
          ageRange: { min: 21, max: 45 },
          startTime: new Date(Date.now() + 30 * 1000).toISOString(), // Starts in 30 seconds
          endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        }),
      });
      
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Server error (${response.status}): ${text || 'No response body'}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setEvent(data.event);
        setStep('users');
        addLog(`✅ Event created: ${data.event.name} (ID: ${data.event.id})`);
      } else {
        addLog(`❌ Failed to create event: ${data.error}`);
      }
    } catch (error) {
      addLog(`❌ Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Step 2: Register all demo users
  const registerDemoUsers = async () => {
    if (!event) return;
    
    setLoading(true);
    addLog("Registering demo users...");
    
    const allUsers = [CURRENT_TEST_USER, ...DEMO_USERS];
    const registered: string[] = [];
    
    for (const user of allUsers) {
      try {
        // Register profile
        await fetch('/api/dating/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create',
            profile: user,
          }),
        });
        
        // Join event
        const response = await fetch('/api/dating/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'join',
            eventId: event.id,
            userId: user.id,
            userProfile: user,
          }),
        });
        
        if (!response.ok) {
          throw new Error(`Server error (${response.status})`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          registered.push(user.id);
          addLog(`✅ Registered: ${user.name}${data.isWaitlisted ? ' (waitlisted)' : ''}`);
        } else {
          addLog(`⚠️ Could not register ${user.name}: ${data.error}`);
        }
      } catch (error) {
        addLog(`❌ Error registering ${user.name}: ${error}`);
      }
    }
    
    setRegisteredUsers(registered);
    setStep('event');
    setLoading(false);
    addLog(`✅ Registered ${registered.length} users total!`);
  };
  
  // Step 3: Start the event
  const startDemoEvent = async () => {
    if (!event) return;
    
    setLoading(true);
    addLog("Starting the speed dating event...");
    
    try {
      const response = await fetch(`/api/dating/events/${event.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' }),
      });
      
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Server error (${response.status}): ${text || 'No response body'}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setStep('started');
        addLog(`✅ Event started! Round ${data.currentRound}, ${data.activeRooms} rooms created.`);
        addLog("🎉 Redirecting you to the event in 3 seconds...");
        
        setTimeout(() => {
          router.push(`/dating/event/${event.id}`);
        }, 3000);
      } else {
        addLog(`❌ Failed to start event: ${data.error}`);
      }
    } catch (error) {
      addLog(`❌ Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Check event status
  const checkEventStatus = async () => {
    if (!event) return;
    
    addLog("Checking event status...");
    
    try {
      const response = await fetch(`/api/dating/events/${event.id}?userId=${CURRENT_TEST_USER.id}`);
      
      if (!response.ok) {
        throw new Error(`Server error (${response.status})`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        addLog(`📊 Status: ${data.event.status}`);
        addLog(`👥 Participants: ${data.participantCount}`);
        addLog(`🔄 Current Round: ${data.currentRound}`);
        
        if (data.userState) {
          if (data.userState.isInRoom) {
            addLog(`🎥 You're in room: ${data.userState.room.channelName}`);
            addLog(`💕 Your partner: ${data.userState.room.partnerId}`);
          } else if (data.userState.isWaiting) {
            addLog(`⏳ You're in waiting room (position ${data.userState.waitingPosition})`);
          }
        }
      }
    } catch (error) {
      addLog(`❌ Error: ${error}`);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-rose-950/20 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 text-amber-300 rounded-full text-sm font-medium mb-4">
            <IconRocket size={16} />
            Demo Mode
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Speed Dating Demo</h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Test the complete speed dating experience with 11 demo users. 
            This demo uses 1-minute rounds for faster testing.
          </p>
        </div>
        
        {/* Demo Users Grid */}
        <div className="bg-gray-900/60 backdrop-blur border border-gray-800 rounded-2xl p-6 mb-8">
          <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
            <IconUsers size={20} className="text-rose-400" />
            Demo Users ({DEMO_USERS.length + 1} total)
          </h2>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {/* Current test user */}
            <div className="flex flex-col items-center p-3 bg-gradient-to-br from-rose-500/20 to-purple-500/20 border border-rose-500/30 rounded-xl">
              <img 
                src={CURRENT_TEST_USER.avatar} 
                alt={CURRENT_TEST_USER.name}
                className="w-12 h-12 rounded-full border-2 border-rose-500 mb-2"
              />
              <div className="text-white text-xs font-medium text-center truncate w-full">You</div>
              <div className="text-rose-400 text-[10px]">{CURRENT_TEST_USER.age}</div>
            </div>
            
            {/* Demo users */}
            {DEMO_USERS.map(user => (
              <div 
                key={user.id}
                className={`flex flex-col items-center p-3 rounded-xl transition-all ${
                  registeredUsers.includes(user.id)
                    ? 'bg-emerald-500/20 border border-emerald-500/30'
                    : 'bg-gray-800/50'
                }`}
              >
                <div className="relative">
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="w-12 h-12 rounded-full border-2 border-gray-600 mb-2"
                  />
                  {registeredUsers.includes(user.id) && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                      <IconCheck size={10} className="text-white" />
                    </div>
                  )}
                </div>
                <div className="text-white text-xs font-medium text-center truncate w-full">
                  {user.name.split(' ')[0]}
                </div>
                <div className="text-gray-500 text-[10px]">{user.age}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Step Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {/* Step 1 */}
          <div className={`p-6 rounded-2xl border transition-all ${
            step === 'setup' 
              ? 'bg-rose-500/10 border-rose-500/30' 
              : event 
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-gray-900/60 border-gray-800'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-sm">Step 1</span>
              {event && <IconCheck size={18} className="text-emerald-400" />}
            </div>
            <h3 className="text-white font-bold mb-2">Create Event</h3>
            <p className="text-gray-400 text-sm mb-4">
              Create a demo speed dating event with 1-minute rounds.
            </p>
            <button
              onClick={createDemoEvent}
              disabled={loading || !!event}
              className={`w-full py-2 rounded-lg font-medium transition-all ${
                event
                  ? 'bg-emerald-600 text-white cursor-default'
                  : 'bg-rose-600 hover:bg-rose-500 text-white'
              } disabled:opacity-50`}
            >
              {event ? 'Created ✓' : loading && step === 'setup' ? 'Creating...' : 'Create Event'}
            </button>
          </div>
          
          {/* Step 2 */}
          <div className={`p-6 rounded-2xl border transition-all ${
            step === 'users' 
              ? 'bg-rose-500/10 border-rose-500/30' 
              : registeredUsers.length > 0 
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-gray-900/60 border-gray-800'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-sm">Step 2</span>
              {registeredUsers.length > 0 && <IconCheck size={18} className="text-emerald-400" />}
            </div>
            <h3 className="text-white font-bold mb-2">Register Users</h3>
            <p className="text-gray-400 text-sm mb-4">
              Register all 12 users (you + 11 demo users) for the event.
            </p>
            <button
              onClick={registerDemoUsers}
              disabled={loading || !event || registeredUsers.length > 0}
              className={`w-full py-2 rounded-lg font-medium transition-all ${
                registeredUsers.length > 0
                  ? 'bg-emerald-600 text-white cursor-default'
                  : 'bg-rose-600 hover:bg-rose-500 text-white'
              } disabled:opacity-50`}
            >
              {registeredUsers.length > 0 
                ? `${registeredUsers.length} Registered ✓` 
                : loading && step === 'users' 
                  ? 'Registering...' 
                  : 'Register All Users'}
            </button>
          </div>
          
          {/* Step 3 */}
          <div className={`p-6 rounded-2xl border transition-all ${
            step === 'event' || step === 'started'
              ? 'bg-rose-500/10 border-rose-500/30' 
              : 'bg-gray-900/60 border-gray-800'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-sm">Step 3</span>
              {step === 'started' && <IconCheck size={18} className="text-emerald-400" />}
            </div>
            <h3 className="text-white font-bold mb-2">Start Dating!</h3>
            <p className="text-gray-400 text-sm mb-4">
              Start the event and get matched with your first date.
            </p>
            <button
              onClick={startDemoEvent}
              disabled={loading || step !== 'event'}
              className={`w-full py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                step === 'started'
                  ? 'bg-emerald-600 text-white cursor-default'
                  : 'bg-rose-600 hover:bg-rose-500 text-white'
              } disabled:opacity-50`}
            >
              {step === 'started' ? (
                <>Redirecting... <IconVideo size={16} /></>
              ) : loading && step === 'event' ? (
                'Starting...'
              ) : (
                <>Start Event <IconPlayerPlay size={16} /></>
              )}
            </button>
          </div>
        </div>
        
        {/* Quick Actions */}
        {event && (
          <div className="flex gap-4 justify-center mb-8">
            <button
              onClick={checkEventStatus}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <IconRefresh size={16} />
              Check Status
            </button>
            
            <button
              onClick={() => router.push(`/dating/event/${event.id}`)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <IconHeart size={16} />
              Go to Event
            </button>
          </div>
        )}
        
        {/* Logs */}
        <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-4">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            📋 Activity Log
          </h3>
          <div className="bg-gray-950 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <p className="text-gray-500">Click &quot;Create Event&quot; to start the demo...</p>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} className="text-gray-300 mb-1">{log}</div>
              ))
            )}
          </div>
        </div>
        
        {/* Info Box */}
        <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <h4 className="text-blue-300 font-semibold mb-2">ℹ️ Demo Notes</h4>
          <ul className="text-gray-400 text-sm space-y-1">
            <li>• This demo uses <strong>1-minute rounds</strong> instead of 5 for faster testing</li>
            <li>• 12 users (you + 11 demo users) = 6 pairs per round, 0 waiting</li>
            <li>• The matchmaking algorithm will pair you with different people each round</li>
            <li>• Video calls use Agora - make sure you have <code>NEXT_PUBLIC_AGORA_APP_ID</code> in your <code>.env.local</code></li>
            <li>• AI summaries work without OpenAI - they use smart mock analysis</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

