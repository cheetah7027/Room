import type { Metadata } from "next";
import localFont from "next/font/local";
import { IconProvider } from "@/components/providers/IconProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import "./globals.css";

const funnelDisplay = localFont({
  src: [
    {
      path: "../../public/fonts/FunnelDisplay-VariableFont_wght.ttf",
      style: "normal",
    },
  ],
  variable: "--font-funnel-display",
  display: "swap",
});

const forum = localFont({
  src: [
    {
      path: "../../public/fonts/Forum-Regular.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-forum",
  display: "swap",
});

const fredoka = localFont({
  src: [
    {
      path: "../../public/fonts/Fredoka-VariableFont_wdth,wght.ttf",
      style: "normal",
    },
  ],
  variable: "--font-fredoka",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ROOM — Operating System for Brand Experiences & Creator Relationships",
  description:
    "B2B SaaS platform for brands and event agencies to discover relevant creators, manage guest relationships, organise events, automate invitations, coordinate attendance and measure marketing impact.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`h-full ${funnelDisplay.variable} ${forum.variable} ${fredoka.variable}`}
    >
      <body className="min-h-full flex flex-col bg-canvas text-ink antialiased">
        <AuthProvider>
          <IconProvider>{children}</IconProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
