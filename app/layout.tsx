import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { MantineProvider, ColorSchemeScript } from "@mantine/core";
import "@mantine/core/styles.css";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Next.js + Mantine + Tailwind Demo",
  description: "A responsive demo app built with Next.js, Mantine, and Tailwind CSS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
      </head>
      <body className={inter.className}>
        <MantineProvider>
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}

