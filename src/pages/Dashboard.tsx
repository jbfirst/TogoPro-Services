import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../lib/AuthContext";
import { CATEGORIES, NEIGHBORHOODS, type Provider } from "../lib/constants";

export function Dashboard() {
  const { user } = useAuth();

  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);


  useEffect(() => {
    async function loadProvider() {
      if (!user) return;

      const { data, error } = await supabase
        .from("providers")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.log(error);
      }

      if (data) {
        setProvider(data);
      } else {
        setProvider(null);
      }

      setLoading(false);
    }

    loadProvider();
  }, [user]);

  function update<K extends keyof Provider>(key: K, value: Provider[K]) {
    if (!provider) return;
    setProvider({ ...provider, [key]: value });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!provider) return;
    setSaving(true);
    setSaved(false);
    const { error } = await supabase
      .from("providers")
      .update({
        full_name: provider.full_name,
        category_id: provider.category_id,
        neighborhood: provider.neighborhood,
        phone: provider.phone,
        description: provider.description,
        rate_info: provider.rate_info,
      })
      .eq("id", provider.id);
    setSaving(false);
    if (!error) setSaved(true);
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !provider || !user) return;
    setUploading(true);

    // Nettoie le nom du fichier : enlève les accents et remplace tout ce qui n'est
    // pas alphanumérique par un tiret. Supabase Storage refuse certains caractères
    // spéciaux/accentués dans les noms de fichiers (erreur "File name is invalid").
    const extension = file.name.split(".").pop() ?? "jpg";
    const safeName = file.name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // enlève les accents
      .replace(/[^a-zA-Z0-9.]/g, "-")
      .toLowerCase();
    const path = `${user.id}/${Date.now()}-${safeName || `photo.${extension}`}`;

    const { error: uploadError } = await supabase.storage
      .from("provider-photos")
      .upload(path, file);

    if (uploadError) {
      setUploading(false);
      alert("Échec de l'envoi de la photo. Vérifiez que le bucket 'provider-photos' existe.");
      return;
    }

    const { data: urlData } = supabase.storage.from("provider-photos").getPublicUrl(path);
    const newUrls = [...provider.photo_urls, urlData.publicUrl];

    const { error: updateError } = await supabase
      .from("providers")
      .update({ photo_urls: newUrls })
      .eq("id", provider.id);

    setUploading(false);
    if (!updateError) {
      setProvider({ ...provider, photo_urls: newUrls });
    }
  }

  if (loading) return <p className="py-24 text-center text-ink-soft">Chargement…</p>;

  if (!provider) {
    return <CreateProviderProfile onCreated={(p) => setProvider(p)} />;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 md:px-8">
      <h1 className="text-2xl font-bold text-ink">Mon tableau de bord</h1>

      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-card border border-sand bg-white p-4">
        <StatusPill status={provider.status} />
        <p className="text-sm text-ink-soft">{provider.view_count} vues de profil</p>
      </div>

      <form onSubmit={handleSave} className="mt-6 space-y-4 rounded-card border border-sand bg-white p-5">
        <Field label="Nom complet / Nom de l'activité">
          <input
            type="text"
            value={provider.full_name}
            onChange={(e) => update("full_name", e.target.value)}
            className="input"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Catégorie">
            <select
              value={provider.category_id}
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
              value={provider.neighborhood}
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

        <Field label="Numéro WhatsApp">
          <input
            type="tel"
            value={provider.phone}
            onChange={(e) => update("phone", e.target.value)}
            className="input"
          />
        </Field>

        <Field label="Description">
          <textarea
            rows={4}
            value={provider.description}
            onChange={(e) => update("description", e.target.value)}
            className="input"
          />
        </Field>

        <Field label="Tarif indicatif">
          <input
            type="text"
            value={provider.rate_info}
            onChange={(e) => update("rate_info", e.target.value)}
            className="input"
          />
        </Field>

        <Field label="Photos">
          <div className="flex flex-wrap gap-3">
            {provider.photo_urls.map((url) => (
              <img key={url} src={url} className="h-20 w-20 rounded-control object-cover" />
            ))}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            disabled={uploading}
            className="mt-2 text-sm"
          />
          {uploading && <p className="mt-1 text-xs text-ink-soft">Envoi en cours…</p>}
        </Field>

        {saved && <p className="text-sm text-green">Fiche mise à jour !</p>}

        <button
          type="submit"
          disabled={saving}
          className="rounded-control bg-terracotta px-5 py-3 text-sm font-semibold text-white hover:bg-terracotta-dark disabled:opacity-60"
        >
          {saving ? "Enregistrement…" : "Enregistrer les modifications"}
        </button>
      </form>
    </div>
  );
}

function CreateProviderProfile({ onCreated }: { onCreated: (p: Provider) => void }) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    full_name: "",
    category_id: CATEGORIES[0].id as string,
    neighborhood: NEIGHBORHOODS[0] as string,
    phone: "",
    description: "",
    rate_info: "",
  });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError("");
    const { data, error } = await supabase
      .from("providers")
      .insert({ ...form, user_id: user.id, status: "pending" })
      .select()
      .single();
    setSaving(false);
    if (error || !data) {
      setError("Impossible de créer la fiche. Réessayez.");
      return;
    }
    onCreated(data as Provider);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16 md:px-8">
      <h1 className="text-xl font-bold text-ink">Complétez votre fiche prestataire</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Votre compte est connecté. Il manque juste les infos de votre activité.
      </p>
      <form onSubmit={handleCreate} className="mt-6 space-y-4">
        <input
          type="text"
          required
          placeholder="Nom complet / Nom de l'activité"
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          className="input"
        />
        <select
          value={form.category_id}
          onChange={(e) => setForm({ ...form, category_id: e.target.value })}
          className="input"
        >
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          value={form.neighborhood}
          onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
          className="input"
        >
          {NEIGHBORHOODS.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <input
          type="tel"
          required
          placeholder="Numéro WhatsApp"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="input"
        />
        <textarea
          rows={3}
          placeholder="Description de vos services"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="input"
        />
        {error && <p className="text-sm text-danger">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-control bg-terracotta px-5 py-3 text-sm font-semibold text-white hover:bg-terracotta-dark disabled:opacity-60"
        >
          {saving ? "Création…" : "Créer ma fiche"}
        </button>
      </form>
    </div>
  );
}

function StatusPill({ status }: { status: Provider["status"] }) {
  const map = {
    pending: { text: "En attente de validation", cls: "bg-ocre/20 text-terracotta-dark" },
    approved: { text: "Publiée", cls: "bg-green/10 text-green" },
    rejected: { text: "Refusée", cls: "bg-danger/10 text-danger" },
  } as const;
  const s = map[status];
  return (
    <span className={`rounded-pill px-3 py-1 text-xs font-semibold ${s.cls}`}>{s.text}</span>
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
