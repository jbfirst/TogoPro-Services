# Guide de modification — TogoPro Services

Ce guide t'explique comment modifier le site toi-même, sans avoir besoin de redemander à
chaque fois. Le principe général : tu modifies un fichier, tu sauvegardes, et le site se
recharge automatiquement dans ton navigateur pendant que `npm run dev` tourne.

---

## 1. Où sont les choses

```
src/
  lib/
    constants.ts       → catégories, quartiers, types de données
    supabaseClient.ts  → connexion à Supabase (ne pas toucher sauf changement de clé)
    AuthContext.tsx     → logique de connexion (ne pas toucher sauf bug)
  components/
    Header.tsx          → menu du haut (logo, liens, boutons connexion)
    Footer.tsx           → pied de page
    ProviderCard.tsx     → la "carte" d'un prestataire dans les listes
    Badges.tsx            → badges Vérifié / Premium
    CategoryIcon.tsx      → mapping nom d'icône → icône affichée
  pages/
    Home.tsx             → page d'accueil
    ProvidersList.tsx     → page "Trouver un prestataire"
    ProviderDetail.tsx    → fiche détaillée d'un prestataire
    BecomeProvider.tsx     → page d'inscription prestataire
    SignIn.tsx              → page de connexion
    Dashboard.tsx            → tableau de bord prestataire
    Admin.tsx                 → interface admin
    About.tsx                  → page "À propos"
  index.css              → styles globaux, couleurs de base
tailwind.config.js        → toute la palette de couleurs et polices
supabase/schema.sql        → structure de la base de données (déjà exécuté une fois)
```

**Règle d'or** : si tu veux changer un texte affiché sur une page précise, le fichier à
modifier est presque toujours dans `src/pages/`. Le nom du fichier correspond au nom de la
page.

---

## 2. Ajouter / modifier une catégorie de service

Fichier : `src/lib/constants.ts`

```ts
export const CATEGORIES = [
  { id: "plomberie", label: "Plomberie", icon: "Wrench" },
  { id: "informatique", label: "Informatique & Digital", icon: "Laptop" },
  // ajoute ta ligne ici
] as const;
```

- `id` : identifiant technique, minuscules, sans accent ni espace (ex: `"jardinage"`)
- `label` : texte affiché aux visiteurs (ex: `"Jardinage & Espaces verts"`)
- `icon` : nom d'une icône, voir [lucide.dev/icons](https://lucide.dev/icons)

**Si tu réutilises une icône déjà présente** dans la liste (Wrench, Zap, Scissors, ChefHat,
Car, Sparkles, HardHat, Hammer, Shirt, Laptop) → rien d'autre à faire.

**Si tu utilises une icône jamais utilisée avant**, ajoute-la à 2 endroits en plus :

`src/components/CategoryIcon.tsx` :
```tsx
import { Wrench, /* ... */, TonIcone } from "lucide-react";
const ICONS: Record<string, ...> = { Wrench, /* ... */, TonIcone };
```

`src/components/ProviderCard.tsx` :
```tsx
const CATEGORY_ICON: Record<string, string> = {
  plomberie: "Wrench",
  // ...
  jardinage: "TonIcone",
};
```

**Pour que la catégorie apparaisse aussi dans la table de référence Supabase** (facultatif,
juste pour la cohérence — le site fonctionne sans), exécute dans SQL Editor :
```sql
insert into categories (id, label, icon) values ('jardinage', 'Jardinage & Espaces verts', 'TonIcone')
on conflict (id) do nothing;
```

---

## 3. Ajouter / modifier un quartier

Même fichier, juste en dessous :
```ts
export const NEIGHBORHOODS = [
  "Bè",
  "Adidogomé",
  // ajoute ton quartier ici
] as const;
```

---

## 4. Modifier un texte sur une page

Chaque page dans `src/pages/` contient du texte en clair dans le code JSX. Exemple, dans
`Home.tsx` :
```tsx
<h1 className="text-3xl font-bold leading-tight text-ink md:text-5xl">
  Trouvez le bon prestataire,{" "}
  <span className="text-terracotta">près de chez vous</span>
</h1>
```
Tu peux changer directement le texte entre les balises. Ne touche pas à ce qui est entre
`{ }` (accolades) ni aux noms après `className=` sauf si tu sais ce que tu fais — c'est du
code, pas du texte affiché.

---

## 5. Changer les couleurs du site

Fichier : `tailwind.config.js`
```js
colors: {
  terracotta: { DEFAULT: "#C1440E", dark: "#9A3609" },
  ocre: { DEFAULT: "#E3A857", light: "#F3D9A4" },
  green: { DEFAULT: "#2F6B4F", dark: "#204B37" },
  gold: "#D4AF37",
  // ...
}
```
Remplace les codes couleur (format `#RRGGBB`) par ceux que tu veux. Un site comme
[coolors.co](https://coolors.co) t'aide à trouver des codes couleur. Après modification,
toutes les pages qui utilisent `bg-terracotta`, `text-terracotta`, etc. changeront
automatiquement.

---

## 6. Modifier le prix de l'abonnement Premium

Fichier : `src/pages/BecomeProvider.tsx`, cherche :
```tsx
<p className="font-semibold text-ink">Premium — 3 000 FCFA/mois</p>
```
Change juste le texte du prix.

---

## 7. Ajouter un champ au formulaire d'inscription prestataire (avancé)

C'est plus technique — ça touche à la fois le formulaire (`BecomeProvider.tsx`,
`Dashboard.tsx`) et la base de données (`supabase/schema.sql`, table `providers`). Si tu
veux ajouter un champ (ex: "Années d'expérience"), reviens me voir avec ce besoin précis,
c'est plus sûr qu'un tâtonnement solo sur la base de données.

---

## 8. Workflow général pour toute modification

1. Ouvre le fichier concerné dans ton éditeur (VS Code recommandé)
2. Modifie
3. Sauvegarde (`Ctrl+S`)
4. Le site dans ton navigateur se recharge tout seul (`npm run dev` doit tourner)
5. Vérifie que ça a le rendu attendu
6. Une fois content, commit et push vers GitHub (voir section Vercel) pour que le site en
   ligne se mette à jour aussi

---

## 9. Erreurs fréquentes et comment les lire

- `Cannot find module 'xxx'` → tu as probablement supprimé ou pas encore lancé
  `npm install`. Relance `npm install` dans le terminal.
- `File name is invalid` lors d'un upload photo → nom de fichier avec accent/caractère
  spécial, déjà corrigé automatiquement dans le code actuel.
- Le site ne se met pas à jour après une modif → vérifie que `npm run dev` tourne toujours
  dans ton terminal (pas fermé par erreur), sinon relance-le.
- Erreur liée à Supabase (colonne introuvable, permission refusée) → généralement un
  décalage entre le code et ce qui a été exécuté dans `schema.sql`. Reviens me voir avec le
  message d'erreur exact.

---

## 10. Ce que tu ne dois normalement jamais avoir à toucher

- `src/lib/supabaseClient.ts`, `src/lib/AuthContext.tsx` → logique technique de connexion
- `vite.config.ts`, `tsconfig.json`, `postcss.config.js` → configuration de l'outillage
- `supabase/schema.sql` → une fois exécuté, ce fichier sert de référence/historique, mais
  modifier la vraie base se fait directement dans Supabase (SQL Editor ou interface Table)
