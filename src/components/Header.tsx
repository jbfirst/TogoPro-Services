import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, X, MapPin } from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { supabase } from "../lib/supabaseClient";

export function Header() {
  const { user, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) return;
    supabase
      .from("providers")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending")
      .then(({ count }) => setPendingCount(count ?? 0));
  }, [isAdmin]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate("/");
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${
      isActive ? "text-terracotta" : "text-ink hover:text-terracotta"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-sand bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-8">
        <Link to="/" className="flex items-center gap-2 font-bold text-ink">
          <span className="flex h-9 w-9 items-center justify-center rounded-control bg-terracotta text-white">
            <MapPin size={18} />
          </span>
          <span className="text-lg">
            TogoPro <span className="text-terracotta">Services</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <NavLink to="/" className={linkClass} end>
            Accueil
          </NavLink>
          <NavLink to="/prestataires" className={linkClass}>
            Trouver un prestataire
          </NavLink>
          <NavLink to="/devenir-prestataire" className={linkClass}>
            Devenir prestataire
          </NavLink>
          <NavLink to="/a-propos" className={linkClass}>
            À propos
          </NavLink>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 text-sm font-medium text-ink hover:text-terracotta"
                >
                  Admin
                  {pendingCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-pill bg-terracotta px-1 text-xs font-bold text-white">
                      {pendingCount}
                    </span>
                  )}
                </Link>
              )}
              <Link to="/tableau-de-bord" className="text-sm font-medium text-ink hover:text-terracotta">
                Mon tableau de bord
              </Link>
              <button
                onClick={handleSignOut}
                className="rounded-control border border-ink/20 px-4 py-2 text-sm font-medium text-ink hover:bg-sand"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/connexion" className="text-sm font-medium text-ink hover:text-terracotta">
                Connexion
              </Link>
              <Link
                to="/devenir-prestataire"
                className="rounded-control bg-terracotta px-4 py-2 text-sm font-semibold text-white shadow-soft hover:bg-terracotta-dark"
              >
                Inscrire mon activité
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="flex flex-col gap-4 border-t border-sand px-4 py-4 md:hidden">
          <NavLink to="/" className={linkClass} end onClick={() => setOpen(false)}>
            Accueil
          </NavLink>
          <NavLink to="/prestataires" className={linkClass} onClick={() => setOpen(false)}>
            Trouver un prestataire
          </NavLink>
          <NavLink to="/devenir-prestataire" className={linkClass} onClick={() => setOpen(false)}>
            Devenir prestataire
          </NavLink>
          <NavLink to="/a-propos" className={linkClass} onClick={() => setOpen(false)}>
            À propos
          </NavLink>
          {user ? (
            <>
              {isAdmin && (
                <Link to="/admin" className="text-sm font-medium" onClick={() => setOpen(false)}>
                  Admin
                </Link>
              )}
              <Link to="/tableau-de-bord" className="text-sm font-medium" onClick={() => setOpen(false)}>
                Mon tableau de bord
              </Link>
              <button onClick={handleSignOut} className="text-left text-sm font-medium text-danger">
                Déconnexion
              </button>
            </>
          ) : (
            <Link to="/connexion" className="text-sm font-medium" onClick={() => setOpen(false)}>
              Connexion
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
