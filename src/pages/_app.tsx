import "@/styles/globals.css";
import { HeroUIProvider } from "@heroui/react";
import type { AppProps } from "next/app";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Fraunces, Space_Grotesk } from "next/font/google";
import Head from "next/head";

const displayFont = Fraunces({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
});
const bodyFont = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
      <HeroUIProvider>
        <NextThemesProvider attribute="class" defaultTheme="dark" themes={["dark", "light"]}>
          <div className={`${displayFont.variable} ${bodyFont.variable} min-h-screen`}>
            <Head>
              <title>Magic Vision</title>
            </Head>
            <Component {...pageProps} />
          </div>
        </NextThemesProvider>
      </HeroUIProvider>
  )
}
