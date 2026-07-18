import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "./supabaseClient";

export type Category = { id: string; label: string; icon: string };
export type Neighborhood = { id: string; label: string };

type CatalogContextType = {
  categories: Category[];
  neighborhoods: Neighborhood[];
  loading: boolean;
  refresh: () => void;
  categoryLabel: (id: string) => string;
};

const CatalogContext = createContext<CatalogContextType>({
  categories: [],
  neighborhoods: [],
  loading: true,
  refresh: () => {},
  categoryLabel: (id) => id,
});

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    Promise.all([
      supabase.from("categories").select("*").order("label"),
      supabase.from("neighborhoods").select("*").order("label"),
    ]).then(([catRes, neighRes]) => {
      setCategories(catRes.data ?? []);
      setNeighborhoods(neighRes.data ?? []);
      setLoading(false);
    });
  }

  useEffect(() => {
    load();
  }, []);

  function categoryLabel(id: string) {
    return categories.find((c) => c.id === id)?.label ?? id;
  }

  return (
    <CatalogContext.Provider
      value={{ categories, neighborhoods, loading, refresh: load, categoryLabel }}
    >
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  return useContext(CatalogContext);
}
