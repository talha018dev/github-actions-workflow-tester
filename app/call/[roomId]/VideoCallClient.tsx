"use client";

import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
} from "agora-rtc-sdk-ng";
import { useEffect, useRef, useState } from "react";

const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID || "";

type Props = {
  roomId: string;
};

export default function VideoCallClient({ roomId }: Props) {
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const [joined, setJoined] = useState(false);
  const [uid, setUid] = useState<string | null>(null);

  const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);

  // For 1-on-1, we just track a map of remote users
  const [remoteUsers, setRemoteUsers] = useState<Record<string, IAgoraRTCRemoteUser>>({});

  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);

  // Ensure we only create the client once, and only on client side
  function getClient(): IAgoraRTCClient {
    if (!clientRef.current) {
      clientRef.current = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    }
    return clientRef.current;
  }

  // Setup event listeners once
  useEffect(() => {
    if (!APP_ID) {
      console.warn("Missing NEXT_PUBLIC_AGORA_APP_ID");
    }

    const client = getClient();

    const handleUserPublished = async (user: IAgoraRTCRemoteUser, mediaType: "video" | "audio") => {
      await client.subscribe(user, mediaType);

      setRemoteUsers((prev) => ({
        ...prev,
        [user.uid.toString()]: user,
      }));

      if (mediaType === "video") {
        const container = document.getElementById(`remote-player-${user.uid}`);
        if (container) {
          user.videoTrack?.play(container);
        }
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

      const container = document.getElementById(`remote-player-${user.uid}`);
      if (container) container.innerHTML = "";
    };

    const handleUserLeft = (user: IAgoraRTCRemoteUser) => {
      setRemoteUsers((prev) => {
        const updated = { ...prev };
        delete updated[user.uid.toString()];
        return updated;
      });

      const container = document.getElementById(`remote-player-${user.uid}`);
      if (container) container.innerHTML = "";
    };

    client.on("user-published", handleUserPublished);
    console.log('🚀 - VideoCallClient - client:', client)
    client.on("user-unpublished", handleUserUnpublished);
    client.on("user-left", handleUserLeft);

    // Cleanup on unmount
    return () => {
      client.off("user-published", handleUserPublished);
      client.off("user-unpublished", handleUserUnpublished);
      client.off("user-left", handleUserLeft);
    };
  }, []);

  async function handleJoin() {
    if (!APP_ID) {
      alert("NEXT_PUBLIC_AGORA_APP_ID is not set");
      return;
    }

    const client = getClient();

    try {
      // For dev: token = null if project is in "App ID only" mode
      const token: string | null = null;
      const userId: string | null = null; // Agora auto-assigns uid

      const _uid = await client.join(APP_ID, roomId, token, userId || null);
      setUid(_uid.toString());

      const [micTrack, camTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      setLocalAudioTrack(micTrack);
      setLocalVideoTrack(camTrack);

      await client.publish([micTrack, camTrack]);
      setJoined(true);

      // Attach local video to HTML element with id "local-player"
      camTrack.play("local-player");
    } catch (error) {
      console.error("Failed to join channel", error);
    }
  }

  async function handleLeave() {
    const client = getClient();

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

      const localContainer = document.getElementById("local-player");
      if (localContainer) localContainer.innerHTML = "";
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
      // Re-play the track in case DOM changed
      localVideoTrack.play("local-player");
    } else {
      await localVideoTrack.setEnabled(false);
      setIsCamOff(true);
      const localContainer = document.getElementById("local-player");
      if (localContainer) localContainer.innerHTML = "";
    }
  }

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ marginBottom: 12, display: "flex", gap: 8 }}>
        {!joined ? (
          <button onClick={handleJoin}>Join Call</button>
        ) : (
          <>
            <button onClick={handleLeave}>Leave Call</button>
            <button onClick={toggleMic}>{isMicMuted ? "Unmute Mic" : "Mute Mic"}</button>
            <button onClick={toggleCamera}>{isCamOff ? "Turn Camera On" : "Turn Camera Off"}</button>
          </>
        )}
      </div>

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        {/* Local video */}
        <div>
          <h3>Me {uid ? `(UID: ${uid})` : ""}</h3>
          <div
            id="local-player"
            style={{
              width: 320,
              height: 240,
              background: "#111",
              borderRadius: 8,
              overflow: "hidden",
            }}
          />
        </div>

        {/* Remote video(s) – for 1-on-1 usually just one */}
        <div>
          <h3>Remote</h3>
          {Object.keys(remoteUsers).length === 0 && <p>No one else in this room yet.</p>}

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {Object.keys(remoteUsers).map((key) => (
              <div key={key}>
                <p>UID: {key}</p>
                <div
                  id={`remote-player-${key}`}
                  style={{
                    width: 320,
                    height: 240,
                    background: "#111",
                    borderRadius: 8,
                    overflow: "hidden",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}