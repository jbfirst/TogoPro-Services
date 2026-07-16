import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, MessageCircle, ShieldCheck, Search } from "lucide-react";
import { CATEGORIES, NEIGHBORHOODS } from "../lib/constants";
import { CategoryIcon } from "../components/CategoryIcon";

export function Home() {
  const navigate = useNavigate();
  const [category, setCategory] = useState("");
  const [neighborhood, setNeighborhood] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (category) params.set("categorie", category);
    if (neighborhood) params.set("quartier", neighborhood);
    navigate(`/prestataires?${params.toString()}`);
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-ocre-light/60 to-cream px-4 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-3xl text-center animate-fade-up">
          <h1 className="text-3xl font-bold leading-tight text-ink md:text-5xl">
            Trouvez le bon prestataire,{" "}
            <span className="text-terracotta">près de chez vous</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-ink-soft md:text-lg">
            Plombiers, électriciens, coiffeuses, traiteurs... Des professionnels vérifiés dans
            votre quartier, à un clic de contact.
          </p>

          <form
            onSubmit={handleSearch}
            className="mx-auto mt-8 flex max-w-xl flex-col gap-3 rounded-card bg-white p-3 shadow-soft md:flex-row"
          >
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex-1 rounded-control border border-sand px-3 py-3 text-sm text-ink"
            >
              <option value="">Quel service ?</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
            <select
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              className="flex-1 rounded-control border border-sand px-3 py-3 text-sm text-ink"
            >
              <option value="">Quel quartier ?</option>
              {NEIGHBORHOODS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-control bg-terracotta px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-terracotta-dark"
            >
              <Search size={16} /> Rechercher
            </button>
          </form>
        </div>
      </section>

      <div className="stripe-divider" />

      {/* Réassurance */}
      <section className="mx-auto max-w-6xl px-4 py-14 md:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          <ReassuranceItem
            icon={<ShieldCheck size={22} />}
            title="Prestataires vérifiés"
            text="Chaque fiche est validée avant publication."
          />
          <ReassuranceItem
            icon={<CheckCircle2 size={22} />}
            title="Avis vérifiés"
            text="Des avis laissés par d'autres clients, en toute transparence."
          />
          <ReassuranceItem
            icon={<MessageCircle size={22} />}
            title="Contact direct"
            text="Écrivez directement sur WhatsApp, sans intermédiaire."
          />
        </div>
      </section>

      {/* Catégories */}
      <section className="mx-auto max-w-6xl px-4 pb-20 md:px-8">
        <h2 className="mb-6 text-2xl font-bold text-ink">Parcourir par catégorie</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => navigate(`/prestataires?categorie=${c.id}`)}
              className="flex flex-col items-center gap-3 rounded-card border border-sand bg-white p-6 text-center shadow-soft transition-transform hover:-translate-y-1 hover:border-terracotta"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-terracotta/10 text-terracotta">
                <CategoryIcon name={c.icon} size={22} />
              </span>
              <span className="text-sm font-medium text-ink">{c.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* CTA prestataire */}
      <section className="bg-green px-4 py-14 text-center text-white md:px-8">
        <h2 className="text-2xl font-bold md:text-3xl">Vous êtes artisan ou prestataire ?</h2>
        <p className="mx-auto mt-2 max-w-lg text-white/90">
          Créez votre fiche gratuitement et faites-vous connaître auprès de centaines de clients à
          Lomé.
        </p>
        <button
          onClick={() => navigate("/devenir-prestataire")}
          className="mt-6 rounded-control bg-white px-6 py-3 text-sm font-semibold text-green hover:bg-cream"
        >
          Créer ma fiche gratuitement
        </button>
      </section>
    </div>
  );
}

function ReassuranceItem({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-green/10 text-green">
        {icon}
      </span>
      <p className="font-semibold text-ink">{title}</p>
      <p className="text-sm text-ink-soft">{text}</p>
    </div>
  );
}
