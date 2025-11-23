import { Hero } from "@/features/hero/components/Hero";
import { Features } from "@/features/features/components/Features";
import { Stats } from "@/features/stats/components/Stats";
import { Contact } from "@/features/contact/components/Contact";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Stats />
      <Features />
      <Contact />
    </main>
  );
}

