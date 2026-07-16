export const CATEGORIES = [
  { id: "plomberie", label: "Plomberie", icon: "Wrench" },
  { id: "electricite", label: "Électricité", icon: "Zap" },
  { id: "beaute", label: "Beauté & Coiffure", icon: "Scissors" },
  { id: "traiteur", label: "Traiteur & Cuisine", icon: "ChefHat" },
  { id: "mecanique", label: "Mécanique auto/moto", icon: "Car" },
  { id: "menage", label: "Ménage & Nettoyage", icon: "Sparkles" },
  { id: "maconnerie", label: "Maçonnerie & Rénovation", icon: "HardHat" },
  { id: "menuiserie", label: "Menuiserie & Ébénisterie", icon: "Hammer" },
  { id: "couture", label: "Couture & Stylisme", icon: "Shirt" },
  { id: "informatique", label: "Informatique & Digital", icon: "Laptop" },
] as const;

export const NEIGHBORHOODS = [
  "Bè",
  "Adidogomé",
  "Agoè",
  "Tokoin",
  "Kodjoviakopé",
  "Nyékonakpoè",
  "Hédzranawoé",
  "Djidjolé",
] as const;

export type Provider = {
  id: string;
  user_id: string;
  full_name: string;
  category_id: string;
  neighborhood: string;
  phone: string;
  description: string;
  rate_info: string;
  photo_urls: string[];
  is_verified: boolean;
  is_premium: boolean;
  status: "pending" | "approved" | "rejected";
  view_count: number;
  created_at: string;
};

export type Review = {
  id: string;
  provider_id: string;
  author_name: string;
  rating: number;
  comment: string;
  created_at: string;
};

export function categoryLabel(id: string) {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}
