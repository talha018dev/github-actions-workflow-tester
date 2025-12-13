import { AlbumsSidebar } from "./components/AlbumsSidebar";

async function getAlbums() {
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/albums", {
      cache: "force-cache",
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

export default async function AlbumsPage() {
  const albums = await getAlbums();

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <div className="flex h-[calc(100vh-4rem)]">
        <AlbumsSidebar albums={albums} currentAlbumId={undefined} />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Albums
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Select an album from the sidebar to view images
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

