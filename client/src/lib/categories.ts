import { z } from "zod";

export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  nameInTurkish: z.string(),
  subcategories: z.array(z.object({
    id: z.string(),
    name: z.string(),
    nameInTurkish: z.string(),
  })),
});

export type Category = z.infer<typeof categorySchema>;

export const categories: Category[] = [
  {
    id: "ecommerce",
    name: "E-Commerce & Online Business",
    nameInTurkish: "E-Ticaret ve Online İşletme",
    subcategories: [
      { id: "dropshipping", name: "Dropshipping", nameInTurkish: "Dropshipping" },
      { id: "amazon", name: "Amazon FBA & Marketplace", nameInTurkish: "Amazon FBA ve Pazaryeri" },
      { id: "digital", name: "Digital Product Stores", nameInTurkish: "Dijital Ürün Mağazaları" },
      { id: "shopify", name: "E-Commerce Brands & Shopify", nameInTurkish: "E-Ticaret Markaları ve Shopify" },
    ],
  },
  {
    id: "finance",
    name: "Finance & Crypto",
    nameInTurkish: "Finans ve Kripto",
    subcategories: [
      { id: "fintech", name: "Fintech & Digital Banking", nameInTurkish: "Fintech ve Dijital Bankacılık" },
      { id: "crypto", name: "Crypto & Blockchain", nameInTurkish: "Kripto ve Blockchain" },
      { id: "investment", name: "Investment Platforms", nameInTurkish: "Yatırım Platformları" },
      { id: "payment", name: "Payment Systems", nameInTurkish: "Ödeme Sistemleri" },
    ],
  },
  {
    id: "health",
    name: "Fitness & Health",
    nameInTurkish: "Spor ve Sağlık",
    subcategories: [
      { id: "fitness", name: "Fitness & Gym", nameInTurkish: "Fitness ve Spor Salonu" },
      { id: "sports", name: "Sportswear & Equipment", nameInTurkish: "Spor Giyim ve Ekipman" },
      { id: "nutrition", name: "Health Supplements", nameInTurkish: "Sağlık Takviyeleri" },
      { id: "coaching", name: "Online Coaching", nameInTurkish: "Online Koçluk" },
    ],
  },
  {
    id: "education",
    name: "Education & E-Learning",
    nameInTurkish: "Eğitim ve E-Öğrenme",
    subcategories: [
      { id: "courses", name: "Online Course Platforms", nameInTurkish: "Online Kurs Platformları" },
      { id: "academic", name: "Academic Institutions", nameInTurkish: "Akademik Kurumlar" },
      { id: "coding", name: "Coding & Technical Training", nameInTurkish: "Kodlama ve Teknik Eğitim" },
      { id: "career", name: "Career & Personal Development", nameInTurkish: "Kariyer ve Kişisel Gelişim" },
    ],
  },
  {
    id: "gaming",
    name: "Gaming & Entertainment",
    nameInTurkish: "Oyun ve Eğlence",
    subcategories: [
      { id: "studios", name: "Indie Game Studios", nameInTurkish: "Bağımsız Oyun Stüdyoları" },
      { id: "esports", name: "Esports Teams & Communities", nameInTurkish: "E-Spor Takımları ve Toplulukları" },
      { id: "content", name: "Content Creators", nameInTurkish: "İçerik Üreticileri" },
      { id: "streaming", name: "Music & Streaming Platforms", nameInTurkish: "Müzik ve Yayın Platformları" },
    ],
  },
  // ... Additional categories will be added in the next iteration
];

export function getCategoryById(id: string): Category | undefined {
  return categories.find(category => category.id === id);
}

export function searchCategories(query: string, language: "en" | "tr"): Category[] {
  const searchTerm = query.toLowerCase();
  return categories.filter(category => {
    const categoryName = language === "en" ? category.name : category.nameInTurkish;
    return categoryName.toLowerCase().includes(searchTerm) ||
      category.subcategories.some(sub => 
        (language === "en" ? sub.name : sub.nameInTurkish)
        .toLowerCase()
        .includes(searchTerm)
      );
  });
}