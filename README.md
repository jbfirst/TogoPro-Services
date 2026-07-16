# TogoPro Services

Annuaire de prestataires de services vérifiés à Lomé, Togo. React + Vite + Tailwind + Supabase.

## 1. Créer le projet Supabase

1. Va sur [supabase.com](https://supabase.com) → **New project** (le plan gratuit suffit largement).
2. Une fois créé, va dans **Project Settings > API** et récupère :
   - `Project URL` → sera ta `VITE_SUPABASE_URL`
   - `anon public key` → sera ta `VITE_SUPABASE_ANON_KEY`

## 2. Exécuter le schéma SQL

1. Dans le dashboard Supabase, va dans **SQL Editor**.
2. Colle tout le contenu du fichier `supabase/schema.sql` et clique **Run**.
   Ça crée les tables `categories`, `providers`, `reviews`, `admins`, et les policies de sécurité (RLS).

## 3. Créer le bucket de stockage pour les photos

1. Dans **Storage**, crée un bucket nommé exactement `provider-photos`, coché **Public**.
2. Dans l'onglet **Policies** du bucket, ajoute (ou exécute en SQL) :
   ```sql
   create policy "Upload photos si connecté"
     on storage.objects for insert
     with check (bucket_id = 'provider-photos' and auth.role() = 'authenticated');

   create policy "Photos lisibles publiquement"
     on storage.objects for select
     using (bucket_id = 'provider-photos');
   ```

## 4. Configurer le projet en local

```bash
npm install
cp .env.example .env
```

Remplis `.env` avec tes vraies valeurs Supabase :
```
VITE_SUPABASE_URL=https://ton-projet.supabase.co
VITE_SUPABASE_ANON_KEY=ta-cle-anon
```

```bash
npm run dev
```

Ouvre `http://localhost:5173`.

## 5. Te créer un compte admin

1. Sur le site, crée un compte via "Devenir prestataire" (ou crée un compte directement dans Supabase **Authentication > Users > Add user**).
2. Dans **SQL Editor**, exécute (remplace l'UUID par celui de ton utilisateur, visible dans Authentication > Users) :
   ```sql
   insert into admins (user_id) values ('colle-ton-uuid-ici');
   ```
3. Reconnecte-toi sur le site — le lien "Admin" apparaît dans le menu.

## 6. Déployer sur Vercel

1. Pousse ce projet sur GitHub.
2. Sur [vercel.com](https://vercel.com), **Add New Project** → importe le repo.
3. Dans les **Environment Variables** du projet Vercel, ajoute `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` (mêmes valeurs que ton `.env`).
4. Déploie. Vercel détecte automatiquement Vite.

## Structure du projet

```
src/
  components/     → Header, Footer, cartes, badges, route protégée
  pages/          → Accueil, Liste, Détail, Devenir prestataire, Connexion, Dashboard, Admin, À propos
  lib/            → client Supabase, contexte auth, constantes (catégories/quartiers)
supabase/
  schema.sql      → tables + sécurité (RLS) à exécuter dans Supabase
```

## Notes de sécurité (V1 → V2)

La policy `providers.update` permet à un prestataire de modifier tous les champs de sa
propre fiche — y compris en théorie `status`/`is_verified`/`is_premium`. Pour une V1 avec peu
d'utilisateurs, c'est gérable en surveillant manuellement l'onglet Admin. Avant de scaler,
remplace cette policy par une fonction Postgres (RPC) qui restreint les colonnes modifiables
côté prestataire à uniquement les champs éditoriaux (nom, description, tarif, photos).

## Paiements

Le paiement de l'abonnement Premium n'est pas automatisé dans cette V1 (pas de Stripe branché,
pour rester simple et adapté au paiement mobile local Togo). Flow recommandé : le prestataire
paie en Flooz/Mixx by Yas via WhatsApp, tu actives son statut Premium manuellement depuis
l'onglet Admin (bouton "Activer Premium").
