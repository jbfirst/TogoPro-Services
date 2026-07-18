import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MessageCircle, MapPin } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { type Provider, type Review } from "../lib/constants";
import { useCatalog } from "../lib/CatalogContext";
import { VerifiedBadge, PremiumBadge } from "../components/Badges";
import { RatingStars } from "../components/RatingStars";
import { ProviderMap } from "../components/ProviderMap";

export function ProviderDetail() {
  const { categoryLabel } = useCatalog();
  const { id } = useParams();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ author_name: "", rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!id) return;
    supabase
      .from("providers")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        setProvider(data);
        setLoading(false);
      });
    loadReviews();
    // Incrémente discrètement le compteur de vues
    supabase.rpc("increment_provider_views", { p_id: id }).then(() => {});
  }, [id]);

  function loadReviews() {
    if (!id) return;
    supabase
      .from("reviews")
      .select("*")
      .eq("provider_id", id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setReviews(data ?? []));
  }

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    setSubmitting(true);
    const { error } = await supabase.from("reviews").insert({
      provider_id: id,
      author_name: reviewForm.author_name || "Client anonyme",
      rating: reviewForm.rating,
      comment: reviewForm.comment,
    });
    setSubmitting(false);
    if (!error) {
      setSubmitted(true);
      setReviewForm({ author_name: "", rating: 5, comment: "" });
      loadReviews();
    }
  }

  if (loading) {
    return <p className="py-24 text-center text-ink-soft">Chargement…</p>;
  }
  if (!provider) {
    return (
      <div className="py-24 text-center">
        <p className="font-medium text-ink">Cette fiche n'existe pas ou plus.</p>
        <Link to="/prestataires" className="mt-3 inline-block text-terracotta underline">
          Retour à la liste
        </Link>
      </div>
    );
  }

  const avgRating =
    reviews.length > 0 ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0;

  const whatsappUrl = `https://wa.me/${provider.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
    `Bonjour ${provider.full_name}, je vous ai trouvé sur TogoPro Services et je suis intéressé(e) par vos services.`
  )}`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-8">
      <div className="rounded-card border border-sand bg-white p-6 shadow-soft md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-ink">{provider.full_name}</h1>
              {provider.is_verified && <VerifiedBadge />}
              {provider.is_premium && <PremiumBadge />}
            </div>
            <p className="mt-1 text-ink-soft">{categoryLabel(provider.category_id)}</p>
            <p className="mt-1 flex items-center gap-1 text-sm text-ink-soft">
              <MapPin size={14} /> {provider.neighborhood}
            </p>
            {reviews.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <RatingStars rating={avgRating} />
                <span className="text-sm text-ink-soft">
                  {avgRating.toFixed(1)} ({reviews.length} avis)
                </span>
              </div>
            )}
          </div>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-control bg-green px-5 py-3 text-sm font-semibold text-white hover:bg-green-dark"
          >
            <MessageCircle size={18} /> Contacter sur WhatsApp
          </a>
        </div>

        {provider.photo_urls.length > 0 && (
          <div className="mt-6 flex gap-3 overflow-x-auto">
            {provider.photo_urls.map((url) => (
              <img
                key={url}
                src={url}
                alt={provider.full_name}
                className="h-40 w-40 flex-shrink-0 rounded-card object-cover"
              />
            ))}
          </div>
        )}

        <div className="mt-6 border-t border-sand pt-6">
          <h2 className="font-semibold text-ink">À propos</h2>
          <p className="mt-2 whitespace-pre-line text-sm text-ink-soft">
            {provider.description || "Aucune description fournie."}
          </p>
          {provider.rate_info && (
            <p className="mt-3 text-sm font-medium text-terracotta">{provider.rate_info}</p>
          )}
        </div>

        {provider.latitude && provider.longitude && (
          <div className="mt-6 border-t border-sand pt-6">
            <h2 className="mb-3 font-semibold text-ink">Localisation</h2>
            <ProviderMap
              latitude={provider.latitude}
              longitude={provider.longitude}
              name={provider.full_name}
            />
          </div>
        )}
      </div>

      {/* Avis */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-ink">Avis clients</h2>

        <div className="mt-4 space-y-4">
          {reviews.length === 0 && (
            <p className="text-sm text-ink-soft">Aucun avis pour l'instant. Soyez le premier !</p>
          )}
          {reviews.map((r) => (
            <div key={r.id} className="rounded-card border border-sand bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-ink">{r.author_name}</p>
                <RatingStars rating={r.rating} size={14} />
              </div>
              {r.comment && <p className="mt-1 text-sm text-ink-soft">{r.comment}</p>}
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-card border border-sand bg-white p-5">
          <h3 className="font-semibold text-ink">Laisser un avis</h3>
          {submitted ? (
            <p className="mt-3 text-sm text-green">Merci, votre avis a été publié !</p>
          ) : (
            <form onSubmit={handleReviewSubmit} className="mt-3 space-y-3">
              <input
                type="text"
                placeholder="Votre nom"
                value={reviewForm.author_name}
                onChange={(e) => setReviewForm({ ...reviewForm, author_name: e.target.value })}
                className="w-full rounded-control border border-sand px-3 py-2 text-sm"
              />
              <select
                value={reviewForm.rating}
                onChange={(e) =>
                  setReviewForm({ ...reviewForm, rating: Number(e.target.value) })
                }
                className="w-full rounded-control border border-sand px-3 py-2 text-sm"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} étoile{n > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
              <textarea
                placeholder="Votre commentaire (facultatif)"
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                className="w-full rounded-control border border-sand px-3 py-2 text-sm"
                rows={3}
              />
              <button
                type="submit"
                disabled={submitting}
                className="rounded-control bg-terracotta px-5 py-2 text-sm font-semibold text-white hover:bg-terracotta-dark disabled:opacity-60"
              >
                {submitting ? "Envoi…" : "Publier mon avis"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
