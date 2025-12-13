import { AlbumsSidebar } from "../components/AlbumsSidebar";
import { ImageGrid } from "./components/ImageGrid";

export const dynamic = 'force-dynamic';

async function getAlbums() {
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/albums", {
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error("Failed to fetch albums");
    }
    return res.json();
  } catch (error) {
    console.error("Error fetching albums:", error);
    return [];
  }
}

async function getImages(id: string, limit: number = 200) {
  try {
    // Use album ID to calculate page number, cycling through pages 1-20 for variety
    // This ensures different albums get different images
    const albumIdNum = Number(id);
    const page = ((albumIdNum - 1) % 20) + 1;
    const url = `https://picsum.photos/v2/list?page=${page}&limit=${limit}`;
    console.log(`📸 Album ${id} → Fetching from page ${page}: ${url}`);
    
    const res = await fetch(url, {
      cache: "no-store", // Don't cache to ensure fresh data for each album
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch images: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    const firstImageId = data[0]?.id || 'none';
    console.log(`✅ Album ${id} → Page ${page} → ${data.length} images (first: ${firstImageId})`);
    return data;
  } catch (error) {
    console.error(`❌ Error fetching images for album ${id}:`, error);
    return [];
  }
}

interface AlbumDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AlbumV2DetailPage({
  params,
}: AlbumDetailPageProps) {
  const { id } = await params;
  const [albums, images] = await Promise.all([
    getAlbums(),
    getImages(id, 200),
  ]);
  console.log(`🚀 Album ${id} - Received ${images.length} images, first image ID: ${images[0]?.id || 'none'}`)

  const currentAlbum = albums.find((album: any) => album.id === Number(id));

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <div className="flex h-[calc(100vh-4rem)]">
        <AlbumsSidebar albums={albums} currentAlbumId={id} />
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {currentAlbum?.title || `Album ${id}`}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {images.length} images
            </p>
            <ImageGrid key={id} images={images} />
          </div>
        </div>
      </div>
    </main>
  );
}

