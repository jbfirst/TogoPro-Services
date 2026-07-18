import { useEffect, useState } from "react";
import { Trash2, Plus, Ban, CheckCircle2 } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { type Provider } from "../lib/constants";
import { useCatalog } from "../lib/CatalogContext";

type Tab = "fiches" | "categories" | "quartiers";

export function Admin() {
  const [tab, setTab] = useState<Tab>("fiches");

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-8">
      <h1 className="text-2xl font-bold text-ink">Administration</h1>

      <div className="mt-6 flex gap-2">
        <TabButton active={tab === "fiches"} onClick={() => setTab("fiches")}>
          Fiches prestataires
        </TabButton>
        <TabButton active={tab === "categories"} onClick={() => setTab("categories")}>
          Catégories
        </TabButton>
        <TabButton active={tab === "quartiers"} onClick={() => setTab("quartiers")}>
          Quartiers
        </TabButton>
      </div>

      {tab === "fiches" && <FichesTab />}
      {tab === "categories" && <CategoriesTab />}
      {tab === "quartiers" && <NeighborhoodsTab />}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-pill px-4 py-1.5 text-sm font-medium ${
        active ? "bg-terracotta text-white" : "bg-sand text-ink"
      }`}
    >
      {children}
    </button>
  );
}

// =========================================================
// Onglet Fiches prestataires
// =========================================================
function FichesTab() {
  const { categoryLabel } = useCatalog();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "blocked" | "all">(
    "pending"
  );

  useEffect(() => {
    load();
  }, [filter]);

  function load() {
    setLoading(true);
    let query = supabase.from("providers").select("*").order("created_at", { ascending: false });
    if (filter !== "all") query = query.eq("status", filter);
    query.then(({ data }) => {
      setProviders(data ?? []);
      setLoading(false);
    });
  }

  async function updateStatus(id: string, status: Provider["status"]) {
    await supabase.from("providers").update({ status }).eq("id", id);
    load();
  }

  async function toggleVerified(id: string, current: boolean) {
    await supabase.from("providers").update({ is_verified: !current }).eq("id", id);
    load();
  }

  async function activatePremium(id: string, days: number) {
    const until = new Date();
    until.setDate(until.getDate() + days);
    await supabase
      .from("providers")
      .update({ is_premium: true, premium_until: until.toISOString().slice(0, 10) })
      .eq("id", id);
    load();
  }

  async function cancelPremium(id: string) {
    await supabase
      .from("providers")
      .update({ is_premium: false, premium_until: null })
      .eq("id", id);
    load();
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Supprimer définitivement la fiche de "${name}" ? Cette action est irréversible.`))
      return;
    await supabase.from("providers").delete().eq("id", id);
    load();
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <div className="mt-6 flex flex-wrap gap-2">
        {(["pending", "approved", "rejected", "blocked", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-pill px-4 py-1.5 text-sm font-medium ${
              filter === f ? "bg-ink text-white" : "bg-sand text-ink"
            }`}
          >
            {f === "pending"
              ? "En attente"
              : f === "approved"
              ? "Approuvées"
              : f === "rejected"
              ? "Refusées"
              : f === "blocked"
              ? "Bloquées"
              : "Toutes"}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="mt-10 text-center text-ink-soft">Chargement…</p>
      ) : providers.length === 0 ? (
        <p className="mt-10 text-center text-ink-soft">Rien à afficher ici.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {providers.map((p) => {
            const premiumExpired =
              p.is_premium && p.premium_until !== null && p.premium_until < today;
            return (
              <div key={p.id} className="rounded-card border border-sand bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">{p.full_name}</p>
                    <p className="text-sm text-ink-soft">
                      {categoryLabel(p.category_id)} · {p.neighborhood} · {p.phone}
                    </p>
                    <p className="mt-1 text-sm text-ink-soft">{p.description}</p>
                    {p.is_premium && (
                      <p
                        className={`mt-1 text-xs font-semibold ${
                          premiumExpired ? "text-danger" : "text-gold"
                        }`}
                      >
                        {premiumExpired
                          ? `Premium expiré le ${p.premium_until}`
                          : `Premium jusqu'au ${p.premium_until ?? "—"}`}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {p.status === "pending" && (
                      <>
                        <button
                          onClick={() => updateStatus(p.id, "approved")}
                          className="rounded-control bg-green px-3 py-1.5 text-xs font-semibold text-white"
                        >
                          Approuver
                        </button>
                        <button
                          onClick={() => updateStatus(p.id, "rejected")}
                          className="rounded-control bg-danger px-3 py-1.5 text-xs font-semibold text-white"
                        >
                          Refuser
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => toggleVerified(p.id, p.is_verified)}
                      className={`rounded-control px-3 py-1.5 text-xs font-semibold ${
                        p.is_verified ? "bg-green text-white" : "border border-green text-green"
                      }`}
                    >
                      {p.is_verified ? "Vérifié ✓" : "Marquer vérifié"}
                    </button>

                    {p.is_premium ? (
                      <button
                        onClick={() => cancelPremium(p.id)}
                        className="rounded-control border border-gold px-3 py-1.5 text-xs font-semibold text-gold"
                      >
                        Retirer Premium
                      </button>
                    ) : (
                      <button
                        onClick={() => activatePremium(p.id, 30)}
                        className="rounded-control bg-gold px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        Activer Premium (30j)
                      </button>
                    )}

                    {p.status === "blocked" ? (
                      <button
                        onClick={() => updateStatus(p.id, "approved")}
                        className="flex items-center gap-1 rounded-control border border-green px-3 py-1.5 text-xs font-semibold text-green"
                      >
                        <CheckCircle2 size={14} /> Débloquer
                      </button>
                    ) : (
                      <button
                        onClick={() => updateStatus(p.id, "blocked")}
                        className="flex items-center gap-1 rounded-control border border-danger px-3 py-1.5 text-xs font-semibold text-danger"
                      >
                        <Ban size={14} /> Bloquer
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(p.id, p.full_name)}
                      className="flex items-center gap-1 rounded-control bg-ink px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      <Trash2 size={14} /> Supprimer
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

// =========================================================
// Onglet Catégories
// =========================================================
function CategoriesTab() {
  const { categories, refresh } = useCatalog();
  const [newCat, setNewCat] = useState({ id: "", label: "", icon: "Wrench" });
  const [error, setError] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!newCat.id || !newCat.label) return;
    const { error } = await supabase.from("categories").insert(newCat);
    if (error) {
      setError(error.message);
      return;
    }
    setNewCat({ id: "", label: "", icon: "Wrench" });
    refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm(`Supprimer la catégorie "${id}" ? Impossible si des fiches l'utilisent encore.`))
      return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      alert(
        "Impossible de supprimer : des fiches prestataires utilisent encore cette catégorie."
      );
      return;
    }
    refresh();
  }

  return (
    <div className="mt-6">
      <div className="space-y-2">
        {categories.map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between rounded-card border border-sand bg-white p-3"
          >
            <div>
              <p className="font-medium text-ink">{c.label}</p>
              <p className="text-xs text-ink-soft">
                id: {c.id} · icône: {c.icon}
              </p>
            </div>
            <button
              onClick={() => handleDelete(c.id)}
              className="flex items-center gap-1 rounded-control border border-danger px-3 py-1.5 text-xs font-semibold text-danger"
            >
              <Trash2 size={14} /> Supprimer
            </button>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleAdd}
        className="mt-6 flex flex-wrap items-end gap-3 rounded-card border border-sand bg-white p-4"
      >
        <div>
          <label className="mb-1 block text-xs font-medium text-ink">
            Identifiant (sans accent/espace)
          </label>
          <input
            value={newCat.id}
            onChange={(e) => setNewCat({ ...newCat, id: e.target.value })}
            placeholder="jardinage"
            className="input"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink">Nom affiché</label>
          <input
            value={newCat.label}
            onChange={(e) => setNewCat({ ...newCat, label: e.target.value })}
            placeholder="Jardinage & Espaces verts"
            className="input"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink">
            Icône (nom Lucide, ex: Wrench)
          </label>
          <input
            value={newCat.icon}
            onChange={(e) => setNewCat({ ...newCat, icon: e.target.value })}
            placeholder="Wrench"
            className="input"
          />
        </div>
        <button
          type="submit"
          className="flex items-center gap-1 rounded-control bg-terracotta px-4 py-2 text-sm font-semibold text-white"
        >
          <Plus size={16} /> Ajouter
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
      <p className="mt-2 text-xs text-ink-soft">
        Note : si l'icône choisie n'est pas déjà utilisée ailleurs sur le site, il faut aussi
        l'ajouter dans <code>src/components/CategoryIcon.tsx</code> (import Lucide). Sinon
        l'icône par défaut (clé à molette) s'affichera à la place.
      </p>
    </div>
  );
}

