# CLAUDE.md

Webapp perso de suivi d'habitudes, planification hebdo/mensuelle et projets au long cours, avec une couche RPG (stats, XP, jauges Discipline / Motivation / Inspiration, campagnes) dans un univers spatial (le Sillage, `docs/univers.md`). Langue du projet : français.

## Ce dépôt : la V2 graphique

Ce dépôt (`Doktom/rpg-habitudes-v2`) est la **V2** : mêmes mécaniques que la V0, avec une grosse refonte de l'UI et de l'UX, belle et douce, dans l'univers spatial.

- **Base** : dépôt `Doktom/rpg-habitudes`, tag `v0.1-base` (historique conservé ici). La V0 reste en ligne et n'est plus modifiée, sauf correctif.
- **Mécaniques** : `src/lib/engine/`, `config.ts`, `universe.ts` et le store sont la base fonctionnelle. Les garder identiques sauf décision explicite ; la refonte porte sur les écrans, les composants et le style.
- **Stockage** : la V2 est sur le même domaine que la V0 (doktom.github.io), donc partage le localStorage. Elle a ses propres clés (`rpg-habitudes-v2:*`) et importe en lecture seule les données V0 au premier lancement. Ne jamais écrire dans les clés `rpg-habitudes:*`.

## Démarrer une session

1. Lire la carte mentale (voir « Carte mentale : outil de pilotage »), puis l'entrée la plus récente de `docs/journal-sessions.md` et `docs/cahier-des-charges.md`.
2. `npm install` puis `npm test` (21 tests attendus au vert) et `npm run dev`.
3. Si le doc partagé Claude Docs n'est pas accessible, `docs/cahier-des-charges.md` fait foi.

