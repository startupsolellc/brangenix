export const translations = {
  en: {
    title: "Brand Name Generator",
    keywordsPlaceholder: "Enter keywords (3-5 required)",
    categoryLabel: "Select Category",
    categories: {
      software: "Software",
      trade: "Trade",
      fashion: "Fashion",
      food: "Food & Beverage",
      tech: "Technology",
      health: "Healthcare",
    },
    generate: "Generate Names",
    createNew: "↩ Create New Names",
    generateNew: "🔄 Generate New",
    loading: "Generating names, please wait",
    errors: {
      keywords: "Please enter between 3-5 keywords",
      category: "Please select a category",
      generation: "Error generating names. Please try again.",
    },
  },
  tr: {
    title: "Marka İsmi Üretici",
    keywordsPlaceholder: "Anahtar kelimeler girin (3-5 gerekli)",
    categoryLabel: "Kategori Seçin",
    categories: {
      software: "Yazılım",
      trade: "Ticaret",
      fashion: "Moda",
      food: "Yiyecek & İçecek",
      tech: "Teknoloji",
      health: "Sağlık",
    },
    generate: "İsim Üret",
    createNew: "↩ Yeni İsim Oluştur",
    generateNew: "🔄 Yeniden Üret",
    loading: "İsimler üretiliyor, lütfen bekleyiniz",
    errors: {
      keywords: "Lütfen 3-5 anahtar kelime girin",
      category: "Lütfen bir kategori seçin",
      generation: "İsim üretirken hata oluştu. Lütfen tekrar deneyin.",
    },
  },
};

export type Language = keyof typeof translations;