import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { BrandCard } from "@/components/results/brand-card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { generateNames } from "@/lib/openai";
import { translations, type Language } from "@/lib/i18n";

export default function Results() {
  const [, setLocation] = useLocation();
  const [cooldown, setCooldown] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();

  const searchParams = new URLSearchParams(window.location.search);
  const keywords = searchParams.get("keywords")?.split(",") || [];
  const category = searchParams.get("category") || "";
  const language = (searchParams.get("language") || "en") as Language;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["/api/generate-names", keywords.join(","), category, language, Date.now()],
    queryFn: () => generateNames({ keywords, category, language }),
    cacheTime: 0,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  const handleGenerateNew = async () => {
    if (cooldown) return;

    setCooldown(true);
    setIsGenerating(true);

    // Önce cache'i temizle
    await queryClient.invalidateQueries({ queryKey: ["/api/generate-names"] });

    // Yeni isimler üret
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
    <div className="min-h-screen gradient-bg">
      <div className="pt-24 px-4 md:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <h1 className="title text-center">
            {translations[language].title}
          </h1>

          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => setLocation("/")}
              className="rounded-full hover:shadow-md transition-all duration-200"
            >
              {translations[language].createNew}
            </Button>

            <Button
              onClick={handleGenerateNew}
              disabled={cooldown}
              className="rounded-full bg-blue-600 text-white hover:shadow-md transition-all duration-200 hover:bg-blue-700"
            >
              {translations[language].generateNew}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data?.names?.map((name, index) => (
              <BrandCard key={`${name}-${index}-${Date.now()}`} name={name} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}