// =========================================================
// Onglet Quartiers
// =========================================================
function NeighborhoodsTab() {
  const { neighborhoods, refresh } = useCatalog();
  const [newNeigh, setNewNeigh] = useState({ id: "", label: "" });
  const [error, setError] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!newNeigh.id || !newNeigh.label) return;
    const { error } = await supabase.from("neighborhoods").insert(newNeigh);
    if (error) {
      setError(error.message);
      return;
    }
    setNewNeigh({ id: "", label: "" });
    refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm(`Supprimer ce quartier ?`)) return;
    const { error } = await supabase.from("neighborhoods").delete().eq("id", id);
    if (error) {
      alert(error.message);
      return;
    }
    refresh();
  }

  return (
    <div className="mt-6">
      <div className="space-y-2">
        {neighborhoods.map((n) => (
          <div
            key={n.id}
            className="flex items-center justify-between rounded-card border border-sand bg-white p-3"
          >
            <p className="font-medium text-ink">{n.label}</p>
            <button
              onClick={() => handleDelete(n.id)}
              className="flex items-center gap-1 rounded-control border border-danger px-3 py-1.5 text-xs font-semibold text-danger"
            >
              <Trash2 size={14} /> Supprimer
            </button>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleAdd}
        className="mt-6 flex flex-wrap items-end gap-3 rounded-card border border-sand bg-white p-4"
      >
        <div>
          <label className="mb-1 block text-xs font-medium text-ink">
            Identifiant (sans accent/espace)
          </label>
          <input
            value={newNeigh.id}
            onChange={(e) => setNewNeigh({ ...newNeigh, id: e.target.value })}
            placeholder="baguida"
            className="input"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink">Nom affiché</label>
          <input
            value={newNeigh.label}
            onChange={(e) => setNewNeigh({ ...newNeigh, label: e.target.value })}
            placeholder="Baguida"
            className="input"
          />
        </div>
        <button
          type="submit"
          className="flex items-center gap-1 rounded-control bg-terracotta px-4 py-2 text-sm font-semibold text-white"
        >
          <Plus size={16} /> Ajouter
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    </div>
  );
}
