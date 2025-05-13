import { Button } from "@heroui/react";
import { Moon, Sun } from "lucide-react";
import {useTheme} from "next-themes";
import { useEffect, useState } from "react";

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if(!mounted) return null

  return (
    <div>
      <Button variant="ghost" isIconOnly onPress={() => theme === "light" ? setTheme("dark") : setTheme("light")}>
        {theme === "blurple-light" ? <Moon /> : <Sun />}
      </Button>
    </div>
  )
};