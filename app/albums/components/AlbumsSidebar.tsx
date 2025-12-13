import { ScrollArea, Stack, Text } from "@mantine/core";
import { IconPhoto } from "@tabler/icons-react";
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
        <Text size="xl" fw={700} className="text-gray-900 dark:text-white">
          Albums
        </Text>
        <Text size="sm" className="text-gray-600 dark:text-gray-400 mt-1">
          {albums.length} albums
        </Text>
      </div>
      <ScrollArea style={{ height: "calc(100vh - 8rem)" }}>
        <Stack gap="xs" p="md">
          {albums.map((album) => (
            <Link
              key={album.id}
              href={`/albums/${album.id}`}
              className={`w-full text-left p-3 rounded-md transition-all block ${
                currentAlbumId === String(album.id)
                  ? "bg-blue-600 dark:bg-blue-600 text-white"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <IconPhoto size={18} />
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-sm font-${
                      currentAlbumId === String(album.id) ? "semibold" : "normal"
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
        </Stack>
      </ScrollArea>
    </div>
  );
}

