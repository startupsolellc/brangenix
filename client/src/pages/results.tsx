import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { BrandCard } from "@/components/results/brand-card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { generateNames } from "@/lib/openai";
import { translations, type Language } from "@/lib/i18n";

export default function Results() {
  const [, setLocation] = useLocation();
  const [cooldown, setCooldown] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

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
    setIsGenerating(true);

    await refetch();

    setTimeout(() => {
      setCooldown(false);
      setIsGenerating(false);
    }, 8000);
  };

  if (isLoading || isGenerating) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="loading-container">
          <p className="loading-text">
            {translations[language].loading}
          </p>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg px-4 py-8">
      <div className="max-w-[1200px] mx-auto space-y-8">
        <h1 className="text-4xl font-jost font-bold text-center mb-8">
          {translations[language].title}
        </h1>

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
            <div key={index} className="aspect-[4/3] w-full">
              <BrandCard name={name} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}