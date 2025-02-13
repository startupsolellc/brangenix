import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";
import { translations } from "@/lib/i18n";
import { categories, searchCategories, getCategoryById } from "@/lib/categories";

interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
  language: keyof typeof translations;
}

export function CategorySelect({ value, onChange, language }: CategorySelectProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCategories, setFilteredCategories] = useState(categories);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCategories(categories);
    } else {
      setFilteredCategories(searchCategories(searchQuery, language === "tr" ? "tr" : "en"));
    }
  }, [searchQuery, language]);

  // Get selected category and subcategory
  const getSelectedInfo = () => {
    if (!value) return null;

    const [categoryId, subCategoryId] = value.split('.');
    const category = categories.find(c => c.id === categoryId);
    if (!category) return null;

    const subcategory = subCategoryId 
      ? category.subcategories.find(s => s.id === subCategoryId)
      : null;

    return {
      category,
      subcategory
    };
  };

  const selectedInfo = getSelectedInfo();

  return (
    <div className="space-y-4">
      {/* Selected Categories Display */}
      {selectedInfo && (
        <div className="flex flex-wrap gap-2">
          <Badge 
            variant="secondary"
            className="flex items-center gap-1"
          >
            {language === "tr" ? selectedInfo.category.nameInTurkish : selectedInfo.category.name}
            <button
              onClick={() => onChange("")}
              className="ml-1 hover:bg-background/80 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
          {selectedInfo.subcategory && (
            <Badge 
              variant="secondary"
              className="flex items-center gap-1"
            >
              {language === "tr" ? selectedInfo.subcategory.nameInTurkish : selectedInfo.subcategory.name}
              <button
                onClick={() => onChange(selectedInfo.category.id)}
                className="ml-1 hover:bg-background/80 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={translations[language].searchCategories}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <ScrollArea className="h-[400px] rounded-md border">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {filteredCategories.map((category) => (
            <Card
              key={category.id}
              className={`
                cursor-pointer transition-all duration-200 
                hover:bg-gray-50/80 
                ${value.startsWith(category.id) ? "border-primary ring-2 ring-primary/20 bg-primary/5" : ""}
                min-h-[100px] flex flex-col
              `}
              onClick={() => onChange(category.id)}
            >
              <CardHeader className="flex-1 p-4">
                <h3 className="text-sm font-medium">
                  {language === "tr" ? category.nameInTurkish : category.name}
                </h3>
                {value.startsWith(category.id) && category.subcategories.length > 0 && (
                  <div className="mt-3 space-y-1.5 border-t pt-3">
                    {category.subcategories.map((sub) => (
                      <Button
                        key={sub.id}
                        variant="ghost"
                        size="sm"
                        className={`
                          w-full justify-start text-xs hover:bg-primary/10
                          ${value === `${category.id}.${sub.id}` ? 'bg-primary/5 text-primary font-medium' : ''}
                        `}
                        onClick={(e) => {
                          e.stopPropagation();
                          onChange(`${category.id}.${sub.id}`);
                        }}
                      >
                        {language === "tr" ? sub.nameInTurkish : sub.name}
                      </Button>
                    ))}
                  </div>
                )}
              </CardHeader>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}