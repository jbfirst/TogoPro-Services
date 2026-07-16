import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { CATEGORIES, NEIGHBORHOODS } from "../lib/constants";

export function BecomeProvider() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"form" | "success">("form");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGoogleSignUp() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/tableau-de-bord` },
    });
  }

  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    category_id: CATEGORIES[0].id as string,
    neighborhood: NEIGHBORHOODS[0] as string,
    phone: "",
    description: "",
    rate_info: "",
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // 1. Créer le compte
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (signUpError || !signUpData.user) {
      setLoading(false);
      setError(signUpError?.message === "User already registered"
        ? "Un compte existe déjà avec cet email. Connectez-vous plutôt."
        : "Impossible de créer le compte. Vérifiez vos informations.");
      return;
    }

    // 2. Créer la fiche prestataire liée à ce compte
    const { error: insertError } = await supabase.from("providers").insert({
      user_id: signUpData.user.id,
      full_name: form.full_name,
      category_id: form.category_id,
      neighborhood: form.neighborhood,
      phone: form.phone,
      description: form.description,
      rate_info: form.rate_info,
      status: "pending",
    });

    setLoading(false);

    if (insertError) {
      setError("Compte créé, mais la fiche n'a pas pu être enregistrée. Contactez-nous.");
      return;
    }

    setStep("success");
  }

  if (step === "success") {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center md:px-8">
        <h1 className="text-2xl font-bold text-ink">Fiche envoyée !</h1>
        <p className="mt-3 text-ink-soft">
          Votre compte a été créé et votre fiche est en attente de validation. Notre équipe la
          vérifie sous 24-48h, puis elle apparaîtra publiquement sur le site.
        </p>
        <button
          onClick={() => navigate("/connexion")}
          className="mt-6 rounded-control bg-terracotta px-6 py-3 text-sm font-semibold text-white hover:bg-terracotta-dark"
        >
          Aller à la connexion
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 md:px-8">
      <h1 className="text-2xl font-bold text-ink md:text-3xl">Faites-vous connaître, gratuitement</h1>
      <p className="mt-2 text-ink-soft">
        Vous êtes plombier, électricien, coiffeuse, traiteur ou artisan à Lomé ? Créez votre fiche
        en quelques minutes et soyez visible auprès de centaines de clients potentiels dans votre
        quartier.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <StepItem n={1} text="Créez votre compte et remplissez votre fiche" />
        <StepItem n={2} text="Notre équipe valide votre profil sous 24-48h" />
        <StepItem n={3} text="Recevez des contacts directement, sans commission" />
      </div>

      <div className="mt-8 grid gap-4 rounded-card border border-sand bg-white p-5 sm:grid-cols-2">
        <div className="rounded-control border border-sand p-4">
          <p className="font-semibold text-ink">Basique — Gratuit</p>
          <p className="mt-1 text-sm text-ink-soft">Fiche visible, contact WhatsApp direct.</p>
        </div>
        <div className="rounded-control border-2 border-gold p-4">
          <p className="font-semibold text-ink">Premium — 3 000 FCFA/mois</p>
          <p className="mt-1 text-sm text-ink-soft">
            Badge Vérifié mis en avant, apparition en tête de liste.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <button
          type="button"
          onClick={handleGoogleSignUp}
          className="flex w-full items-center justify-center gap-2 rounded-control border border-sand bg-white px-5 py-3 text-sm font-semibold text-ink hover:bg-sand"
        >
          Continuer avec Google
        </button>
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-sand" />
          <span className="text-xs text-ink-soft">ou avec votre email</span>
          <div className="h-px flex-1 bg-sand" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email">
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Mot de passe">
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              className="input"
            />
          </Field>
        </div>

        <Field label="Nom complet / Nom de l'activité">
          <input
            type="text"
            required
            value={form.full_name}
            onChange={(e) => update("full_name", e.target.value)}
            className="input"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Catégorie de service">
            <select
              value={form.category_id}
              onChange={(e) => update("category_id", e.target.value)}
              className="input"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Quartier">
            <select
              value={form.neighborhood}
              onChange={(e) => update("neighborhood", e.target.value)}
              className="input"
            >
              {NEIGHBORHOODS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Numéro WhatsApp (avec indicatif, ex: 22890000000)">
          <input
            type="tel"
            required
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            className="input"
          />
        </Field>

        <Field label="Description de vos services">
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            className="input"
          />
        </Field>

        <Field label="Tarif indicatif (facultatif)">
          <input
            type="text"
            placeholder="Ex: À partir de 2000 FCFA"
            value={form.rate_info}
            onChange={(e) => update("rate_info", e.target.value)}
            className="input"
          />
        </Field>

        {error && <p className="text-sm text-danger">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-control bg-terracotta px-5 py-3 text-sm font-semibold text-white hover:bg-terracotta-dark disabled:opacity-60"
        >
          {loading ? "Envoi…" : "Créer ma fiche gratuitement"}
        </button>
      </form>
    </div>
  );
}

function StepItem({ n, text }: { n: number; text: string }) {
  return (
    <div className="rounded-control bg-sand p-3 text-sm text-ink">
      <span className="mb-1 block font-bold text-terracotta">{n}</span>
      {text}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-ink">{label}</span>
      {children}
    </label>
  );
}
