import { Link, useLocation } from "wouter";
import { Home, LayoutDashboard, Globe, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { useState, useEffect } from "react";
import { type Language, translations } from "@/lib/i18n";

export function Navigation() {
  const [location] = useLocation();
  const storedLanguage = localStorage.getItem("preferred-language") as Language;
  const [language, setLanguage] = useState<Language>(storedLanguage || "en");

  const handleLanguageChange = (value: Language) => {
    setLanguage(value);
    localStorage.setItem("preferred-language", value);
    window.location.reload();
  };

  const NavigationItems = () => (
    <>
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
    </>
  );

  const LanguageSelector = () => (
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
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <span className="text-xl font-semibold">
            Brand Name Generator
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          <NavigationItems />
          <LanguageSelector />
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col gap-4 mt-8">
                <NavigationItems />
                <div className="pt-4 border-t">
                  <LanguageSelector />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}