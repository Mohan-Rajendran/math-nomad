import type { Metadata } from "next";
import "katex/dist/katex.min.css";
import "./globals.css";
import { SiteShell } from "./components/SiteShell";
import { isLabSite, siteOrigin } from "./site-mode";

/* eslint-disable @next/next/no-page-custom-font */

const siteDescription = isLabSite
  ? "Interactive mathematics organised into connected Math Nomad project hubs."
  : "Articles, notes and interactive investigations that make mathematical ideas visible without sanding away their depth.";

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  applicationName: isLabSite ? "Math Nomad Lab" : "Math Nomad",
  title: {
    default: isLabSite
      ? "Math Nomad Lab — Interactive mathematics"
      : "Math Nomad — Mathematics worth returning to",
    template: isLabSite ? "%s · Math Nomad Lab" : "%s · Math Nomad",
  },
  description: siteDescription,
  authors: [{ name: "Mohan Rajendran" }],
  creator: "Mohan Rajendran",
  publisher: "Math Nomad",
  alternates: isLabSite
    ? undefined
    : {
        types: {
          "application/rss+xml": "/feed.xml",
        },
      },
  icons: {
    icon: "/mathnomad-logo.png",
    shortcut: "/mathnomad-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;500;600;650&family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600&family=STIX+Two+Math&display=swap" rel="stylesheet" />
      </head>
      <body><SiteShell>{children}</SiteShell></body>
    </html>
  );
}
