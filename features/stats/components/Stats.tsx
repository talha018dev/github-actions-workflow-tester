"use client";

import { Container, SimpleGrid, Paper, Text, Title } from "@mantine/core";
import {
  IconUsers,
  IconCode,
  IconRocket,
  IconHeart,
} from "@tabler/icons-react";

const stats = [
  {
    title: "Active Users",
    value: "10K+",
    description: "Users actively using our platform",
    icon: IconUsers,
    color: "blue",
  },
  {
    title: "Lines of Code",
    value: "50K+",
    description: "Well-structured and maintainable code",
    icon: IconCode,
    color: "green",
  },
  {
    title: "Projects",
    value: "200+",
    description: "Successfully delivered projects",
    icon: IconRocket,
    color: "purple",
  },
  {
    title: "Satisfaction",
    value: "99%",
    description: "Client satisfaction rate",
    icon: IconHeart,
    color: "pink",
  },
];

export function Stats() {
  return (
    <div className="bg-white dark:bg-gray-800 py-16 md:py-24">
      <Container size="lg">
        <Title order={2} className="text-center mb-12 text-gray-900 dark:text-white">
          Our Statistics
        </Title>
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Paper
                key={stat.title}
                shadow="sm"
                p="xl"
                radius="md"
                className="text-center hover:shadow-lg transition-shadow duration-300 bg-gray-50 dark:bg-gray-700"
              >
                <div className="flex justify-center mb-4">
                  <div className={`p-3 rounded-full ${
                    stat.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900' :
                    stat.color === 'green' ? 'bg-green-100 dark:bg-green-900' :
                    stat.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900' :
                    'bg-pink-100 dark:bg-pink-900'
                  }`}>
                    <Icon
                      size={32}
                      className={
                        stat.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                        stat.color === 'green' ? 'text-green-600 dark:text-green-400' :
                        stat.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                        'text-pink-600 dark:text-pink-400'
                      }
                    />
                  </div>
                </div>
                <Title order={3} className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
                  {stat.value}
                </Title>
                <Text fw={600} className="mb-2 text-gray-700 dark:text-gray-300">
                  {stat.title}
                </Text>
                <Text size="sm" c="dimmed" className="text-gray-600 dark:text-gray-400">
                  {stat.description}
                </Text>
              </Paper>
            );
          })}
        </SimpleGrid>
      </Container>
    </div>
  );
}

