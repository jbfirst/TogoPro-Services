import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export function NewPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(`Impossible de mettre à jour le mot de passe (${error.message}).`);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center md:px-8">
        <h1 className="text-2xl font-bold text-ink">Mot de passe mis à jour !</h1>
        <p className="mt-3 text-ink-soft">Vous pouvez maintenant vous connecter normalement.</p>
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
    <div className="mx-auto max-w-md px-4 py-16 md:px-8">
      <h1 className="text-2xl font-bold text-ink">Nouveau mot de passe</h1>
      <p className="mt-1 text-sm text-ink-soft">Choisissez un nouveau mot de passe.</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input
          type="password"
          required
          minLength={6}
          placeholder="Nouveau mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-control border border-sand px-3 py-2 text-sm"
        />
        {error && <p className="text-sm text-danger">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-control bg-terracotta px-5 py-3 text-sm font-semibold text-white hover:bg-terracotta-dark disabled:opacity-60"
        >
          {loading ? "Mise à jour…" : "Mettre à jour le mot de passe"}
        </button>
      </form>
    </div>
  );
}
