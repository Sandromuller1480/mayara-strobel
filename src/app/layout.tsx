import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mayara Strobel Make Up | Beleza para aprender e celebrar",
  description:
    "Aprenda maquiagem no seu ritmo, viva experiências presenciais e celebre os momentos especiais com Mayara Strobel.",
  applicationName: "Mayara Strobel Make Up",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Mayara Make Up",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
