"use client";

import { Button, Container, Title, Text } from "@mantine/core";
import { useHero } from "../hooks/useHero";

export function Hero() {
  const { handleGetStarted } = useHero();

  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20 md:py-32">
      <Container size="xl">
        <div className="text-center space-y-6 md:space-y-8">
          <Title
            order={1}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900"
          >
            Welcome to Our
            <span className="block text-indigo-600 mt-2">
              Modern Platform
            </span>
          </Title>
          <Text
            size="lg"
            className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg md:text-xl px-4"
          >
            Build amazing experiences with Next.js 16, Tailwind CSS v4, and
            Mantine v8. A fully responsive and modern web application.
          </Text>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="w-full sm:w-auto px-8"
            >
              Get Started
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto px-8"
            >
              Learn More
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}

