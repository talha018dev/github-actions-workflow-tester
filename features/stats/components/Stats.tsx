"use client";

import { Container, Title, Text, SimpleGrid } from "@mantine/core";

const stats = [
  { value: "100%", label: "Type Safe", description: "Full TypeScript support" },
  { value: "4.0", label: "Tailwind CSS", description: "Latest version" },
  { value: "16", label: "Next.js", description: "App Router ready" },
  { value: "8", label: "Mantine", description: "UI Components" },
];

export function Stats() {
  return (
    <section className="py-16 md:py-24 bg-indigo-600">
      <Container size="xl">
        <div className="text-center mb-12">
          <Title
            order={2}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Built with Modern Tools
          </Title>
          <Text size="lg" className="text-indigo-100 max-w-2xl mx-auto">
            Powered by the latest and greatest technologies
          </Text>
        </div>

        <SimpleGrid
          cols={{ base: 2, sm: 2, md: 4 }}
          spacing={{ base: "md", md: "lg" }}
        >
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-4 md:p-6 bg-white/10 rounded-lg backdrop-blur-sm"
            >
              <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-2">
                {stat.value}
              </div>
              <div className="text-lg sm:text-xl font-semibold text-white mb-1">
                {stat.label}
              </div>
              <div className="text-sm text-indigo-100">{stat.description}</div>
            </div>
          ))}
        </SimpleGrid>
      </Container>
    </section>
  );
}

