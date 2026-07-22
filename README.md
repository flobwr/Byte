<div align="center">

# 🐱 Byte

**Suivi du temps, en un geste.**

Byte transforme le suivi d'activité en un seul mouvement du pouce.
Un chronomètre unique tourne, tu touches une catégorie quand tu changes
d'activité — le temps est attribué, le compteur repart. Moins de deux secondes,
aucune confirmation.

</div>

---

## ✨ Principe

Un seul chronomètre existe. Pas de minuteur par catégorie.

1. Tu **démarres ta journée** → le chronomètre global part de zéro.
2. Quand tu **termines une activité**, tu touches la carte correspondante.
3. Le temps écoulé est **ajouté à cette catégorie**, et le chronomètre **repart aussitôt**.

C'est tout. Instantané, tactile, sans friction.

## 🎨 Design

- **Mode sombre** par défaut, palette sobre, coins très arrondis.
- Une **mascotte pixel-art** — un chat — avec une expression par activité,
  intégrée naturellement à l'interface (jamais « collée »).
- Animations à 60 FPS via **Reanimated**, retours haptiques, hiérarchie visuelle forte.
- Inspirations : Apple, Nothing, Material 3 Expressive, Linear, Arc.

## 🧱 Stack technique

| Domaine        | Outil                                  |
| -------------- | -------------------------------------- |
| Framework      | Expo (SDK 54) + React Native           |
| Langage        | TypeScript (strict)                    |
| Navigation     | Expo Router (file-based, typed routes) |
| État           | Zustand                                |
| Persistance    | MMKV (synchrone, rapide)               |
| Animations     | React Native Reanimated + Gesture Handler |
| Graphiques     | Victory Native XL (Skia)               |
| Rendu          | React Native SVG · Expo Image · Expo Blur |
| Haptique       | Expo Haptics                           |

## 🗂 Architecture

```
src/
├── app/                # Écrans (Expo Router)
│   ├── _layout.tsx
│   └── (tabs)/         # Aujourd'hui · Stats · Profil
├── components/         # Primitives UI réutilisables + mascotte
│   ├── ui/             # AppText, Card, Button, Icon, Screen
│   └── navigation/     # Barre d'onglets flottante
├── features/           # Logique par domaine (home, stats)
├── hooks/              # useElapsed…
├── services/           # storage (MMKV)
├── stores/             # timerStore (Zustand)
├── constants/          # catégories, registre des mascottes
├── theme/              # couleurs, typo, espacements, ombres
└── utils/              # temps, dates
assets/
├── mascot/             # 11 expressions de la mascotte
├── images/             # icône, splash
└── icons/
```

Chaque écran est composé de petits éléments testables — pas de composant géant.

## 🚀 Démarrage

```bash
npm install
npm start          # Expo Dev Server
npm run ios        # ou : npm run android
```

## ✅ Qualité

```bash
npm run typecheck  # tsc --noEmit (strict, 0 erreur)
npm run lint       # eslint (0 erreur)
npm run format     # prettier
```

---

<div align="center">
<sub>Fait avec attention. Chaque écran pensé comme par un designer.</sub>
</div>
