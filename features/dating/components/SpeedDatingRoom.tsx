"use client";

import {
  IconClock,
  IconHeart,
  IconHeartOff,
  IconMicrophone,
  IconMicrophoneOff,
  IconPhoneOff,
  IconScript,
  IconSparkles,
  IconUser,
  IconVideo,
  IconVideoOff,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import type { SpeedDatingRoom as SpeedDatingRoomType, UserProfile } from "../types";

const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID || "";

type AgoraRTC = any;
type IAgoraRTCClient = any;
type IAgoraRTCRemoteUser = any;
type ICameraVideoTrack = any;
type IMicrophoneAudioTrack = any;

interface TranscriptItem {
  speaker: string;
  text: string;
  timestamp: number;
}

interface PreviousMatch {
  oderId: string;
  partnerName: string;
  partnerAvatar: string;
  roundNumber: number;
}

interface SpeedDatingRoomProps {
  room: SpeedDatingRoomType;
  currentUser: UserProfile;
  partner: UserProfile | null;
  timeRemaining: number;
  roundNumber: number;
  totalRounds: number;
  previousMatches?: PreviousMatch[];
  onLike: () => void;
  onPass: () => void;
  onLeave: () => void;
}

export function SpeedDatingRoomComponent({
  room,
  currentUser,
  partner,
  timeRemaining,
  roundNumber,
  totalRounds,
  previousMatches = [],
  onLike,
  onPass,
  onLeave,
}: SpeedDatingRoomProps) {
  const [agoraRTC, setAgoraRTC] = useState<AgoraRTC | null>(null);
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const [joined, setJoined] = useState(false);
  
  const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
  const [remoteUser, setRemoteUser] = useState<IAgoraRTCRemoteUser | null>(null);
  
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [showTranscript, setShowTranscript] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  
  // Live speech recognition state
  const recognitionRef = useRef<any>(null);
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [showCaptions, setShowCaptions] = useState(true);
  const [speechSupported, setSpeechSupported] = useState(true);
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Determine urgency based on time remaining
  const getTimeColor = () => {
    if (timeRemaining <= 30) return 'text-red-400 animate-pulse';
    if (timeRemaining <= 60) return 'text-amber-400';
    return 'text-emerald-400';
  };
  
  // Load Agora SDK
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("agora-rtc-sdk-ng").then((module) => {
        setAgoraRTC(module.default);
      });
    }
  }, []);
  
  // Initialize speech recognition (Web Speech API - works in Chrome/Safari)
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // Check for browser support
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported in this browser');
      setSpeechSupported(false);
      return;
    }
    
    const recognition = new SpeechRecognition();
    
    // Configuration for best results
    recognition.continuous = true;        // Keep listening
    recognition.interimResults = true;    // Show real-time results
    recognition.lang = 'en-US';           // Language
    recognition.maxAlternatives = 1;      // Just take the best result
    
    // Handle speech results
    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';
      
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }
      
      // Update interim text for live display
      setInterimText(interim);
      
      // Add final transcript to history
      if (final) {
        setTranscript(prev => [...prev, {
          speaker: 'You',
          text: final.trim(),
          timestamp: Date.now(),
        }]);
        setInterimText(''); // Clear interim when we have final
      }
    };
    
    // Handle listening state
    recognition.onstart = () => {
      setIsListening(true);
      console.log('Speech recognition started');
    };
    
    recognition.onend = () => {
      setIsListening(false);
      console.log('Speech recognition ended');
      
      // Auto-restart if we're still in the call and not muted
      if (joined && !isMicMuted && recognitionRef.current) {
        try {
          recognition.start();
        } catch (e) {
          console.warn('Could not restart recognition:', e);
        }
      }
    };
    
    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      setIsListening(false);
      
      // Handle specific errors
      if (event.error === 'not-allowed') {
        setSpeechSupported(false);
      } else if (event.error === 'no-speech') {
        // This is normal, just try to restart
        if (joined && !isMicMuted) {
          setTimeout(() => {
            try {
              recognition.start();
            } catch (e) {
              // Ignore
            }
          }, 100);
        }
      }
    };
    
    recognitionRef.current = recognition;
    
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Ignore
        }
        recognitionRef.current = null;
      }
    };
  }, [joined, isMicMuted]);
  
  // Get or create Agora client
  function getClient(): IAgoraRTCClient | null {
    if (!agoraRTC) return null;
    if (!clientRef.current) {
      clientRef.current = agoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    }
    return clientRef.current;
  }
  
  // Set up Agora event listeners
  useEffect(() => {
    if (!agoraRTC) return;
    
    const client = getClient();
    if (!client) return;
    
    const handleUserPublished = async (user: IAgoraRTCRemoteUser, mediaType: "video" | "audio") => {
      console.log(`[Agora] Remote user ${user.uid} published ${mediaType}`);
      await client.subscribe(user, mediaType);
      setRemoteUser(user);
      
      if (mediaType === "video") {
        setTimeout(() => {
          const container = document.getElementById("partner-video");
          if (container) {
            user.videoTrack?.play(container);
            console.log(`[Agora] Playing remote video`);
          }
        }, 100);
      }
      if (mediaType === "audio") {
        user.audioTrack?.play();
        console.log(`[Agora] Playing remote audio`);
      }
    };
    
    const handleUserUnpublished = () => {
      setRemoteUser(null);
    };
    
    client.on("user-published", handleUserPublished);
    client.on("user-unpublished", handleUserUnpublished);
    client.on("user-left", handleUserUnpublished);
    
    return () => {
      client.off("user-published", handleUserPublished);
      client.off("user-unpublished", handleUserUnpublished);
      client.off("user-left", handleUserUnpublished);
    };
  }, [agoraRTC]);
  
  // Auto-join when room is available
  useEffect(() => {
    console.log(`[Room] Room data:`, room);
    console.log(`[Room] Current user:`, currentUser.id);
    console.log(`[Room] Channel:`, room?.channelName);
    
    if (agoraRTC && room && !joined) {
      handleJoin();
    }
    
    return () => {
      if (joined) {
        handleLeave();
      }
    };
  }, [agoraRTC, room?.channelName]);
  
  async function handleJoin() {
    if (!agoraRTC || !APP_ID || joined) return;
    
    const client = getClient();
    if (!client) return;
    
    try {
      // Fetch token from our API
      let token: string | null = null;
      let uid: string | number = currentUser.id;
      
      try {
        const tokenResponse = await fetch('/api/agora/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            channelName: room.channelName,
            uid: currentUser.id,
            role: 'publisher',
          }),
        });
        const tokenData = await tokenResponse.json();
        if (tokenData.token) {
          token = tokenData.token;
          uid = tokenData.uid || currentUser.id;
        }
      } catch (tokenError) {
        console.warn("Could not fetch token, trying without:", tokenError);
      }
      
      // Join with token if available, otherwise try without (for App ID only mode)
      console.log(`[Agora] Joining channel: ${room.channelName}`);
      console.log(`[Agora] Using UID: ${uid}, Token: ${token ? 'yes' : 'no'}`);
      
      await client.join(APP_ID, room.channelName, token, uid);
      console.log(`[Agora] Successfully joined channel!`);
      
      // Try to get media tracks - handle missing devices gracefully
      let micTrack = null;
      let camTrack = null;
      const tracksToPublish = [];
      
      // Try to get microphone
      try {
        micTrack = await agoraRTC.createMicrophoneAudioTrack();
        setLocalAudioTrack(micTrack);
        tracksToPublish.push(micTrack);
      } catch (micError: any) {
        console.warn("Could not access microphone:", micError.message);
        setIsMicMuted(true);
      }
      
      // Try to get camera
      try {
        camTrack = await agoraRTC.createCameraVideoTrack();
        setLocalVideoTrack(camTrack);
        tracksToPublish.push(camTrack);
      } catch (camError: any) {
        console.warn("Could not access camera:", camError.message);
        setIsCamOff(true);
      }
      
      // Publish available tracks
      if (tracksToPublish.length > 0) {
        await client.publish(tracksToPublish);
        console.log(`[Agora] Published ${tracksToPublish.length} tracks`);
      }
      
      setJoined(true);
      console.log(`[Agora] Ready! Waiting for other participant...`);
      
      // Start speech recognition if mic is available
      if (micTrack && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.warn("Could not start speech recognition:", e);
        }
      }
      
      // Play local video if camera is available
      if (camTrack) {
        setTimeout(() => {
          const container = document.getElementById("local-video");
          if (container) camTrack.play(container);
        }, 100);
      }
    } catch (error) {
      console.error("Failed to join:", error);
    }
  }
  
  async function handleLeave() {
    const client = getClient();
    if (!client) return;
    
    try {
      localAudioTrack?.stop();
      localAudioTrack?.close();
      localVideoTrack?.stop();
      localVideoTrack?.close();
      
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      
      await client.leave();
      
      setLocalAudioTrack(null);
      setLocalVideoTrack(null);
      setRemoteUser(null);
      setJoined(false);
    } catch (error) {
      console.error("Failed to leave:", error);
    }
  }
  
  async function toggleMic() {
    if (!localAudioTrack) return;
    if (isMicMuted) {
      await localAudioTrack.setEnabled(true);
      setIsMicMuted(false);
      recognitionRef.current?.start();
    } else {
      await localAudioTrack.setEnabled(false);
      setIsMicMuted(true);
      recognitionRef.current?.stop();
    }
  }
  
  async function toggleCamera() {
    if (!localVideoTrack) return;
    if (isCamOff) {
      await localVideoTrack.setEnabled(true);
      setIsCamOff(false);
      setTimeout(() => localVideoTrack.play("local-video"), 100);
    } else {
      await localVideoTrack.setEnabled(false);
      setIsCamOff(true);
    }
  }
  
  const handleLike = () => {
    setHasRated(true);
    onLike();
  };
  
  const handlePass = () => {
    setHasRated(true);
    onPass();
  };
  
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-rose-950/20">
      {/* Header with timer, round info, and previous matches */}
      <div className="bg-gray-900/80 border-b border-gray-800">
        {/* Previous matches row */}
        {previousMatches.length > 0 && (
          <div className="px-6 py-2 border-b border-gray-800/50 bg-gray-900/50">
            <div className="flex items-center gap-3">
              <span className="text-gray-500 text-xs uppercase tracking-wider">Connected with:</span>
              <div className="flex items-center gap-2">
                {previousMatches.map((match, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center gap-1.5 px-2 py-1 bg-gray-800 rounded-full"
                    title={`Round ${match.roundNumber}: ${match.partnerName}`}
                  >
                    <img 
                      src={match.partnerAvatar} 
                      alt={match.partnerName}
                      className="w-5 h-5 rounded-full border border-gray-600"
                    />
                    <span className="text-gray-300 text-xs">{match.partnerName.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Main header row */}
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-rose-400 font-semibold">Round {roundNumber}</span>
              <span className="text-gray-500 text-sm">of {totalRounds}</span>
            </div>
            {partner && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 border border-rose-500/30 rounded-full">
                <img 
                  src={partner.avatar} 
                  alt={partner.name}
                  className="w-7 h-7 rounded-full border-2 border-rose-500"
                />
                <span className="text-white font-medium">{partner.name}, {partner.age}</span>
                <IconHeart size={14} className="text-rose-400" />
              </div>
            )}
          </div>
          
          <div className={`flex items-center gap-2 ${getTimeColor()} font-mono text-2xl font-bold`}>
            <IconClock size={24} />
            {formatTime(timeRemaining)}
          </div>
          
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className={`p-2 rounded-lg transition-colors ${showTranscript ? 'bg-purple-600' : 'bg-gray-800 hover:bg-gray-700'} text-white`}
          >
            <IconScript size={20} />
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video area */}
        <div className="flex-1 flex flex-col p-4 gap-4">
          {/* Video grid */}
          <div className="flex-1 grid grid-cols-2 gap-4">
            {/* Partner video */}
            <div className="relative bg-gray-900 rounded-2xl overflow-hidden border border-gray-800">
              <div id="partner-video" className="w-full h-full object-cover" />
              
              {!remoteUser && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center mb-3">
                    {partner ? (
                      <img 
                        src={partner.avatar} 
                        alt={partner.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <IconUser size={48} className="text-white" />
                    )}
                  </div>
                  <p className="text-gray-400">Waiting for {partner?.name || 'partner'}...</p>
                </div>
              )}
              
              {/* Partner info overlay */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black/60 backdrop-blur-sm rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-semibold">
                        {partner?.name || 'Your Match'}
                      </h3>
                      {partner && (
                        <p className="text-gray-300 text-sm">
                          {partner.occupation} • {partner.location}
                        </p>
                      )}
                    </div>
                    {partner && (
                      <div className="flex flex-wrap gap-1">
                        {partner.interests?.slice(0, 3).map(interest => (
                          <span 
                            key={interest}
                            className="px-2 py-0.5 bg-rose-500/30 text-rose-300 rounded-full text-xs"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Local video */}
            <div className="relative bg-gray-900 rounded-2xl overflow-hidden border border-gray-800">
              <div id="local-video" className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
              
              {isCamOff && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                    <img 
                      src={currentUser.avatar} 
                      alt="You"
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                </div>
              )}
              
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black/60 backdrop-blur-sm px-3 py-2 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img 
                        src={currentUser.avatar} 
                        alt={currentUser.name}
                        className="w-6 h-6 rounded-full border border-purple-500"
                      />
                      <span className="text-white text-sm font-medium">{currentUser.name}</span>
                      <span className="text-purple-400 text-xs">(You)</span>
                      {isMicMuted && <span className="text-red-400 text-xs">Muted</span>}
                    </div>
                    {isListening && (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-xs text-red-400">REC</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Live Captions Overlay */}
          {showCaptions && (interimText || transcript.length > 0) && (
            <div className="bg-gray-900/90 backdrop-blur-sm rounded-xl p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <IconMicrophone size={16} className={isListening ? 'text-red-400' : 'text-gray-500'} />
                  <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">
                    Live Captions
                  </span>
                  {isListening && (
                    <span className="flex items-center gap-1 text-emerald-400 text-xs">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      Listening
                    </span>
                  )}
                </div>
                <button 
                  onClick={() => setShowCaptions(false)}
                  className="text-gray-500 hover:text-white text-xs"
                >
                  Hide
                </button>
              </div>
              
              {/* Current speech (interim) */}
              {interimText && (
                <div className="text-white text-lg font-medium animate-pulse">
                  {interimText}
                  <span className="inline-block w-0.5 h-5 bg-white ml-1 animate-blink" />
                </div>
              )}
              
              {/* Last few transcripts */}
              {!interimText && transcript.length > 0 && (
                <div className="space-y-1">
                  {transcript.slice(-3).map((item, idx) => (
                    <div 
                      key={idx} 
                      className={`text-sm ${idx === transcript.slice(-3).length - 1 ? 'text-white' : 'text-gray-400'}`}
                    >
                      <span className="text-purple-400 font-medium">{item.speaker}:</span> {item.text}
                    </div>
                  ))}
                </div>
              )}
              
              {!speechSupported && (
                <div className="text-amber-400 text-sm">
                  ⚠️ Speech recognition not available in this browser. Try Chrome or Safari.
                </div>
              )}
            </div>
          )}
          
          {/* Controls */}
          <div className="flex items-center justify-center gap-4 py-4">
            <button
              onClick={toggleMic}
              className={`p-4 rounded-full transition-all ${isMicMuted ? 'bg-red-600 hover:bg-red-500' : 'bg-gray-700 hover:bg-gray-600'} text-white`}
            >
              {isMicMuted ? <IconMicrophoneOff size={24} /> : <IconMicrophone size={24} />}
            </button>
            
            <button
              onClick={toggleCamera}
              className={`p-4 rounded-full transition-all ${isCamOff ? 'bg-red-600 hover:bg-red-500' : 'bg-gray-700 hover:bg-gray-600'} text-white`}
            >
              {isCamOff ? <IconVideoOff size={24} /> : <IconVideo size={24} />}
            </button>
            
            {/* Captions toggle */}
            <button
              onClick={() => setShowCaptions(!showCaptions)}
              className={`p-4 rounded-full transition-all ${showCaptions ? 'bg-purple-600 hover:bg-purple-500' : 'bg-gray-700 hover:bg-gray-600'} text-white relative`}
              title="Toggle Captions"
            >
              <IconScript size={24} />
              {isListening && showCaptions && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              )}
            </button>
            
            <div className="w-px h-10 bg-gray-700" />
            
            {/* Like/Pass buttons */}
            {!hasRated ? (
              <>
                <button
                  onClick={handlePass}
                  className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-all"
                  title="Pass"
                >
                  <IconHeartOff size={24} />
                </button>
                
                <button
                  onClick={handleLike}
                  className="p-4 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white transition-all shadow-lg shadow-rose-500/25"
                  title="Like"
                >
                  <IconHeart size={24} className="fill-current" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-full">
                <IconSparkles size={18} />
                <span className="text-sm font-medium">Rated!</span>
              </div>
            )}
            
            <div className="w-px h-10 bg-gray-700" />
            
            <button
              onClick={() => {
                handleLeave();
                onLeave();
              }}
              className="p-4 rounded-full bg-red-600 hover:bg-red-500 text-white transition-all"
            >
              <IconPhoneOff size={24} />
            </button>
          </div>
        </div>
        
        {/* Transcript sidebar */}
        {showTranscript && (
          <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <IconScript size={18} />
                Live Transcript
              </h3>
              <button 
                onClick={() => setShowTranscript(false)}
                className="text-gray-400 hover:text-white"
              >
                <IconX size={18} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {transcript.length === 0 ? (
                <p className="text-gray-500 text-center text-sm mt-8">
                  Start talking to see the transcript...
                </p>
              ) : (
                transcript.map((item, idx) => (
                  <div key={idx} className="bg-gray-800 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold ${item.speaker === 'You' ? 'text-purple-400' : 'text-rose-400'}`}>
                        {item.speaker}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm">{item.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Add global type declarations
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

