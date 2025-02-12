import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";

// Pre-selected Google Fonts
const FONTS = [
  'Montserrat',
  'Playfair Display',
  'Raleway',
  'Oswald',
  'Pacifico',
  'Ubuntu',
  'Quicksand',
  'Poppins'
];

interface BrandCardProps {
  name: string;
}

export function BrandCard({ name }: BrandCardProps) {
  const [color, setColor] = useState("#000000");
  const [font, setFont] = useState("");
  const [showColorPicker, setShowColorPicker] = useState(false);

  useEffect(() => {
    // Load fonts
    const randomFont = FONTS[Math.floor(Math.random() * FONTS.length)];
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${randomFont.replace(' ', '+')}&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    setFont(randomFont);

    // Cleanup
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <Card className="w-full transform transition-all duration-200 hover:shadow-lg">
      <CardContent className="p-6 relative">
        <div className="absolute top-4 right-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 p-0"
                onClick={() => setShowColorPicker(!showColorPicker)}
              >
                <Palette className="h-5 w-5" style={{ color }} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Change Color</p>
            </TooltipContent>
          </Tooltip>

          {showColorPicker && (
            <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg p-2 z-50">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-8 h-8 cursor-pointer rounded"
              />
            </div>
          )}
        </div>

        <h3 
          className="text-3xl text-center break-words mt-4"
          style={{ 
            color, 
            fontFamily: font || 'system-ui',
            fontWeight: 'bold'
          }}
        >
          {name}
        </h3>
      </CardContent>
    </Card>
  );
}