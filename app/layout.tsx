import { FloatingChat } from "@/features/layout/components/FloatingChat";
import { Navbar } from "@/features/layout/components/Navbar";
import { MantineThemeSync } from "@/features/theme/components/MantineThemeSync";
import { ThemeProvider } from "@/features/theme/context/ThemeContext";
import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aceternity UI - Modern Components",
  description: "Copy paste the most trending components and use them in your websites.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <body className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
        <ThemeProvider>
          <MantineProvider defaultColorScheme="light">
            <MantineThemeSync />
            <Navbar />
            {children}
            {/* <FloatingChat /> */}
          </MantineProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

