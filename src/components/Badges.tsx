import { CheckCircle2, Star } from "lucide-react";

export function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-pill bg-green/10 px-3 py-1 text-xs font-semibold text-green">
      <CheckCircle2 size={14} /> Vérifié
    </span>
  );
}

export function PremiumBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-pill bg-gradient-to-r from-ocre to-gold px-3 py-1 text-xs font-semibold text-white">
      <Star size={14} className="fill-white" /> Premium
    </span>
  );
}
