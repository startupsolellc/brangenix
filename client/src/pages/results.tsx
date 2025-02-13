import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { BrandCard } from "@/components/results/brand-card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { generateNames } from "@/lib/openai";
import { translations, type Language } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { useGenerations } from "@/hooks/use-generations";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export default function Results() {
  const [, setLocation] = useLocation();
  const [cooldown, setCooldown] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { guestToken, isOverLimit, trackGeneration, GUEST_LIMIT, guestGenerations } = useGenerations();

  const searchParams = new URLSearchParams(window.location.search);
  const keywords = searchParams.get("keywords")?.split(",") || [];
  const category = searchParams.get("category") || "";
  const language = (searchParams.get("language") || "en") as Language;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/generate-names", keywords.join(","), category, language],
    queryFn: async () => {
      const response = await generateNames({ keywords, category, language });

      // Track generation for guest users
      if (guestToken) {
        trackGeneration();
      }

      return response;
    },
    retry: 2,
    retryDelay: 2000,
    gcTime: 0,
    refetchOnWindowFocus: false
  });

  useEffect(() => {
    // Only show limit dialog if user has actually exceeded the limit
    // and has made at least one generation
    if (isOverLimit && !showLimitDialog && guestGenerations > 0 && guestGenerations >= GUEST_LIMIT) {
      setShowLimitDialog(true);
    }
  }, [isOverLimit, showLimitDialog, guestGenerations, GUEST_LIMIT]);

  useEffect(() => {
    if (error) {
      console.error("Generation error:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";

      if (errorMessage.includes("GUEST_TOKEN_MISSING") || errorMessage.includes("UPGRADE_REQUIRED")) {
        setShowLimitDialog(true);
        return;
      }

      toast({
        variant: "destructive",
        title: translations[language].errors.generation,
        description: errorMessage
      });
    }
  }, [error, language, toast]);

  const handleGenerateNew = async () => {
    if (cooldown || isOverLimit) return;

    setCooldown(true);
    setIsGenerating(true);

    try {
      await queryClient.invalidateQueries({ queryKey: ["/api/generate-names"] });
      await refetch();
    } catch (error) {
      console.error("Failed to generate new names:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate new names";

      toast({
        variant: "destructive",
        title: translations[language].errors.generation,
        description: errorMessage
      });
    } finally {
      setTimeout(() => {
        setCooldown(false);
        setIsGenerating(false);
      }, 5000);
    }
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
      <div className="pt-32 px-4 md:px-8">
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
              disabled={cooldown || isOverLimit}
              className="rounded-full bg-blue-600 text-white hover:shadow-md transition-all duration-200 hover:bg-blue-700"
            >
              {translations[language].generateNew}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data?.names?.map((name) => (
              <BrandCard
                key={`${name}-${Date.now()}-${Math.random()}`}
                name={name}
              />
            ))}
          </div>
        </div>
      </div>

      <AlertDialog open={showLimitDialog} onOpenChange={setShowLimitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {guestToken ? "Free Generations Limit Reached" : "Generation Credits Used"}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                {guestToken ? (
                  <>
                    <div>You have used all {GUEST_LIMIT} free generations available to guest users.</div>
                    <div>Sign in to get more free credits or upgrade to premium for unlimited generations!</div>
                  </>
                ) : (
                  <>
                    <div>You have used all your available generation credits.</div>
                    <div>Upgrade to premium to unlock unlimited brand name generations and more premium features!</div>
                  </>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                setShowLimitDialog(false);
                setLocation("/coming-soon");
              }}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}