import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader } from "@/components/ui/card";
import { Search } from "lucide-react";
import { translations } from "@/lib/i18n";
import { categories, searchCategories } from "@/lib/categories";

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

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={translations[language].searchCategories}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <ScrollArea className="h-[400px] rounded-md border"> {/* Increased height */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {filteredCategories.map((category) => (
            <Card
              key={category.id}
              className={`cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                value === category.id ? "border-primary ring-2 ring-primary/20" : ""
              }`}
              onClick={() => onChange(category.id)}
            >
              <CardHeader className="p-4"> {/* Adjusted padding */}
                <h3 className="text-sm font-medium">
                  {language === "tr" ? category.nameInTurkish : category.name}
                </h3>
                {value === category.id && category.subcategories.length > 0 && (
                  <div className="mt-3 space-y-1 border-t pt-2"> {/* Added border and padding */}
                    {category.subcategories.map((sub) => (
                      <Button
                        key={sub.id}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-xs hover:bg-gray-100"
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