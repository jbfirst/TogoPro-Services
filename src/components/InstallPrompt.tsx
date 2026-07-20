import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

// Évènement standard du navigateur, pas encore dans les types TS par défaut
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    function handler(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!deferredPrompt || dismissed) return null;

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }

  return (
    <div className="flex items-center justify-between gap-3 bg-terracotta px-4 py-2.5 text-sm text-white">
      <span className="flex items-center gap-2">
        <Download size={16} /> Installez TogoPro Services sur votre téléphone
      </span>
      <div className="flex items-center gap-3">
        <button onClick={handleInstall} className="font-semibold underline">
          Installer
        </button>
        <button onClick={() => setDismissed(true)} aria-label="Fermer">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
