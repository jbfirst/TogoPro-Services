import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-sand bg-sand/60">
      <div className="stripe-divider" />
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <p className="text-lg font-bold text-ink">
              TogoPro <span className="text-terracotta">Services</span>
            </p>
            <p className="mt-2 max-w-xs text-sm text-ink-soft">
              L'annuaire des prestataires de confiance à Lomé. Trouvez le bon professionnel, dans
              votre quartier, en toute simplicité.
            </p>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold text-ink">Navigation</p>
            <ul className="space-y-2 text-sm text-ink-soft">
              <li>
                <Link to="/prestataires" className="hover:text-terracotta">
                  Trouver un prestataire
                </Link>
              </li>
              <li>
                <Link to="/devenir-prestataire" className="hover:text-terracotta">
                  Devenir prestataire
                </Link>
              </li>
              <li>
                <Link to="/a-propos" className="hover:text-terracotta">
                  À propos
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold text-ink">Contact</p>
            <p className="text-sm text-ink-soft">Lomé, Togo</p>
          </div>
        </div>
        <p className="mt-8 text-xs text-ink-soft/70">
          © {new Date().getFullYear()} TogoPro Services. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
