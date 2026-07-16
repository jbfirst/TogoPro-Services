import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./lib/AuthContext";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Home } from "./pages/Home";
import { ProvidersList } from "./pages/ProvidersList";
import { ProviderDetail } from "./pages/ProviderDetail";
import { BecomeProvider } from "./pages/BecomeProvider";
import { SignIn } from "./pages/SignIn";
import { Dashboard } from "./pages/Dashboard";
import { Admin } from "./pages/Admin";
import { About } from "./pages/About";

export default function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/prestataires" element={<ProvidersList />} />
          <Route path="/prestataires/:id" element={<ProviderDetail />} />
          <Route path="/devenir-prestataire" element={<BecomeProvider />} />
          <Route path="/connexion" element={<SignIn />} />
          <Route path="/a-propos" element={<About />} />
          <Route
            path="/tableau-de-bord"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <Admin />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Layout>
    </AuthProvider>
  );
}
