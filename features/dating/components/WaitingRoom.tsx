"use client";

import { IconHeart, IconLoader2, IconSparkles, IconUsers } from "@tabler/icons-react";
import { useEffect, useState } from "react";

interface WaitingRoomProps {
  position: number | null;
  totalWaiting: number;
  eventName: string;
  roundNumber: number;
  onLeave: () => void;
}

export function WaitingRoom({ position, totalWaiting, eventName, roundNumber, onLeave }: WaitingRoomProps) {
  const [dots, setDots] = useState('');
  
  // Animated loading dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);
  
  // Fun waiting messages
  const messages = [
    "Finding your perfect match...",
    "Scanning for compatible souls...",
    "Love is just around the corner...",
    "Great things take time...",
    "Your next connection awaits...",
  ];
  
  const [messageIndex, setMessageIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % messages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/30 to-rose-950/30 flex items-center justify-center p-8">
      <div className="max-w-lg w-full">
        {/* Main waiting card */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 text-center relative overflow-hidden">
          {/* Animated background glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl animate-pulse delay-150" />
          </div>
          
          {/* Content */}
          <div className="relative z-10">
            {/* Animated heart icon */}
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full animate-ping opacity-20" />
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full flex items-center justify-center">
                <IconHeart size={48} className="text-white fill-current" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">
              Waiting for Next Round{dots}
            </h2>
            
            <p className="text-gray-400 mb-6">
              {messages[messageIndex]}
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-800/50 rounded-xl p-4">
                <div className="text-rose-400 text-sm font-medium mb-1">Round</div>
                <div className="text-white text-2xl font-bold">{roundNumber}</div>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4">
                <div className="text-rose-400 text-sm font-medium mb-1">Position</div>
                <div className="text-white text-2xl font-bold flex items-center justify-center gap-2">
                  {position !== null ? (
                    <>
                      #{position}
                      <span className="text-sm text-gray-400 font-normal">of {totalWaiting}</span>
                    </>
                  ) : (
                    <IconLoader2 className="animate-spin" size={24} />
                  )}
                </div>
              </div>
            </div>
            
            {/* Event info */}
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center gap-2 text-purple-300">
                <IconSparkles size={18} />
                <span className="font-medium">{eventName}</span>
              </div>
            </div>
            
            {/* Info text */}
            <div className="flex items-start gap-3 bg-gray-800/50 rounded-xl p-4 text-left">
              <IconUsers size={20} className="text-rose-400 mt-0.5 flex-shrink-0" />
              <p className="text-gray-300 text-sm">
                With an odd number of participants this round, you&apos;ll be matched in the next round. 
                Hang tight – your perfect date is coming!
              </p>
            </div>
            
            {/* Leave button */}
            <button
              onClick={onLeave}
              className="mt-6 px-6 py-2 text-gray-400 hover:text-white transition-colors text-sm"
            >
              Leave Event
            </button>
          </div>
        </div>
        
        {/* Floating particles */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-rose-500/30 rounded-full animate-float"
              style={{
                left: `${20 + i * 15}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + i * 0.5}s`,
              }}
            />
          ))}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(100vh) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) scale(1);
            opacity: 0;
          }
        }
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  );
}

