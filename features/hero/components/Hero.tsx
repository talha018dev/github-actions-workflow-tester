"use client";

import { Badge, Button, Container, Group, Text, Title } from "@mantine/core";
import { GridShowcase } from "./GridShowcase";

export function Hero() {
  return (
    <section className="bg-white dark:bg-gray-900 pt-10 pb-20 md:pt-20 md:pb-32 overflow-hidden transition-colors">
      <Container size="xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 relative z-10">
            <Badge variant="light" color="gray" size="lg" radius="sm" className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-normal normal-case pl-1 pr-3 py-4 h-auto">
              <span className="mr-2 bg-white dark:bg-gray-700 px-2 py-0.5 rounded-sm border border-gray-200 dark:border-gray-600 text-xs font-bold text-gray-900 dark:text-white">New</span>
              Introducing Nodus Agent Template &rsaquo;
            </Badge>
            
            <Title
              className="text-5xl sm:text-6xl md:text-7xl font-bold text-gray-900 dark:text-white tracking-tight leading-[1.1]"
            >
              Make your <br />
              websites look <br />
              <span className="inline-flex items-baseline">
                10x
                <span className="ml-3 px-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white">modern</span>
              </span>
            </Title>
            
            <Text
              size="xl"
              className="text-gray-700 dark:text-gray-300 max-w-lg leading-relaxed"
            >
              Copy paste the most trending components and use them in your
              websites without having to worry about styling and animations.
            </Text>
            
            <Group gap="md">
              <Button
                size="xl"
                color="dark"
                radius="md"
                className="bg-gray-900 dark:bg-white hover:bg-black dark:hover:bg-gray-100 text-white dark:text-gray-900 px-8 h-14 text-base font-medium transition-colors"
              >
                Browse Components
              </Button>
              <Button
                size="xl"
                variant="default"
                radius="md"
                className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 px-8 h-14 text-base font-medium transition-colors"
              >
                Custom Components
              </Button>
            </Group>
          </div>

          {/* Right Grid Showcase */}
          <div className="relative">
             <GridShowcase />
          </div>
        </div>
      </Container>
    </section>
  );
}
