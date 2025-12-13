"use client";

import { useTransition } from "react";
import { Modal, Image, Text, Button, Group, Stack } from "@mantine/core";
import { IconChevronLeft, IconChevronRight, IconX } from "@tabler/icons-react";

interface ImageData {
  id: string;
  author: string;
  width: number;
  height: number;
  url: string;
  download_url: string;
}

interface ImageModalProps {
  image: ImageData;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
}

export function ImageModal({
  image,
  onClose,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious,
}: ImageModalProps) {
  const [isPending, startTransition] = useTransition();

  const handleNext = () => {
    startTransition(() => {
      onNext();
    });
  };

  const handlePrevious = () => {
    startTransition(() => {
      onPrevious();
    });
  };

  return (
    <Modal
      opened={true}
      onClose={onClose}
      size="xl"
      centered
      padding={0}
      withCloseButton={false}
      classNames={{
        body: "p-0",
        content: "bg-white dark:bg-gray-900",
      }}
    >
      <div className="relative">
        <Button
          variant="subtle"
          color="gray"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800"
          size="sm"
          radius="md"
        >
          <IconX size={18} />
        </Button>

        <div className="relative bg-gray-100 dark:bg-gray-800">
          <div className="flex items-center justify-center min-h-[400px] max-h-[70vh] p-4">
            <Image
              src={image.download_url}
              alt={image.author}
              fit="contain"
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                opacity: isPending ? 0.5 : 1,
                transition: "opacity 0.2s",
              }}
            />
          </div>

          {hasPrevious && (
            <Button
              variant="subtle"
              color="gray"
              onClick={handlePrevious}
              disabled={isPending}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800"
              size="lg"
              radius="md"
            >
              <IconChevronLeft size={24} />
            </Button>
          )}

          {hasNext && (
            <Button
              variant="subtle"
              color="gray"
              onClick={handleNext}
              disabled={isPending}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800"
              size="lg"
              radius="md"
            >
              <IconChevronRight size={24} />
            </Button>
          )}
        </div>

        <Stack gap="sm" p="md" className="bg-white dark:bg-gray-900">
          <Text size="lg" fw={600} className="text-gray-900 dark:text-white">
            {image.author}
          </Text>
          <Group gap="md">
            <Text size="sm" className="text-gray-600 dark:text-gray-400">
              {image.width} × {image.height}
            </Text>
            <Text size="sm" className="text-gray-600 dark:text-gray-400">
              ID: {image.id}
            </Text>
          </Group>
        </Stack>
      </div>
    </Modal>
  );
}

