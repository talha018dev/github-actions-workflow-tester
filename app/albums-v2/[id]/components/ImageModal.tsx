"use client";

import { useTransition } from "react";

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

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowLeft" && hasPrevious) {
      handlePrevious();
    } else if (e.key === "ArrowRight" && hasNext) {
      handleNext();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="relative bg-white dark:bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col shadow-xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 rounded-md transition-colors"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-700 dark:text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Image Container */}
        <div className="relative bg-gray-100 dark:bg-gray-800 flex items-center justify-center min-h-[400px] max-h-[70vh] p-4">
          <img
            src={image.download_url}
            alt={image.author}
            className="max-w-full max-h-full object-contain"
            style={{
              opacity: isPending ? 0.5 : 1,
              transition: "opacity 0.2s",
            }}
          />

          {/* Previous Button */}
          {hasPrevious && (
            <button
              onClick={handlePrevious}
              disabled={isPending}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 rounded-md transition-colors disabled:opacity-50"
              aria-label="Previous image"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-700 dark:text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}

          {/* Next Button */}
          {hasNext && (
            <button
              onClick={handleNext}
              disabled={isPending}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 rounded-md transition-colors disabled:opacity-50"
              aria-label="Next image"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-700 dark:text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Image Info */}
        <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {image.author}
          </h2>
          <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>
              {image.width} × {image.height}
            </span>
            <span>ID: {image.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

