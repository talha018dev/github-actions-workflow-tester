"use client";

import { Card, Text, Avatar, Group, SimpleGrid } from "@mantine/core";
import { IconPointer } from "@tabler/icons-react";

export function GridShowcase() {
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Abstract decoration */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-50 dark:bg-indigo-950/30 rounded-full blur-3xl opacity-50 pointer-events-none" />
      
      <div className="grid grid-cols-2 gap-4">
        {/* Column 1 */}
        <div className="space-y-4">
          <Group gap="xs" className="justify-center sm:justify-start mb-2">
            {["avatar1.png", "avatar2.png", "avatar3.png", "avatar4.png", "avatar5.png"].map((_, i) => (
              <Avatar key={i} radius="xl" size="sm" src={null} color="indigo" className="border-2 border-white dark:border-gray-800">
                {i + 1}
              </Avatar>
            ))}
          </Group>

          <Card radius="lg" className="bg-gray-900 dark:bg-gray-800 text-white h-64 flex flex-col justify-center items-center relative overflow-hidden group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Text className="font-bold text-2xl z-10 text-white">Hover it</Text>
            <div className="absolute bottom-4 left-4 right-4">
              <Text size="xs" className="text-gray-300 dark:text-gray-400">Beautify your website within minutes</Text>
            </div>
          </Card>

          <Card radius="lg" className="bg-indigo-950 dark:bg-indigo-900 text-white h-64 flex flex-col justify-center items-center relative overflow-hidden">
            <IconPointer size={48} className="mb-4 text-indigo-400" />
            <Text className="font-bold text-xl">Hover over me</Text>
          </Card>
          
          <Card radius="lg" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4">
             <Text size="sm" fw={500} className="text-gray-900 dark:text-white">Build</Text>
             <Text size="xs" className="text-gray-600 dark:text-gray-400">websites with Aceternity UI</Text>
          </Card>
        </div>

        {/* Column 2 */}
        <div className="space-y-4 pt-8">
          <Card radius="lg" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
            <Text size="sm" fw={700} className="mb-2 text-gray-900 dark:text-white">Build world class websites</Text>
            <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded mb-2" />
            <div className="h-2 w-2/3 bg-gray-100 dark:bg-gray-700 rounded" />
          </Card>

          <div className="grid grid-cols-3 gap-2">
             {[...Array(9)].map((_, i) => (
               <div key={i} className="aspect-square bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-100 dark:border-gray-700" />
             ))}
          </div>

          <Card radius="lg" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 h-64 flex flex-col justify-center items-center text-center p-6 relative overflow-hidden">
             {/* Simulated particles */}
             {[...Array(6)].map((_, i) => (
               <div 
                 key={i}
                 className="absolute w-1 h-1 rounded-full bg-indigo-400 dark:bg-indigo-500"
                 style={{
                   top: `${Math.random() * 100}%`,
                   left: `${Math.random() * 100}%`,
                 }}
               />
             ))}
             <Text size="sm" className="text-gray-700 dark:text-gray-300">Copy paste and be done with it.</Text>
          </Card>
        </div>
      </div>
    </div>
  );
}

