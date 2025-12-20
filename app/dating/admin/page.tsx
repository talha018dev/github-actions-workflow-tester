"use client";

import { useEffect, useState } from "react";

interface DebugData {
  message: string;
  timestamp: string;
  summary: {
    users: number;
    events: number;
    rooms: number;
    matches: number;
  };
  events: Array<{
    id: string;
    name: string;
    status: string;
    participants: Array<{ id: string; name: string; hasProfile: boolean }>;
    participantCount: number;
    waitlist: string[];
    currentRound: number;
    activeRooms: Array<{
      id: string;
      channelName: string;
      participants: string[];
      roundNumber: number;
      status: string;
    }>;
  }>;
}

export default function AdminPage() {
  const [data, setData] = useState<DebugData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/dating/debug");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">
        <div className="text-xl">Loading database...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="text-red-500 text-xl">Error: {error}</div>
        <button
          onClick={fetchData}
          className="mt-4 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">🗄️ Database Viewer</h1>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4"
              />
              Auto-refresh (2s)
            </label>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm">Users</div>
            <div className="text-3xl font-bold text-blue-400">
              {data?.summary.users || 0}
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm">Events</div>
            <div className="text-3xl font-bold text-green-400">
              {data?.summary.events || 0}
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm">Rooms</div>
            <div className="text-3xl font-bold text-purple-400">
              {data?.summary.rooms || 0}
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm">Matches</div>
            <div className="text-3xl font-bold text-pink-400">
              {data?.summary.matches || 0}
            </div>
          </div>
        </div>

        {/* Timestamp */}
        <div className="text-gray-500 text-sm mb-4">
          Last updated: {data?.timestamp}
        </div>

        {/* Events */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Events</h2>
          
          {data?.events.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-6 text-gray-400">
              No events yet. Create one from /dating/demo
            </div>
          ) : (
            data?.events.map((event) => (
              <div key={event.id} className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{event.name}</h3>
                    <div className="text-gray-400 text-sm font-mono">
                      {event.id}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {event.status === "upcoming" && (
                      <button
                        onClick={async () => {
                          const res = await fetch(`/api/dating/events/${event.id}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action: 'start' }),
                          });
                          if (res.ok) fetchData();
                          else alert('Failed to start event. Need at least 2 participants.');
                        }}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm font-medium transition"
                      >
                        ▶ Start
                      </button>
                    )}
                    {event.status === "active" && (
                      <button
                        onClick={async () => {
                          const res = await fetch(`/api/dating/events/${event.id}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action: 'nextRound' }),
                          });
                          if (res.ok) fetchData();
                        }}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition"
                      >
                        ⏭ Next Round
                      </button>
                    )}
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        event.status === "active"
                          ? "bg-green-600"
                          : event.status === "completed"
                          ? "bg-gray-600"
                          : "bg-yellow-600"
                      }`}
                    >
                      {event.status}
                    </span>
                    <span className="text-gray-400">
                      Round {event.currentRound}
                    </span>
                  </div>
                </div>

                {/* Participants */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">
                    Participants ({event.participantCount})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {event.participants.map((p) => (
                      <span
                        key={p.id}
                        className="px-2 py-1 bg-gray-700 rounded text-sm"
                        title={p.id}
                      >
                        {p.name || p.id}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Active Rooms */}
                {event.activeRooms.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-400 mb-2">
                      Active Rooms ({event.activeRooms.length})
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {event.activeRooms.map((room) => (
                        <div
                          key={room.id}
                          className="bg-gray-700 rounded p-3 text-sm"
                        >
                          <div className="font-mono text-xs text-gray-400 mb-1">
                            {room.channelName}
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                room.status === "active"
                                  ? "bg-green-500"
                                  : "bg-yellow-500"
                              }`}
                            />
                            <span>{room.participants.join(" ↔ ")}</span>
                          </div>
                          <div className="text-gray-500 text-xs mt-1">
                            Round {room.roundNumber}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Raw JSON */}
        <details className="mt-8">
          <summary className="cursor-pointer text-gray-400 hover:text-white">
            View Raw JSON
          </summary>
          <pre className="mt-4 bg-gray-800 rounded-lg p-4 overflow-auto text-xs">
            {JSON.stringify(data, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}

