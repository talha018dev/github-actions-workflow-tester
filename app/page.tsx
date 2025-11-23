import { Companies } from "@/features/companies/components/Companies";
import { Hero } from "@/features/hero/components/Hero";

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <Hero />
      <Companies />
    </main>
  );
}
