import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "@/components/session-provider";
import { SidebarMenu } from "@/components/layout/sidebar-menu";
import { Header } from "@/components/layout/header";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Passflow - Корпоративный менеджер паролей",
  description: "Безопасное и удобное управление корпоративными паролями с end-to-end шифрованием",
  keywords: ["менеджер паролей", "безопасность", "корпоративный", "шифрование", "Passflow"],
  authors: [{ name: "Passflow Team" }],
  openGraph: {
    title: "Passflow - Корпоративный менеджер паролей",
    description: "Безопасное и удобное управление корпоративными паролями",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Passflow - Корпоративный менеджер паролей",
    description: "Безопасное и удобное управление корпоративными паролями",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            {children}
            <Toaster />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
