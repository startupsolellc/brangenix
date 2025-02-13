import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Construction } from "lucide-react";

export default function ComingSoonPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-lg mx-4">
        <CardHeader className="text-center">
          <Construction className="w-12 h-12 mx-auto text-primary mb-4" />
          <CardTitle className="text-3xl">Premium Features Coming Soon!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center text-muted-foreground">
            <p className="mb-4">
              We're working hard to bring you premium features, including:
            </p>
            <ul className="space-y-2">
              <li>✨ Unlimited name generations</li>
              <li>✨ Advanced brand analytics</li>
              <li>✨ Priority support</li>
              <li>✨ Custom export formats</li>
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <Button
              onClick={() => setLocation("/")}
              variant="outline"
              className="w-full"
            >
              Return to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
