import "@/styles/globals.css";
import { HeroUIProvider } from "@heroui/react";
import type { AppProps } from "next/app";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" themes={["dark", "light"]}>
      <HeroUIProvider>
        <Component {...pageProps} />
      </HeroUIProvider>
    </NextThemesProvider>
  )
}
