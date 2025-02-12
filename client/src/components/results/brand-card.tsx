import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// Önceden seçilmiş Google Fontlar
const FONTS = [
  'Roboto',
  'Open Sans',
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

  useEffect(() => {
    // Fontları yükle
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
    <Card className="w-full">
      <CardContent className="p-6 space-y-4">
        <h3 
          className="text-3xl text-center break-words"
          style={{ 
            color, 
            fontFamily: font || 'system-ui'
          }}
        >
          {name}
        </h3>
        <Input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-full h-8"
        />
      </CardContent>
    </Card>
  );
}