"use client";

import { Card, Image, Pagination, SimpleGrid, Text } from "@mantine/core";
import { useEffect, useState } from "react";
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
  images: ImageData[];
}

const ITEMS_PER_PAGE = 20;

export function ImageGrid({ images }: ImageGridProps) {
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Reset pagination and selected image when images change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedImage(null);
  }, [images]);

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
      setSelectedImage(images[currentIndex + 1]);
    }
  };

  const handlePreviousImage = () => {
    const currentIndex = getCurrentImageIndex();
    if (currentIndex > 0) {
      setSelectedImage(images[currentIndex - 1]);
    }
  };

  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <Text size="lg" className="text-gray-500 dark:text-gray-400">
          No images found
        </Text>
      </div>
    );
  }

  return (
    <>
      <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing="md">
        {currentImages.map((image) => (
          <Card
            key={image.id}
            shadow="sm"
            padding="xs"
            radius="md"
            withBorder
            className="cursor-pointer hover:shadow-lg transition-all duration-300 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            onClick={() => handleImageClick(image)}
          >
            <Card.Section>
              <Image
                src={`https://picsum.photos/id/${image.id}/300/300`}
                alt={image.author}
                height={200}
                fit="cover"
              />
            </Card.Section>
            <Text
              size="xs"
              className="text-gray-600 dark:text-gray-400 mt-2 truncate"
              title={image.author}
            >
              {image.author}
            </Text>
          </Card>
        ))}
      </SimpleGrid>

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination
            total={totalPages}
            value={currentPage}
            onChange={setCurrentPage}
            size="md"
            radius="md"
            withEdges
          />
        </div>
      )}

      {selectedImage && (
        <ImageModal
          image={selectedImage}
          onClose={handleCloseModal}
          onNext={handleNextImage}
          onPrevious={handlePreviousImage}
          hasNext={getCurrentImageIndex() < images.length - 1}
          hasPrevious={getCurrentImageIndex() > 0}
        />
      )}
    </>
  );
}

