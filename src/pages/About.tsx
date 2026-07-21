import { useDocumentTitle } from "../lib/useDocumentTitle";

export function About() {
  useDocumentTitle(
    "À propos",
    "Découvrez TogoPro Services, la plateforme qui connecte les habitants de Lomé aux artisans et prestataires vérifiés de leur quartier."
  );
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 md:px-8">
      <h1 className="text-2xl font-bold text-ink md:text-3xl">À propos de TogoPro Services</h1>
      <p className="mt-4 text-ink-soft">
        TogoPro Services est une plateforme locale créée pour aider les artisans togolais à se
        faire connaître en ligne, et pour aider les habitants de Lomé à trouver rapidement des
        prestataires fiables près de chez eux, sans intermédiaire ni commission cachée.
      </p>
      <p className="mt-4 text-ink-soft">
        Chaque fiche prestataire est vérifiée manuellement avant publication. Les avis viennent de
        vrais clients. Et le contact se fait directement par WhatsApp, sans passer par nous.
      </p>
    </div>
  );
}
