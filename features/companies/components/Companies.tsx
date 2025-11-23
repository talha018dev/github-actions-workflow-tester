"use client";

import { Container, Text, SimpleGrid } from "@mantine/core";
import { 
  IconBrandGoogle, 
  IconBrandWindows, 
  IconBrandZapier, 
  IconBrandStripe, 
  IconBrandNetflix,
  IconBrandVercel
} from "@tabler/icons-react";

export function Companies() {
  return (
    <section className="py-12 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 transition-colors">
      <Container size="xl">
        <Text className="text-center text-gray-700 dark:text-gray-300 mb-8 text-lg">
          Used by companies and people working at
        </Text>
        
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70 dark:opacity-80 grayscale hover:grayscale-0 transition-all duration-500">
           {/* Using Tabler icons as placeholders for logos */}
           <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
             <IconBrandGoogle size={28} />
             <span className="font-bold text-xl">Google</span>
           </div>
           
           <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
             <IconBrandWindows size={28} />
             <span className="font-bold text-xl">Microsoft</span>
           </div>
           
           <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
             <span className="font-bold text-xl">CISCO</span>
           </div>

           <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
             <span className="font-bold text-xl italic">zomato</span>
           </div>

           <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
             <span className="font-bold text-xl">BETTER-AUTH.</span>
           </div>

           <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
             <IconBrandZapier size={28} />
             <span className="font-bold text-xl">greatfrontend</span>
           </div>

           <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
             <IconBrandStripe size={28} />
             <span className="font-bold text-xl">strapi</span>
           </div>

           <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
             <IconBrandVercel size={28} />
             <span className="font-bold text-xl">NEON</span>
           </div>
        </div>
      </Container>
    </section>
  );
}

