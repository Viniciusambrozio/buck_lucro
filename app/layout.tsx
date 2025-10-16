import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TwentyFirstToolbar } from "@21st-extension/toolbar-next";
import { ReactPlugin } from "@21st-extension/react";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "BuckPay - Sistema de Cálculo de Lucro",
  description: "Sistema profissional para cálculo e registro de lucro operacional da BuckPay",
  icons: {
    icon: '/logo-buck.svg',
    shortcut: '/logo-buck.svg',
    apple: '/logo-buck.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          {/* Toolbar da 21st.dev - erros no console são esperados e parte do mecanismo de descoberta */}
          <TwentyFirstToolbar
            config={{
              plugins: [ReactPlugin],
            }}
            enabled={process.env.NODE_ENV === 'development'}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
