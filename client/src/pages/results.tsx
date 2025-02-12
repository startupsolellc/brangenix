import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { BrandCard } from "@/components/results/brand-card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { generateNames } from "@/lib/openai";
import { translations, type Language } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";

export default function Results() {
  const [, setLocation] = useLocation();
  const [cooldown, setCooldown] = useState(false);
  const { toast } = useToast();
  
  const searchParams = new URLSearchParams(window.location.search);
  const keywords = searchParams.get("keywords")?.split(",") || [];
  const category = searchParams.get("category") || "";
  const language = (searchParams.get("language") || "en") as Language;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["/api/generate-names", keywords.join(","), category, language],
    queryFn: () => generateNames({ keywords, category, language }),
  });

  const handleGenerateNew = async () => {
    if (cooldown) return;
    
    setCooldown(true);
    await refetch();
    
    setTimeout(() => {
      setCooldown(false);
    }, 8000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#EFF3F9] flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner />
          <p className="font-montserrat">
            {translations[language].loading}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EFF3F9] p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => setLocation("/")}
          >
            {translations[language].createNew}
          </Button>
          
          <Button
            onClick={handleGenerateNew}
            disabled={cooldown}
          >
            {translations[language].generateNew}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {data?.names.map((name, index) => (
            <BrandCard key={index} name={name} />
          ))}
        </div>
      </div>
    </div>
  );
}
