import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { categoryLabel, type Provider } from "../lib/constants";

export function Admin() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");

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

  async function togglePremium(id: string, current: boolean) {
    await supabase.from("providers").update({ is_premium: !current }).eq("id", id);
    load();
  }

  async function toggleVerified(id: string, current: boolean) {
    await supabase.from("providers").update({ is_verified: !current }).eq("id", id);
    load();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-8">
      <h1 className="text-2xl font-bold text-ink">Administration</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Valide les nouvelles fiches et gère les statuts Vérifié / Premium.
      </p>

      <div className="mt-6 flex gap-2">
        {(["pending", "approved", "rejected", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-pill px-4 py-1.5 text-sm font-medium ${
              filter === f ? "bg-terracotta text-white" : "bg-sand text-ink"
            }`}
          >
            {f === "pending"
              ? "En attente"
              : f === "approved"
              ? "Approuvées"
              : f === "rejected"
              ? "Refusées"
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
          {providers.map((p) => (
            <div key={p.id} className="rounded-card border border-sand bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink">{p.full_name}</p>
                  <p className="text-sm text-ink-soft">
                    {categoryLabel(p.category_id)} · {p.neighborhood} · {p.phone}
                  </p>
                  <p className="mt-1 text-sm text-ink-soft">{p.description}</p>
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
                  <button
                    onClick={() => togglePremium(p.id, p.is_premium)}
                    className={`rounded-control px-3 py-1.5 text-xs font-semibold ${
                      p.is_premium ? "bg-gold text-white" : "border border-gold text-gold"
                    }`}
                  >
                    {p.is_premium ? "Premium ✓" : "Activer Premium"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
