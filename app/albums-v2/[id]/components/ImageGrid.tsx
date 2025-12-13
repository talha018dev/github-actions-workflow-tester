"use client";

import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import { ImageModal } from "./ImageModal";

interface ImageData {
  id: string;
  author: string;
  width: number;
  height: number;
  url: string;
  download_url: string;
}

interface ImageGridProps {
  albumId: string;
  initialImages: ImageData[];
}

const ITEMS_PER_PAGE = 20;
const IMAGES_PER_FETCH = 20;

export function ImageGrid({ albumId, initialImages }: ImageGridProps) {
  const [images, setImages] = useState<ImageData[]>(initialImages);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Reset pagination and selected image when album changes
  useEffect(() => {
    setImages(initialImages);
    setCurrentPage(1);
    setSelectedImage(null);
    setHasMore(true);
  }, [albumId, initialImages]);

  // Fetch more images when needed
  const fetchMoreImages = async (page: number) => {
    if (isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    try {
      // Calculate which API page to fetch
      const albumIdNum = Number(albumId);
      const basePage = ((albumIdNum - 1) % 20) + 1;
      const actualPage = basePage + Math.floor((page - 1) * IMAGES_PER_FETCH / 30);
      
      const res = await fetch(
        `/api/images?albumId=${albumId}&page=${page}&limit=${IMAGES_PER_FETCH}`
      );
      
      if (!res.ok) {
        throw new Error('Failed to fetch images');
      }
      
      const newImages = await res.json();
      
      if (newImages.length === 0) {
        setHasMore(false);
      } else {
        setImages((prev) => [...prev, ...newImages]);
      }
    } catch (error) {
      console.error('Error fetching more images:', error);
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const totalPages = Math.ceil(images.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentImages = images.slice(startIndex, endIndex);

  const handleImageClick = (image: ImageData) => {
    setSelectedImage(image);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  const getCurrentImageIndex = () => {
    if (!selectedImage) return -1;
    return images.findIndex((img) => img.id === selectedImage.id);
  };

  const handleNextImage = () => {
    const currentIndex = getCurrentImageIndex();
    if (currentIndex < images.length - 1) {
      startTransition(() => {
        setSelectedImage(images[currentIndex + 1]);
      });
    }
  };

  const handlePreviousImage = () => {
    const currentIndex = getCurrentImageIndex();
    if (currentIndex > 0) {
      startTransition(() => {
        setSelectedImage(images[currentIndex - 1]);
      });
    }
  };

  const handlePageChange = async (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
    
    // Check if we need to load more images
    const neededImages = page * ITEMS_PER_PAGE;
    if (neededImages > images.length && hasMore && !isLoadingMore) {
      // Calculate which page of images to fetch
      const fetchPage = Math.ceil((images.length + 1) / IMAGES_PER_FETCH);
      await fetchMoreImages(fetchPage);
    }
  };

  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-500 dark:text-gray-400">
          No images found
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {currentImages.map((image) => (
          <div
            key={image.id}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300"
            onClick={() => handleImageClick(image)}
          >
            <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
              <Image
                src={`https://picsum.photos/id/${image.id}/300/300`}
                alt={image.author}
                width={300}
                height={300}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-2">
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate" title={image.author}>
                {image.author}
              </p>
            </div>
          </div>
        ))}
      </div>

      {(totalPages > 1 || hasMore) && (
        <div className="mt-8 flex flex-col items-center gap-4">
          <nav className="flex items-center gap-2" aria-label="Pagination">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoadingMore}
              className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      disabled={isLoadingMore}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {page}
                    </button>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return (
                    <span key={page} className="px-2 text-gray-500">
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={(!hasMore && currentPage === totalPages) || isLoadingMore}
              className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
          
          {isLoadingMore && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 dark:border-gray-400"></div>
              <span>Loading more images...</span>
            </div>
          )}
        </div>
      )}

      {selectedImage && (
        <ImageModal
          image={selectedImage}
          images={images}
          currentIndex={getCurrentImageIndex()}
          onClose={handleCloseModal}
          onNext={handleNextImage}
          onPrevious={handlePreviousImage}
          hasNext={getCurrentImageIndex() < images.length - 1}
          hasPrevious={getCurrentImageIndex() > 0}
          isPending={isPending}
        />
      )}
    </>
  );
}

