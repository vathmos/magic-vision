import { ThemeSwitcher } from "@/components/ThemeSwitch";
import { useTheme } from "next-themes";
import Image from "next/image";

export default function Home() {
  const { theme } = useTheme()
  return (
    <>
      <div className="flex flex-col h-screen w-screen items-center justify-center">
        <ThemeSwitcher></ThemeSwitcher>
        <Image src="/magic-vision.svg" alt="magic vision icon" width={400} height={0} className={theme === "light" ? "invert-0" : "invert"}/>
        <h1 className="text-8xl">COMING SOON!</h1>
      </div>
    </>
  );
}
