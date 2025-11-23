"use client";

import { ThemeToggle } from "@/features/theme/components/ThemeToggle";
import { Burger, Container, Group, TextInput } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconSearch } from "@tabler/icons-react";

const links = [
  { link: "/components", label: "Components" },
  { link: "/templates", label: "Templates" },
  { link: "/pricing", label: "Pricing" },
  { link: "/showcase", label: "Showcase" },
];

export function Navbar() {
  const [opened, { toggle }] = useDisclosure(false);

  return (
    <header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-50">
      <Container size="xl" className="h-full">
        <div className="flex h-full items-center justify-between">
          <div className="flex items-center gap-8">
            <a href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900 dark:text-white">
              <div className="w-6 h-6 bg-black dark:bg-white rounded-md flex items-center justify-center text-white dark:text-black text-xs">
                A
              </div>
              Aceternity UI
            </a>

            <Group gap={5} visibleFrom="sm" className="hidden md:flex">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.link}
                  className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </Group>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer">
              <span>Playground</span>
            </div>
            
            <div className="hidden sm:flex">
              <TextInput
                placeholder="Search Components"
                leftSection={<IconSearch size={14} />}
                rightSection={<span className="text-xs text-gray-600 dark:text-gray-400 border dark:border-gray-600 rounded px-1">⌘K</span>}
                size="xs"
                radius="md"
                className="[&_input]:bg-gray-100 [&_input]:text-gray-900 [&_input]:placeholder:text-gray-600 dark:[&_input]:bg-gray-800 dark:[&_input]:text-white dark:[&_input]:placeholder:text-gray-400"
                styles={{ 
                  input: { 
                    border: 'none',
                  }
                }}
              />
            </div>
            
            <ThemeToggle />
            
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" className="dark:text-white" />
          </div>
        </div>
      </Container>
    </header>
  );
}

