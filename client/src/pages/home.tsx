import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { KeywordInput } from "@/components/home/keyword-input";
import { CategorySelect } from "@/components/home/category-select";
import { translations, type Language } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [category, setCategory] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Get language from localStorage or default to "en"
  const language = (localStorage.getItem("preferred-language") as Language) || "en";

  const handleAddKeyword = (keyword: string) => {
    if (keywords.length < 5) {
      setKeywords([...keywords, keyword]);
    }
  };

  const handleRemoveKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (keywords.length < 3 || keywords.length > 5) {
      toast({
        variant: "destructive",
        title: translations[language].errors.keywords,
      });
      return;
    }

    if (!category) {
      toast({
        variant: "destructive",
        title: translations[language].errors.category,
      });
      return;
    }

    const params = new URLSearchParams({
      keywords: keywords.join(","),
      category,
      language,
    });
    setLocation(`/results?${params.toString()}`);
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="w-full max-w-3xl space-y-8">
        <div className="text-center pt-16">
          <h1 className="text-3xl font-extrabold text-gray-800 dark:text-white mb-2">
            {translations[language].title}
          </h1>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          <KeywordInput
            keywords={keywords}
            onAdd={handleAddKeyword}
            onRemove={handleRemoveKeyword}
            language={language}
          />

          <CategorySelect
            value={category}
            onChange={setCategory}
            language={language}
          />

          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              className="rounded-full bg-blue-600 text-white hover:shadow-md transition-all duration-200 hover:bg-blue-700"
            >
              {translations[language].generate}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}