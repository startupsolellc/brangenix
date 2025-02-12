import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface BrandCardProps {
  name: string;
}

export function BrandCard({ name }: BrandCardProps) {
  const [color, setColor] = useState("#000000");
  const [font, setFont] = useState("");

  useEffect(() => {
    // Load random Google Font
    fetch("https://www.googleapis.com/webfonts/v1/webfonts?key=YOUR_API_KEY")
      .then((res) => res.json())
      .then((data) => {
        const randomFont = data.items[Math.floor(Math.random() * data.items.length)];
        const fontFamily = randomFont.family;
        const fontUrl = randomFont.files.regular;
        
        const fontFace = new FontFace(fontFamily, `url(${fontUrl})`);
        fontFace.load().then(() => {
          document.fonts.add(fontFace);
          setFont(fontFamily);
        });
      });
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
