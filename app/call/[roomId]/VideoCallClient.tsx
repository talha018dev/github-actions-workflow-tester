"use client";

import {
  IconMicrophone,
  IconMicrophoneOff,
  IconNotes,
  IconPhoneOff,
  IconScript,
  IconUsers,
  IconVideo,
  IconVideoOff,
  IconX
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID || "";

// Types for Agora SDK
type IAgoraRTCClient = any;
type IAgoraRTCRemoteUser = any;
type ICameraVideoTrack = any;
type IMicrophoneAudioTrack = any;
type AgoraRTC = any;

type TranscriptItem = {
  uid: string;
  text: string;
  timestamp: number;
};

type Props = {
  roomId: string;
};

// Add Web Speech API types
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export default function VideoCallClient({ roomId }: Props) {
  const [agoraRTC, setAgoraRTC] = useState<AgoraRTC | null>(null);
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const [joined, setJoined] = useState(false);
  const [uid, setUid] = useState<string | null>(null);

  const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<Record<string, IAgoraRTCRemoteUser>>({});

  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);

  // Transcript state
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [showTranscript, setShowTranscript] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [summary, setSummary] = useState<string>("");
  const [isSummarizing, setIsSummarizing] = useState(false);

  // Dynamically import Agora SDK
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("agora-rtc-sdk-ng").then((module) => {
        setAgoraRTC(module.default);
      });
    }
  }, []);

  function getClient(): IAgoraRTCClient | null {
    if (!agoraRTC) return null;
    if (!clientRef.current) {
      clientRef.current = agoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    }
    return clientRef.current;
  }

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined" && (window.webkitSpeechRecognition || window.SpeechRecognition)) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const client = getClient();
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript && uid && client) {
          const text = finalTranscript.trim();
          // Add to local transcript
          const newItem = { uid: "You", text, timestamp: Date.now() };
          setTranscript(prev => [...prev, newItem]);
          
          // Broadcast to others via Agora Data Stream
          // Note: In a real app, you should create a data stream first
          // This assumes createDataStream was called (we'll implement this)
          // client.sendStreamMessage(streamId, text); 
        }
      };
      
      recognitionRef.current = recognition;
    }
  }, [uid, agoraRTC]); // Re-init if UID changes

  useEffect(() => {
    if (!agoraRTC) return;
    if (!APP_ID) console.warn("Missing NEXT_PUBLIC_AGORA_APP_ID");

    const client = getClient();
    if (!client) return;

    const handleUserPublished = async (user: IAgoraRTCRemoteUser, mediaType: "video" | "audio") => {
      await client.subscribe(user, mediaType);
      setRemoteUsers((prev) => ({ ...prev, [user.uid.toString()]: user }));

      if (mediaType === "video") {
        setTimeout(() => {
          const container = document.getElementById(`remote-player-${user.uid}`);
          if (container) user.videoTrack?.play(container);
        }, 100);
      }

      if (mediaType === "audio") user.audioTrack?.play();
    };

    const handleUserUnpublished = (user: IAgoraRTCRemoteUser) => {
      setRemoteUsers((prev) => {
        const updated = { ...prev };
        delete updated[user.uid.toString()];
        return updated;
      });
    };

    // Listen for data streams (transcripts from others)
    const handleStreamMessage = (uid: string, payload: Uint8Array) => {
      const text = new TextDecoder().decode(payload);
      setTranscript(prev => [...prev, { uid: `User ${uid}`, text, timestamp: Date.now() }]);
    };

    client.on("user-published", handleUserPublished);
    client.on("user-unpublished", handleUserUnpublished);
    client.on("user-left", handleUserUnpublished);
    client.on("stream-message", handleStreamMessage);

    return () => {
      client.off("user-published", handleUserPublished);
      client.off("user-unpublished", handleUserUnpublished);
      client.off("user-left", handleUserUnpublished);
      client.off("stream-message", handleStreamMessage);
    };
  }, [agoraRTC]);

  async function handleJoin() {
    if (!agoraRTC || !APP_ID) return;

    const client = getClient();
    if (!client) return;

    try {
      const _uid = await client.join(APP_ID, roomId, null, null);
      setUid(_uid.toString());

      const [micTrack, camTrack] = await agoraRTC.createMicrophoneAndCameraTracks();
      setLocalAudioTrack(micTrack);
      setLocalVideoTrack(camTrack);

      await client.publish([micTrack, camTrack]);
      setJoined(true);

      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }

      setTimeout(() => camTrack.play("local-player"), 100);
    } catch (error) {
      console.error("Failed to join channel", error);
    }
  }

  async function handleLeave() {
    const client = getClient();
    if (!client) return;

    try {
      if (localAudioTrack) {
        localAudioTrack.stop();
        localAudioTrack.close();
      }
      if (localVideoTrack) {
        localVideoTrack.stop();
        localVideoTrack.close();
      }

      // Stop speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      await client.leave();

      setLocalAudioTrack(null);
      setLocalVideoTrack(null);
      setRemoteUsers({});
      setJoined(false);
      setUid(null);
      setIsMicMuted(false);
      setIsCamOff(false);
      setTranscript([]);
      setSummary("");
    } catch (error) {
      console.error("Failed to leave channel", error);
    }
  }

  async function generateSummary() {
    setIsSummarizing(true);
    // Mock summary generation
    setTimeout(() => {
      const fullText = transcript.map(t => `${t.uid}: ${t.text}`).join('\n');
      // In a real app, send 'fullText' to an API endpoint that calls OpenAI
      setSummary("Here is a summary of the meeting based on the transcript:\n\n- Participants discussed the new project timeline.\n- Key issues with the API were identified.\n- Next steps include deploying the staging environment.");
      setIsSummarizing(false);
    }, 1500);
  }

  // Toggle helpers
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
      localVideoTrack.play("local-player");
    } else {
      await localVideoTrack.setEnabled(false);
      setIsCamOff(true);
    }
  }

  const participantCount = Object.keys(remoteUsers).length + (joined ? 1 : 0);
  const gridCols = participantCount <= 1 ? 1 : participantCount <= 4 ? 2 : 3;
  const gridColsClass = { 1: 'md:grid-cols-1', 2: 'md:grid-cols-2', 3: 'md:grid-cols-3' }[gridCols] || 'md:grid-cols-1';

  if (!joined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gray-900 text-white rounded-xl p-8">
        <h2 className="text-3xl font-bold mb-8">Ready to join?</h2>
        <div className="flex gap-4">
          <button onClick={handleJoin} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-full font-medium transition-colors">
            Join now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-100px)] bg-gray-900 rounded-xl overflow-hidden relative">
      <div className="flex-1 flex flex-col relative">
        {/* Main Video Grid */}
        <div className={`flex-1 p-4 grid gap-4 grid-cols-1 ${gridColsClass} auto-rows-fr`}>
          {/* Local User */}
          <div className="relative bg-gray-800 rounded-xl overflow-hidden aspect-video shadow-lg border border-gray-700">
            <div id="local-player" className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
            <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-lg text-white text-sm font-medium backdrop-blur-sm">
              You {isMicMuted && '(Muted)'}
            </div>
            {isCamOff && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold text-white">
                  {uid?.slice(0, 2) || 'ME'}
                </div>
              </div>
            )}
          </div>

          {/* Remote Users */}
          {Object.values(remoteUsers).map((user) => (
            <div key={user.uid} className="relative bg-gray-800 rounded-xl overflow-hidden aspect-video shadow-lg border border-gray-700">
              <div id={`remote-player-${user.uid}`} className="w-full h-full object-cover" />
              <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-lg text-white text-sm font-medium backdrop-blur-sm">
                User {user.uid}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Control Bar */}
        <div className="h-20 bg-gray-900 border-t border-gray-800 flex items-center justify-between px-8 z-10">
          <div className="text-white font-medium flex items-center gap-2">
            <span className="bg-gray-800 p-2 rounded-lg"><IconUsers size={20} /></span>
            <span>{participantCount} participants</span>
          </div>

          <div className="flex items-center gap-4">
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
            <button onClick={handleLeave} className="p-4 rounded-full bg-red-600 hover:bg-red-500 text-white px-8 flex items-center gap-2 transition-all">
              <IconPhoneOff size={24} />
            </button>
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className={`p-4 rounded-full transition-all ${showTranscript ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'} text-white`}
              title="Toggle Transcript"
            >
              <IconScript size={24} />
            </button>
          </div>

          <div className="text-gray-400 text-sm">{roomId}</div>
        </div>
      </div>

      {/* Transcript Sidebar */}
      {showTranscript && (
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col h-full shadow-2xl transition-all">
          <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900/50">
            <h3 className="text-white font-bold flex items-center gap-2">
              <IconScript size={18} /> Transcript
            </h3>
            <button onClick={() => setShowTranscript(false)} className="text-gray-400 hover:text-white">
              <IconX size={18} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {transcript.length === 0 ? (
              <div className="text-gray-500 text-center mt-10 text-sm">
                No conversation yet.<br/>Start speaking...
              </div>
            ) : (
              transcript.map((item, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                  <div className="flex items-baseline justify-between">
                    <span className={`text-xs font-bold ${item.uid === 'You' ? 'text-blue-400' : 'text-green-400'}`}>
                      {item.uid}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm bg-gray-700/50 p-2 rounded-lg">
                    {item.text}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Summary Section */}
          <div className="p-4 border-t border-gray-700 bg-gray-900/30">
            {summary ? (
              <div className="bg-blue-900/20 border border-blue-800 p-3 rounded-lg mb-3">
                <h4 className="text-blue-300 text-xs font-bold mb-2 flex items-center gap-1">
                  <IconNotes size={14} /> AI Summary
                </h4>
                <p className="text-gray-300 text-xs whitespace-pre-wrap">{summary}</p>
              </div>
            ) : null}
            
            <button
              onClick={generateSummary}
              disabled={isSummarizing || transcript.length === 0}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isSummarizing ? 'Generating...' : 'Generate Summary'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
