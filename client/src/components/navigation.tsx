import { Link, useLocation } from "wouter";
import { Home, LayoutDashboard } from "lucide-react";
import { Button } from "./ui/button";

export function Navigation() {
  const [location] = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <a className="text-xl font-semibold">
            Brand Name Generator
          </a>
        </Link>

        <div className="flex items-center gap-4">
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
