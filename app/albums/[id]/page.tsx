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

async function getImages(id: string, limit: number = 30) {
  try {
    // Use album ID to calculate page offset so different albums show different images
    const page = Math.floor(Number(id) / 10) + 1;
    const res = await fetch(
      `https://picsum.photos/v2/list?page=${page}&limit=${limit}`,
      {
        cache: "no-store",
      }
    );
    if (!res.ok) {
      throw new Error("Failed to fetch images");
    }
    return res.json();
  } catch (error) {
    console.error("Error fetching images:", error);
    return [];
  }
}

interface AlbumDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AlbumDetailPage({
  params,
}: AlbumDetailPageProps) {
  const { id } = await params;
  const [albums, images] = await Promise.all([
    getAlbums(),
    getImages(id, 30),
  ]);

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

