import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import Provider from "./provider";
import { ThemeProvider } from "next-themes";
import { ENABLE_APP_DARK_MODE } from "./constants/const";
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const outfitMono = Outfit({
  variable: "--font-outfit-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Siteon - Keep building",
  description: "Ship faster than light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={outfit.className}>
          {ENABLE_APP_DARK_MODE ? (
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
              <Provider>
                {children}
                <Toaster position="top-center" />
              </Provider>
            </ThemeProvider>
          ) : (
            <Provider>
              {children}
              <Toaster position="top-center" />
            </Provider>
          )}
        </body>
      </html>
    </ClerkProvider>
  );  
}
