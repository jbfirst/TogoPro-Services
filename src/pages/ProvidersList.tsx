import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, MapPin } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { type Provider } from "../lib/constants";
import { useCatalog } from "../lib/CatalogContext";
import { ProviderCard } from "../components/ProviderCard";
import { useDocumentTitle } from "../lib/useDocumentTitle";

export function ProvidersList() {
  useDocumentTitle(
    "Trouver un prestataire",
    "Parcourez tous les prestataires de services vérifiés à Lomé par catégorie et quartier."
  );
  const { categories, neighborhoods } = useCatalog();
  const [params, setParams] = useSearchParams();
  const category = params.get("categorie") ?? "";
  const neighborhood = params.get("quartier") ?? "";
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "rating" | "distance">("recent");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");

  const [providers, setProviders] = useState<Provider[]>([]);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    let query = supabase.from("providers").select("*").eq("status", "approved");
    if (category) query = query.eq("category_id", category);
    if (neighborhood) query = query.eq("neighborhood", neighborhood);

    query
      .order("is_premium", { ascending: false })
      .order("created_at", { ascending: false })
      .then(async ({ data, error }) => {
        if (error) {
          console.error(error);
          setProviders([]);
          setLoading(false);
          return;
        }
        setProviders(data ?? []);
        setLoading(false);

        if (data && data.length > 0) {
          const { data: reviewData } = await supabase
            .from("reviews")
            .select("provider_id, rating")
            .in(
              "provider_id",
              data.map((p) => p.id)
            );
          const grouped: Record<string, number[]> = {};
          (reviewData ?? []).forEach((r) => {
            grouped[r.provider_id] = grouped[r.provider_id] ?? [];
            grouped[r.provider_id].push(r.rating);
          });
          const avg: Record<string, number> = {};
          Object.entries(grouped).forEach(([id, list]) => {
            avg[id] = list.reduce((a, b) => a + b, 0) / list.length;
          });
          setRatings(avg);
        }
      });
  }, [category, neighborhood]);

  function handleLocateMe() {
    if (!navigator.geolocation) {
      setLocationError("La géolocalisation n'est pas disponible sur cet appareil.");
      return;
    }
    setLocating(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setSortBy("distance");
        setLocating(false);
      },
      () => {
        setLocationError("Localisation refusée ou indisponible.");
        setLocating(false);
      }
    );
  }

  function distanceKm(lat: number, lng: number) {
    if (!userLocation) return null;
    const R = 6371;
    const dLat = ((lat - userLocation.lat) * Math.PI) / 180;
    const dLng = ((lng - userLocation.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((userLocation.lat * Math.PI) / 180) *
        Math.cos((lat * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  }

  const filteredProviders = search.trim()
    ? providers.filter((p) => p.full_name.toLowerCase().includes(search.trim().toLowerCase()))
    : providers;

  const sortedProviders = [...filteredProviders].sort((a, b) => {
    if (sortBy === "rating") {
      return (ratings[b.id] ?? 0) - (ratings[a.id] ?? 0);
    }
    if (sortBy === "distance" && userLocation) {
      const da = a.latitude && a.longitude ? distanceKm(a.latitude, a.longitude) ?? Infinity : Infinity;
      const db = b.latitude && b.longitude ? distanceKm(b.latitude, b.longitude) ?? Infinity : Infinity;
      return da - db;
    }
    return 0; // garde l'ordre déjà trié par premium/date venant de la requête
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <h1 className="text-2xl font-bold text-ink md:text-3xl">Trouver un prestataire</h1>

      <div className="mt-6 flex flex-wrap gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input
            type="text"
            placeholder="Rechercher un nom…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-control border border-sand bg-white py-2 pl-9 pr-3 text-sm text-ink"
          />
        </div>
        <select
          value={category}
          onChange={(e) => updateParam("categorie", e.target.value)}
          className="rounded-control border border-sand bg-white px-3 py-2 text-sm text-ink"
        >
          <option value="">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          value={neighborhood}
          onChange={(e) => updateParam("quartier", e.target.value)}
          className="rounded-control border border-sand bg-white px-3 py-2 text-sm text-ink"
        >
          <option value="">Tous les quartiers</option>
          {neighborhoods.map((n) => (
            <option key={n.id} value={n.label}>
              {n.label}
            </option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="rounded-control border border-sand bg-white px-3 py-2 text-sm text-ink"
        >
          <option value="recent">Plus récents</option>
          <option value="rating">Mieux notés</option>
          {userLocation && <option value="distance">Plus proches</option>}
        </select>
        <button
          onClick={handleLocateMe}
          disabled={locating}
          className="flex items-center gap-1.5 rounded-control border border-sand bg-white px-3 py-2 text-sm text-ink hover:bg-sand disabled:opacity-60"
        >
          <MapPin size={15} />
          {locating ? "Localisation…" : userLocation ? "Position activée ✓" : "Près de moi"}
        </button>
      </div>
      {locationError && <p className="mt-2 text-xs text-danger">{locationError}</p>}

      {loading ? (
        <p className="mt-10 text-center text-ink-soft">Chargement des prestataires…</p>
      ) : sortedProviders.length === 0 ? (
        <div className="mt-10 rounded-card border border-dashed border-sand bg-white p-10 text-center">
          <p className="font-medium text-ink">Aucun prestataire trouvé pour ce filtre</p>
          <p className="mt-1 text-sm text-ink-soft">
            Essayez une autre catégorie, un autre quartier, ou un autre nom.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sortedProviders.map((p) => (
            <ProviderCard
              key={p.id}
              provider={p}
              rating={ratings[p.id]}
              distanceKm={
                userLocation && p.latitude && p.longitude
                  ? distanceKm(p.latitude, p.longitude) ?? undefined
                  : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
