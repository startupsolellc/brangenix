import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { translations } from "@/lib/i18n";

interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
  language: keyof typeof translations;
}

export function CategorySelect({ value, onChange, language }: CategorySelectProps) {
  const categories = translations[language].categories;

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={translations[language].categoryLabel} />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(categories).map(([key, label]) => (
          <SelectItem key={key} value={key}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
