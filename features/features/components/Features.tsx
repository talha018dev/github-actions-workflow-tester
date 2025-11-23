"use client";

import { Container, Title, Text, Card, SimpleGrid } from "@mantine/core";
import {
  IconRocket,
  IconShield,
  IconBolt,
  IconHeart,
  IconCode,
  IconUsers,
} from "@tabler/icons-react";

const features = [
  {
    icon: IconRocket,
    title: "Fast Performance",
    description:
      "Lightning-fast page loads and smooth interactions powered by Next.js 16.",
  },
  {
    icon: IconShield,
    title: "Secure by Default",
    description:
      "Built with security best practices and modern authentication patterns.",
  },
  {
    icon: IconBolt,
    title: "Modern Stack",
    description:
      "Latest technologies including TypeScript, Tailwind CSS v4, and Mantine v8.",
  },
  {
    icon: IconHeart,
    title: "Developer Experience",
    description:
      "Excellent DX with hot reload, type safety, and comprehensive tooling.",
  },
  {
    icon: IconCode,
    title: "Clean Architecture",
    description:
      "Feature-based folder structure for maintainable and scalable code.",
  },
  {
    icon: IconUsers,
    title: "User Centric",
    description:
      "Responsive design that works beautifully on all devices and screen sizes.",
  },
];

export function Features() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <Container size="xl">
        <div className="text-center mb-12 md:mb-16">
          <Title
            order={2}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            Powerful Features
          </Title>
          <Text
            size="lg"
            className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg"
          >
            Everything you need to build modern, responsive web applications
          </Text>
        </div>

        <SimpleGrid
          cols={{ base: 1, sm: 2, lg: 3 }}
          spacing={{ base: "md", md: "lg" }}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                shadow="sm"
                padding="lg"
                radius="md"
                withBorder
                className="h-full hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-3 bg-indigo-100 rounded-full">
                    <Icon
                      size={32}
                      className="text-indigo-600"
                    />
                  </div>
                  <Title order={3} className="text-xl font-semibold">
                    {feature.title}
                  </Title>
                  <Text size="sm" c="dimmed" className="text-sm">
                    {feature.description}
                  </Text>
                </div>
              </Card>
            );
          })}
        </SimpleGrid>
      </Container>
    </section>
  );
}

