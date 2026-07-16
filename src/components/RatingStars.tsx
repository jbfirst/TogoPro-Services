import { Star } from "lucide-react";

export function RatingStars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Note : ${rating} sur 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          className={n <= Math.round(rating) ? "fill-gold text-gold" : "fill-none text-ink-soft/30"}
        />
      ))}
    </div>
  );
}
