"use client";

import { Container, SimpleGrid, Card, Text, Title, Badge } from "@mantine/core";
import {
  IconShield,
  IconBolt,
  IconDeviceDesktop,
  IconLock,
  IconChartBar,
  IconWorld,
} from "@tabler/icons-react";

const features = [
  {
    title: "Fast Performance",
    description:
      "Built with Next.js 15 for optimal performance and server-side rendering capabilities.",
    icon: IconBolt,
    color: "yellow",
  },
  {
    title: "Responsive Design",
    description:
      "Fully responsive layouts that work seamlessly across all devices and screen sizes.",
    icon: IconDeviceDesktop,
    color: "blue",
  },
  {
    title: "Secure by Default",
    description:
      "Security best practices built-in with modern authentication and authorization.",
    icon: IconShield,
    color: "green",
  },
  {
    title: "Privacy First",
    description:
      "Your data is protected with end-to-end encryption and privacy controls.",
    icon: IconLock,
    color: "red",
  },
  {
    title: "Analytics Ready",
    description:
      "Built-in analytics and monitoring tools to track your application's performance.",
    icon: IconChartBar,
    color: "purple",
  },
  {
    title: "Global Scale",
    description:
      "Deploy anywhere with support for edge computing and global CDN distribution.",
    icon: IconWorld,
    color: "cyan",
  },
];

export function Features() {
  return (
    <div className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-16 md:py-24">
      <Container size="lg">
        <div className="text-center mb-12">
          <Badge size="lg" variant="light" color="blue" mb="md">
            Features
          </Badge>
          <Title order={2} className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Why Choose Us?
          </Title>
          <Text size="lg" c="dimmed" className="max-w-2xl mx-auto text-gray-600 dark:text-gray-400">
            Discover the powerful features that make our platform stand out
          </Text>
        </div>
        <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                shadow="sm"
                padding="lg"
                radius="md"
                withBorder
                className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
              >
                <div className={`inline-flex p-3 rounded-lg mb-4 ${
                  feature.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900' :
                  feature.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900' :
                  feature.color === 'green' ? 'bg-green-100 dark:bg-green-900' :
                  feature.color === 'red' ? 'bg-red-100 dark:bg-red-900' :
                  feature.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900' :
                  'bg-cyan-100 dark:bg-cyan-900'
                }`}>
                  <Icon
                    size={28}
                    className={
                      feature.color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                      feature.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                      feature.color === 'green' ? 'text-green-600 dark:text-green-400' :
                      feature.color === 'red' ? 'text-red-600 dark:text-red-400' :
                      feature.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                      'text-cyan-600 dark:text-cyan-400'
                    }
                  />
                </div>
                <Title order={4} className="mb-2 text-gray-900 dark:text-white">
                  {feature.title}
                </Title>
                <Text size="sm" c="dimmed" className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </Text>
              </Card>
            );
          })}
        </SimpleGrid>
      </Container>
    </div>
  );
}

