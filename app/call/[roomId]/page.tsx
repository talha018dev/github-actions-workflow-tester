// app/call/[roomId]/page.tsx

import VideoCallClient from "@/app/call/[roomId]/VideoCallClient";


type PageProps = {
    params: { roomId: string };
};

export default async function CallPage({ params }: PageProps) {
    const { roomId } = await params;
    return (
        <main style={{ padding: 24 }}>
            <h1>Call Room: {roomId}</h1>
            <VideoCallClient roomId={roomId} />
        </main>
    );
}