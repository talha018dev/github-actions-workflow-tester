"use client";

import { Container, Title, Text, Button, Group } from "@mantine/core";
import { IconRocket } from "@tabler/icons-react";

export function Hero() {
  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20 md:py-32">
      <Container size="lg">
        <div className="text-center space-y-6">
          <Group justify="center" mb="xl">
            <IconRocket size={48} className="text-blue-600 dark:text-blue-400" />
          </Group>
          <Title
            order={1}
            size="3.5rem"
            className="font-bold text-gray-900 dark:text-white mb-6"
          >
            Welcome to Next.js
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              + Mantine + Tailwind
            </span>
          </Title>
          <Text
            size="xl"
            className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8"
          >
            A modern, responsive demo application showcasing the power of Next.js 15,
            Mantine UI components, and Tailwind CSS utilities.
          </Text>
          <Group justify="center" gap="md">
            <Button
              size="lg"
              variant="filled"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Get Started
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900"
            >
              Learn More
            </Button>
          </Group>
        </div>
      </Container>
    </div>
  );
}

