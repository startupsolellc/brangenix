import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Palette, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PostcardDesign } from "./postcard-design";
import { 
  Dialog, 
  DialogContent, 
  DialogTrigger,
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog";

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
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Her render'da yeni font seç
    const randomFont = FONTS[Math.floor(Math.random() * FONTS.length)];
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${randomFont.replace(' ', '+')}&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    setFont(randomFont);

    // Rastgele bir renk de seç
    const colors = ['#1a365d', '#2c5282', '#2b6cb0', '#3182ce', '#4299e1'];
    setColor(colors[Math.floor(Math.random() * colors.length)]);

    return () => {
      document.head.removeChild(link);
    };
  }, [name]); // name prop'u değiştiğinde yeniden render et

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setColor(e.target.value);
  };

  useEffect(() => {
    if (!showColorPicker) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        colorPickerRef.current && 
        !colorPickerRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowColorPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showColorPicker]);

  return (
    <Card className="w-full transform transition-all duration-200 hover:shadow-lg">
      <CardContent className="p-14 relative">
        <div className="absolute top-4 right-4 flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 p-0"
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogTitle>Share Brand Design</DialogTitle>
              <DialogDescription>
                Create a shareable postcard of your brand name design. You can download or share it directly.
              </DialogDescription>
              <PostcardDesign 
                name={name} 
                color={color}
                font={font}
              />
            </DialogContent>
          </Dialog>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                ref={buttonRef}
                variant="ghost"
                size="icon"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowColorPicker(!showColorPicker);
                }}
              >
                <Palette className="h-5 w-5" style={{ color }} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Change Color</p>
            </TooltipContent>
          </Tooltip>

          {showColorPicker && (
            <div 
              ref={colorPickerRef}
              className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg p-2 z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="color"
                value={color}
                onChange={handleColorChange}
                className="w-8 h-8 cursor-pointer rounded"
                onMouseDown={(e) => e.stopPropagation()}
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