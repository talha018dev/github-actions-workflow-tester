"use client";

import {
  IconMicrophone,
  IconMicrophoneOff,
  IconPhoneOff,
  IconUsers,
  IconVideo,
  IconVideoOff
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID || "";

// Types for Agora SDK (simplified for dynamic import)
type IAgoraRTCClient = any;
type IAgoraRTCRemoteUser = any;
type ICameraVideoTrack = any;
type IMicrophoneAudioTrack = any;
type AgoraRTC = any;

type Props = {
  roomId: string;
};

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

  // Dynamically import Agora SDK only on client side
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

  useEffect(() => {
    if (!agoraRTC) return;
    
    if (!APP_ID) {
      console.warn("Missing NEXT_PUBLIC_AGORA_APP_ID");
    }

    const client = getClient();
    if (!client) return;

    const handleUserPublished = async (user: IAgoraRTCRemoteUser, mediaType: "video" | "audio") => {
      await client.subscribe(user, mediaType);

      setRemoteUsers((prev) => ({
        ...prev,
        [user.uid.toString()]: user,
      }));

      if (mediaType === "video") {
        // Wait a bit for the DOM to be ready
        setTimeout(() => {
          const container = document.getElementById(`remote-player-${user.uid}`);
          if (container) {
            user.videoTrack?.play(container);
          }
        }, 100);
      }

      if (mediaType === "audio") {
        user.audioTrack?.play();
      }
    };

    const handleUserUnpublished = (user: IAgoraRTCRemoteUser) => {
      setRemoteUsers((prev) => {
        const updated = { ...prev };
        delete updated[user.uid.toString()];
        return updated;
      });
    };

    const handleUserLeft = (user: IAgoraRTCRemoteUser) => {
      setRemoteUsers((prev) => {
        const updated = { ...prev };
        delete updated[user.uid.toString()];
        return updated;
      });
    };

    client.on("user-published", handleUserPublished);
    client.on("user-unpublished", handleUserUnpublished);
    client.on("user-left", handleUserLeft);

    return () => {
      client.off("user-published", handleUserPublished);
      client.off("user-unpublished", handleUserUnpublished);
      client.off("user-left", handleUserLeft);
    };
  }, [agoraRTC]);

  async function handleJoin() {
    if (!agoraRTC) {
      alert("Agora SDK loading...");
      return;
    }
    
    if (!APP_ID) {
      alert("NEXT_PUBLIC_AGORA_APP_ID is not set");
      return;
    }

    const client = getClient();
    if (!client) return;

    try {
      const token: string | null = null;
      const userId: string | null = null; 

      const _uid = await client.join(APP_ID, roomId, token, userId || null);
      setUid(_uid.toString());

      const [micTrack, camTrack] = await agoraRTC.createMicrophoneAndCameraTracks();
      setLocalAudioTrack(micTrack);
      setLocalVideoTrack(camTrack);

      await client.publish([micTrack, camTrack]);
      setJoined(true);

      setTimeout(() => {
        camTrack.play("local-player");
      }, 100);
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

      await client.leave();

      setLocalAudioTrack(null);
      setLocalVideoTrack(null);
      setRemoteUsers({});
      setJoined(false);
      setUid(null);
      setIsMicMuted(false);
      setIsCamOff(false);
    } catch (error) {
      console.error("Failed to leave channel", error);
    }
  }

  async function toggleMic() {
    if (!localAudioTrack) return;
    if (isMicMuted) {
      await localAudioTrack.setEnabled(true);
      setIsMicMuted(false);
    } else {
      await localAudioTrack.setEnabled(false);
      setIsMicMuted(true);
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

  // Calculate grid columns based on participant count (remote + local)
  const participantCount = Object.keys(remoteUsers).length + (joined ? 1 : 0);
  const gridCols = participantCount <= 1 ? 1 : participantCount <= 4 ? 2 : 3;

  if (!joined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gray-900 text-white rounded-xl p-8">
        <h2 className="text-3xl font-bold mb-8">Ready to join?</h2>
        <div className="flex gap-4">
          <button 
            onClick={handleJoin}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-full font-medium transition-colors"
          >
            Join now
          </button>
        </div>
      </div>
    );
  }

  const gridColsClass = {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2', 
    3: 'md:grid-cols-3'
  }[gridCols] || 'md:grid-cols-1';

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] bg-gray-900 rounded-xl overflow-hidden relative">
      {/* Main Video Grid */}
      <div className={`flex-1 p-4 grid gap-4 grid-cols-1 ${gridColsClass} auto-rows-fr`}>
        {/* Local User */}
        <div className="relative bg-gray-800 rounded-xl overflow-hidden aspect-video shadow-lg border border-gray-700">
          <div 
            id="local-player" 
            className="w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }} // Mirror effect
          />
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
            <div 
              id={`remote-player-${user.uid}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-lg text-white text-sm font-medium backdrop-blur-sm">
              User {user.uid}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Control Bar */}
      <div className="h-20 bg-gray-900 border-t border-gray-800 flex items-center justify-between px-8">
        <div className="text-white font-medium flex items-center gap-2">
           <span className="bg-gray-800 p-2 rounded-lg"><IconUsers size={20} /></span>
           <span>{participantCount} participants</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleMic}
            className={`p-4 rounded-full transition-all ${
              isMicMuted 
                ? 'bg-red-600 hover:bg-red-500 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
          >
            {isMicMuted ? <IconMicrophoneOff size={24} /> : <IconMicrophone size={24} />}
          </button>

          <button
            onClick={toggleCamera}
            className={`p-4 rounded-full transition-all ${
              isCamOff 
                ? 'bg-red-600 hover:bg-red-500 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
          >
            {isCamOff ? <IconVideoOff size={24} /> : <IconVideo size={24} />}
          </button>

          <button
            onClick={handleLeave}
            className="p-4 rounded-full bg-red-600 hover:bg-red-500 text-white px-8 flex items-center gap-2 transition-all"
          >
            <IconPhoneOff size={24} />
          </button>
        </div>

        <div className="text-gray-400 text-sm">
          {roomId}
        </div>
      </div>
    </div>
  );
}
