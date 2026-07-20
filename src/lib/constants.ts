// Les catégories et quartiers ne sont plus codés en dur ici : ils viennent maintenant
// de la base de données (tables `categories` et `neighborhoods`), gérables depuis
// l'interface Admin. Voir src/lib/CatalogContext.tsx.

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
  latitude: number | null;
  longitude: number | null;
  is_verified: boolean;
  is_premium: boolean;
  premium_until: string | null;
  status: "pending" | "approved" | "rejected" | "blocked";
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

export type ProviderItem = {
  id: string;
  provider_id: string;
  title: string;
  description: string;
  price_info: string;
  photo_url: string | null;
  created_at: string;
};
