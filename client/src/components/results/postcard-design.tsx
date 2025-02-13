import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Download } from "lucide-react";
import html2canvas from "html2canvas";

interface PostcardDesignProps {
  name: string;
  color: string;
  font: string;
}

export function PostcardDesign({ name, color, font }: PostcardDesignProps) {
  const handleDownload = async () => {
    const postcard = document.getElementById('postcard-design');
    if (!postcard) return;

    try {
      const canvas = await html2canvas(postcard);
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${name}-brand-postcard.png`;
      link.href = url;
      link.click();
    } catch (error) {
      console.error('Error generating postcard:', error);
    }
  };

  const handleShare = async () => {
    try {
      const postcard = document.getElementById('postcard-design');
      if (!postcard) return;

      const canvas = await html2canvas(postcard);
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob as Blob);
        }, 'image/png');
      });

      if (navigator.share) {
        const file = new File([blob], `${name}-brand-postcard.png`, { type: 'image/png' });
        await navigator.share({
          title: 'Brand Name Postcard',
          text: 'Check out this brand name design!',
          files: [file],
        });
      }
    } catch (error) {
      console.error('Error sharing postcard:', error);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card 
        id="postcard-design"
        className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 p-8"
      >
        <CardContent className="h-full flex items-center justify-center">
          <h2
            className="text-4xl break-words text-center"
            style={{
              color,
              fontFamily: font || 'system-ui',
              fontWeight: 'bold',
            }}
          >
            {name}
          </h2>
        </CardContent>
      </Card>

      <div className="flex justify-center gap-4 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="flex items-center gap-2"
        >
          <Share2 className="h-4 w-4" />
          Share
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download
        </Button>
      </div>
    </div>
  );
}
