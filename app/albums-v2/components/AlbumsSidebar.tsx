import Link from "next/link";

interface Album {
  id: number;
  userId: number;
  title: string;
}

interface AlbumsSidebarProps {
  albums: Album[];
  currentAlbumId?: string;
}

export function AlbumsSidebar({ albums, currentAlbumId }: AlbumsSidebarProps) {
  return (
    <div className="w-80 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Albums
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {albums.length} albums
        </p>
      </div>
      <div className="overflow-y-auto" style={{ height: "calc(100vh - 8rem)" }}>
        <div className="p-4 space-y-1">
          {albums.map((album) => (
            <Link
              key={album.id}
              href={`/albums-v2/${album.id}`}
              className={`w-full text-left p-3 rounded-md transition-all block ${
                currentAlbumId === String(album.id)
                  ? "bg-blue-600 dark:bg-blue-600 text-white"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-sm ${
                      currentAlbumId === String(album.id) ? "font-semibold" : "font-normal"
                    } truncate`}
                  >
                    {album.title}
                  </div>
                  <div
                    className={`text-xs mt-1 ${
                      currentAlbumId === String(album.id)
                        ? "text-blue-100"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    Album #{album.id}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

