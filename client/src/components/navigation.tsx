import { Link, useLocation } from "wouter";
import { Home, LayoutDashboard, Globe } from "lucide-react";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useState } from "react";
import { type Language, translations } from "@/lib/i18n";

export function Navigation() {
  const [location] = useLocation();
  const [language, setLanguage] = useState<Language>("en");

  const handleLanguageChange = (value: Language) => {
    setLanguage(value);
    // Store language preference
    localStorage.setItem("preferred-language", value);
    // Reload the page to update all translations
    window.location.reload();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <a className="text-xl font-semibold">
            Brand Name Generator
          </a>
        </Link>

        <div className="flex items-center gap-4">
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  {language === "en" ? "English" : "Türkçe"}
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  English
                </div>
              </SelectItem>
              <SelectItem value="tr">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Türkçe
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <Link href="/">
            <Button
              variant={location === "/" ? "default" : "ghost"}
              size="sm"
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Home
            </Button>
          </Link>

          <Link href="/dashboard">
            <Button
              variant={location === "/dashboard" ? "default" : "ghost"}
              size="sm"
              className="flex items-center gap-2"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}