import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { translations } from "@/lib/i18n";

const schema = z.object({
  keyword: z.string().min(1),
});

interface KeywordInputProps {
  keywords: string[];
  onAdd: (keyword: string) => void;
  onRemove: (index: number) => void;
  language: keyof typeof translations;
}

export function KeywordInput({ keywords, onAdd, onRemove, language }: KeywordInputProps) {
  const { register, handleSubmit, reset } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: { keyword: string }) => {
    if (keywords.length < 5) {
      onAdd(data.keyword);
      reset();
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
        <Input
          {...register("keyword")}
          placeholder={translations[language].keywordsPlaceholder}
          className="flex-1"
        />
      </form>
      <div className="flex flex-wrap gap-2">
        {keywords.map((keyword, index) => (
          <div
            key={index}
            className="flex items-center gap-1 bg-white rounded-full px-3 py-1"
          >
            <span>{keyword}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0"
              onClick={() => onRemove(index)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