**État au 29/10/2026** : V2 créée à partir de la V0 ; refonte graphique à démarrer (direction artistique à valider avec l'utilisateur).

**Prochaines étapes, par ordre de priorité**

1. Refonte graphique, écran par écran (système de design, coque, Aujourd'hui, Vaisseau, À faire et Pilote faits ; restent Planning, Campagnes, Revue, Habitudes, Danse).
2. Retours d'usage réel de la V0 (corrections, calibrage des valeurs d'XP et de jauges dans `src/lib/config.ts`), à reporter ici.
3. Supabase : auth + tables du modèle de données, en remplacement de `load`/`persist` dans `store.svelte.ts` ; import du JSON exporté depuis la V0.
3. PWA installable + notifications (rappels d'habitudes, revue du dimanche).
4. Vue mois du planning, revue mensuelle et arcs.
5. V2 : Élan, hauts faits, mode guidé des routines avec minuteur, carte de progression des campagnes, intégration de l'app salle.

Questions encore ouvertes : nom de l'app et des stats, habitudes de trading détaillées, chapitres réels des campagnes Trading et Maison, stack de l'app salle.

## Documents de référence

- `docs/cahier-des-charges.md` : cahier des charges, source de vérité du produit.
- Doc partagé (Claude Docs) : https://claude.ai/artifact/C8zL86y6JnbN2dSHobDbAi — même contenu, version éditable et commentable.
- `docs/journal-sessions.md` : journal des sessions de travail avec Claude.
- **Carte mentale** des modules et mécaniques : https://claude.ai/artifact/Bq2ySz5W8oPtYHMQpmxQz9 (source : `tools/carte-mentale.html`). Les nœuds vivent dans la base de l'artifact, collection `nodes` (champs `label`, `parent`, `kind` module|mecanique|idee|question, `status` en-place|prevu|a-explorer|abandonne, `note`, `order`). Claude les lit et les écrit avec l'outil ArtifactData. `docs/carte-mentale.md` en est une copie lisible.

## Carte mentale : outil de pilotage (à chaque session)

La carte mentale est l'outil de pilotage du projet et l'interface d'échange avec l'utilisateur, en plus du chat. Les priorités et les idées s'y décident.

- **Début de session** : lire toute la collection `nodes`. Traiter en priorité les nœuds sous « Pour Claude » (`x-pour-claude`) ; statut `prevu` = à faire en premier. Repérer aussi les nœuds nouveaux ou modifiés ailleurs (comparer avec `docs/carte-mentale.md`).
- **Pendant** : quand une mécanique est développée ou décidée, passer son nœud en `en-place` ou `prevu` (ou le créer). Une demande traitée passe en `en-place` (ou `abandonne` avec la raison en note).
- **Fin de session** : ajouter un nœud de compte rendu daté sous « Réponses de Claude » (`x-reponses`, le plus récent avec le plus petit `order`), qui répond aux demandes traitées.
- Quand une mécanique est développée ou décidée, passer son nœud en `en-place` ou `prevu` (ou le créer).
- En fin de session, régénérer la copie : ArtifactData `list` sur `nodes` avec `out_dir`, puis `node tools/carte-export.mjs <out_dir>/nodes`, et committer `docs/carte-mentale.md`.
- Pour modifier la page elle-même : republier `tools/carte-mentale.html` sur la même URL (garder `capabilities: {db: {}}`).

## Règles systématiques (à chaque session)

1. **Cahier des charges à jour** : toute décision produit ou technique prise pendant la session est reportée dans le doc partagé ET dans `docs/cahier-des-charges.md` (exporter le doc en markdown pour garder les deux identiques).
2. **Journal de session** : ajouter en haut de `docs/journal-sessions.md` une entrée datée (objectif, décisions, travail réalisé, questions ouvertes, prochaine étape).
3. **Commit + push** sur GitHub en fin de session, avec un message qui résume la session.

## Principes produit à respecter

- On ne perd jamais d'XP ni de niveau ; les conséquences portent sur les jauges.
- Motivation plutôt que punition. Les matériaux du vaisseau ne se perdent jamais : ils se dépensent seulement sur une amélioration choisie. Lore et mécaniques spatiales : `docs/univers.md`.
- Mode test (écran Personnage) : stockage séparé, date simulée via `setClock` dans `src/lib/dates.ts`. Toujours l'utiliser pour essayer la progression avant de calibrer.
- Trading : on récompense le processus, jamais le P&L.
- V2 : beau et doux, dans l'univers spatial, sans perdre la lisibilité.

## Système de design (V2)

- **Thèmes** : Nuit douce (sombre, par défaut) et Aube orbitale (clair), plus « automatique ». Jetons dans `src/app.css` (`--page`, `--surface`, `--raised`, `--line`, `--ink`, `--muted`, `--accent`, `--reward`, `--done`, `--g-*` pour les jauges) et classes Tailwind associées (`bg-surface`, `text-muted`, `bg-accent-soft`…). Choix du thème : `src/lib/theme.svelte.ts`, appliqué avant l'affichage par le script de `src/app.html`.
- **Écrire les écrans avec les jetons** (`bg-surface`, `text-ink`, `text-muted`, `border-line`, `bg-accent`…) plutôt qu'avec des couleurs Tailwind. La palette `zinc` est rebranchée sur la rampe neutre du thème, et les teintes d'accent ont une version sombre générée par `node scripts/gen-dark-hues.mjs` (`src/theme-hues-dark.css`) : ajouter une teinte là si un écran en utilise une nouvelle. Pas de `bg-white`/`text-white`.
- **Classes de composants** : `.card`, `.btn`, `.btn-primary`, `.btn-ghost`, `.input`, `.label`, `.h2`, `.eyebrow`, `.chip`.
- **Composants** : `ShipArt` (le Sillage en SVG, dont chaque partie reflète le niveau d'un module), `OrbitRing` (orbite elliptique autour de Kronos), `LevelRing`, `Gauges`, `TierButtons` (palier en pilule), `LootLine` (butin avec icônes), `ThemeSwitch`, `Segmented` (sélecteur à pilules), `TaskCheck` (case ronde colorée par l'effort), `StatRadar` (radar des disciplines), `Toasts` + `toasts.svelte.ts` (notification de gain : `toasts.push({ title, xp, loot })`). Icônes : `@lucide/svelte`. Police : Nunito (`@fontsource-variable/nunito`, embarquée).
- **Navigation** : barre latérale groupée (Bord, Voyage, Pilote) sur PC ; sur mobile, une barre flottante à 4 écrans + « Plus ».

## Stack

- En place (V0) : SvelteKit 3 (Svelte 5, runes), TypeScript, Tailwind 4, Vitest, adapter-static en SPA. Données en localStorage via `src/lib/store.svelte.ts`.
- Prévu : Supabase (Postgres, Auth, RLS, Edge Functions), PWA avec Web Push.
- SvelteKit 3 : pas de `svelte.config.js`, la config passe par `sveltekit({...})` dans `vite.config.ts`. Imports internes avec `#lib/...` et l'extension explicite (`#lib/dates.ts`, `#lib/store.svelte.ts`).
- Les règles de jeu vivent dans `src/lib/engine/` (fonctions pures, testées) et les constantes dans `src/lib/config.ts`. XP et jauges sont recalculées depuis le journal `events` : toute action ajoute ou retire des événements, jamais de compteur modifié directement.

- Routage par hash (`router: { type: 'hash' }`) et `appDir: 'app'` : liens internes en `#/...`. Pas de `confirm()`/`alert()` (bloqués dans la page de test), utiliser `ConfirmButton`.

## Commandes

`npm run dev` · `npm test` · `npm run check` · `npm run build` · `npm run build:artifact`

Sous Windows avec Git Bash, tester le build GitHub Pages avec `MSYS_NO_PATHCONV=1 BASE_PATH=/rpg-habitudes-v2 npm run build` (sinon le chemin est converti en chemin Windows).

## En ligne

- Site public V2 : https://doktom.github.io/rpg-habitudes-v2/ — déployé automatiquement par GitHub Actions à chaque push sur `main` (le build reçoit `BASE_PATH=/rpg-habitudes-v2`, tiré du nom du dépôt). Le dépôt est public : ne jamais y mettre de secrets ni de données personnelles.
- V0 (base, figée) : https://doktom.github.io/rpg-habitudes/.
