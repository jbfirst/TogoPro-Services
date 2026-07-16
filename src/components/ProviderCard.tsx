import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import type { Provider } from "../lib/constants";
import { categoryLabel } from "../lib/constants";
import { CategoryIcon, } from "./CategoryIcon";
import { VerifiedBadge, PremiumBadge } from "./Badges";

export function ProviderCard({ provider, rating }: { provider: Provider; rating?: number }) {
  const category = categoryLabel(provider.category_id);
  const cat = provider.category_id;

  return (
    <Link
      to={`/prestataires/${provider.id}`}
      className="group flex flex-col gap-3 rounded-card border border-sand bg-white p-5 shadow-soft transition-transform hover:-translate-y-1"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-terracotta/10 text-terracotta">
            {provider.photo_urls[0] ? (
              <img
                src={provider.photo_urls[0]}
                alt={provider.full_name}
                className="h-11 w-11 rounded-full object-cover"
              />
            ) : (
              <CategoryIcon name={CATEGORY_ICON[cat] ?? "Wrench"} size={20} />
            )}
          </span>
          <div>
            <p className="font-semibold text-ink group-hover:text-terracotta">
              {provider.full_name}
            </p>
            <p className="text-xs text-ink-soft">{category}</p>
          </div>
        </div>
        {provider.is_premium && <PremiumBadge />}
      </div>

      <p className="flex items-center gap-1 text-sm text-ink-soft">
        <MapPin size={14} /> {provider.neighborhood}
      </p>

      {provider.rate_info && (
        <p className="text-sm font-medium text-terracotta">{provider.rate_info}</p>
      )}

      <div className="mt-auto flex items-center justify-between pt-2">
        {provider.is_verified ? <VerifiedBadge /> : <span />}
        {rating !== undefined && rating > 0 && (
          <span className="text-xs text-ink-soft">★ {rating.toFixed(1)}</span>
        )}
      </div>
    </Link>
  );
}

const CATEGORY_ICON: Record<string, string> = {
  plomberie: "Wrench",
  electricite: "Zap",
  beaute: "Scissors",
  traiteur: "ChefHat",
  mecanique: "Car",
  menage: "Sparkles",
  maconnerie: "HardHat",
  menuiserie: "Hammer",
  couture: "Shirt",
  informatique: "Laptop",
};
