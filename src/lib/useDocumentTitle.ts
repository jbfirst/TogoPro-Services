import { useEffect } from "react";

/**
 * Met à jour le <title> et la meta description de la page. Indispensable en SPA :
 * sans ça, toutes les pages partagent le même titre générique défini dans index.html,
 * ce qui nuit au référencement (chaque page a besoin d'un titre/description unique).
 */
export function useDocumentTitle(title: string, description?: string) {
  useEffect(() => {
    const fullTitle = `${title} | TogoPro Services`;
    document.title = fullTitle;

    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", "description");
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", description);
    }
  }, [title, description]);
}
