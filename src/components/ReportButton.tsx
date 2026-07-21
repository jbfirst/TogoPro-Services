import { useState } from "react";
import { Flag } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const REASONS = [
  "Fiche fausse ou trompeuse",
  "Prestataire injoignable",
  "Contenu inapproprié",
  "Arnaque suspectée",
  "Autre",
];

export function ReportButton({ providerId }: { providerId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [details, setDetails] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    await supabase.from("reports").insert({ provider_id: providerId, reason, details });
    setSending(false);
    setSent(true);
  }

  if (!open) {
    return (
      <div className="mt-8 text-center">
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs text-ink-soft hover:text-danger"
        >
          <Flag size={13} /> Signaler cette fiche
        </button>
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-card border border-sand bg-white p-5">
      {sent ? (
        <p className="text-sm text-green">Merci, votre signalement a été transmis à l'équipe.</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <p className="text-sm font-semibold text-ink">Signaler cette fiche</p>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="input"
          >
            {REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <textarea
            placeholder="Détails (facultatif)"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={2}
            className="input"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={sending}
              className="rounded-control bg-danger px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
            >
              {sending ? "Envoi…" : "Envoyer le signalement"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-control border border-sand px-4 py-2 text-xs text-ink"
            >
              Annuler
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
