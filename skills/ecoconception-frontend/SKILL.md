---
name: ecoconception-frontend
description: Écrire du HTML, CSS et JavaScript éco-conçus côté client. À utiliser à chaque fois que l'utilisateur demande de générer ou refactoriser des composants UI, des pages, du markup, du style ou du code JS s'exécutant dans le navigateur. Couvre : DOM léger, sémantique HTML, CSS minimal et performant, JavaScript parcimonieux, animations sobres, suppression des bibliothèques lourdes, pratiques de performance web ayant un impact environnemental direct. Trigger même pour des micro-tâches (« écris-moi un menu sobre », « fais ce composant en CSS sans JS »). Toujours activer pour toute production de code frontend, en complément des skills medias et contenu-ux si pertinent.
metadata:
   tag: ecoconception, front, html
   version: 1.0.0
   last-updated: 20/05/2026
---


# Écoconception — Frontend (HTML / CSS / JS)

Pratiques pour écrire un code client minimaliste, performant et sobre en énergie. Chaque octet économisé en frontend se traduit par moins de transferts réseau, moins de calcul CPU/GPU, et donc moins d'énergie consommée sur le terminal utilisateur — qui représente la part dominante de l'empreinte d'un service web.

## Référentiels couverts

- **RGESN 2024** : familles 6 (UX/UI) et 7 (Frontend), critères 6.1 à 7.10
- **AFNOR SPEC 2201** : §9 (Espace et interface utilisateur), §10 (Front-end)
- **WSG** : Web Development 4.x (en particulier 4.4 à 4.9)

## Principes HTML

### Sémantique avant tout
- Utiliser les balises sémantiques HTML5 (`<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, `<footer>`). Elles évitent du CSS d'identification et améliorent l'accessibilité.
- Éviter les `<div>` génériques quand une balise sémantique existe.
- Profondeur DOM cible : **< 15 niveaux**, **< 1500 nœuds** par page (RGESN 7.1, WSG 4.4).

### HTML autoporteur
- Le HTML servi doit être lisible sans JS. La page doit afficher son contenu principal sans exécuter un seul script.
- Tester en désactivant JS dans DevTools : le contenu doit rester accessible.

### Formulaires natifs
- Utiliser les types HTML natifs (`type="email"`, `type="tel"`, `type="date"`, `type="number"`) au lieu de pickers JS personnalisés.
- Attributs natifs de validation (`required`, `pattern`, `min`, `max`) avant de recourir à du JS.
- `<input list="...">` + `<datalist>` plutôt qu'une combobox JS.

## Principes CSS

### CSS minimal et natif
- Pas de framework CSS lourd par défaut. Tailwind est acceptable s'il est purgé agressivement (< 20 Ko en prod).
- Utiliser les **variables CSS natives** (`--couleur-primaire`) plutôt qu'un préprocesseur quand possible.
- Privilégier **CSS Grid** et **Flexbox** plutôt que des hacks ou des libs de layout.
- Bannir les libs de type Bootstrap entier importé sans purge.

### Animations sobres
- Préférer `transform` et `opacity` pour les animations (GPU, pas de reflow).
- Éviter les animations infinies (autoplay loops) : elles consomment du CPU/GPU en continu (RGESN 6.5, WSG UX 1.5).
- Respecter `prefers-reduced-motion` :
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation: none !important; transition: none !important; }
  }
  ```
- Pas d'animations purement décoratives sur le scroll (parallax, AOS).

### Sélecteurs et spécificité
- Sélecteurs courts et plats. Éviter les sélecteurs imbriqués profonds qui ralentissent le style recalc.
- Pas de `*` global avec des propriétés coûteuses.

### Fonts (voir aussi `ecoconception-medias`)
- Maximum 2 familles de polices, 2 graisses par famille.
- `font-display: swap` systématique.
- Préférer une police système (`font-family: system-ui, -apple-system, sans-serif;`) quand le design le permet — économie de 50 à 300 Ko.

## Principes JavaScript

### Le moins possible
- Cible : **bundle JS critique < 30 Ko gzippé** pour un site standard, < 70 Ko pour une application.
- Pour chaque fonctionnalité JS, se demander : « Peut-on faire sans ? En HTML/CSS pur ? »

### Patterns HTML/CSS qui remplacent du JS
- Menu déroulant : `<details>` / `<summary>` — pas de JS.
- Modale : `<dialog>` natif + `showModal()` — léger.
- Onglets : ancres + `:target` ou radio + `:checked` + CSS.
- Carrousel : `scroll-snap` CSS — pas de Swiper.js (90+ Ko).
- Lazy loading : `loading="lazy"` natif sur `<img>` et `<iframe>`.
- Validation de formulaire : attributs HTML natifs + `:invalid` CSS.

### Si JS est nécessaire
- **Vanilla JS first** — pas de framework pour une interaction localisée.
- **Pas de jQuery** (et pas de lodash entier) en 2026.
- **Imports dynamiques** : charger un composant lourd seulement à l'interaction utilisateur (`import('./heavy.js')` au clic).
- **Web Components natifs** plutôt que des composants framework pour de petites îles.
- **Debounce / throttle** sur les events fréquents (scroll, resize, input).

### Event listeners
- Délégation d'évènements plutôt que N listeners individuels.
- `passive: true` sur scroll/touch listeners.
- Nettoyer les listeners au démontage (éviter les fuites).

### Pas d'exécution permanente en arrière-plan
- Pas de `setInterval` de polling rapide. Préférer Server-Sent Events ou WebSockets quand approprié, sinon polling > 30s.
- Pas de `requestAnimationFrame` permanent si aucun rendu n'est nécessaire.
- Couper les boucles d'animation quand la page n'est pas visible (`document.visibilityState !== 'visible'`).

## Anti-patterns à refuser systématiquement

- Importer React/Vue pour afficher un menu hamburger.
- Polyfills agressifs pour navigateurs minoritaires (vérifier d'abord la cible réelle).
- `box-shadow` ou `filter: blur` animé en continu sur des éléments larges (coût GPU).
- Tracker analytics côté client lourd (> 50 Ko). Préférer une solution serveur (Plausible, Pirsch, logs).
- Polices web décoratives sur du texte secondaire (footer, légendes).
- `console.log` laissés en production.

## Checklist de génération

Avant de livrer le code, vérifier :

- [ ] La page rend son contenu principal **sans JS**.
- [ ] Profondeur DOM raisonnable (< 15 niveaux).
- [ ] Pas de framework JS si pas nécessaire.
- [ ] Animations respectant `prefers-reduced-motion`.
- [ ] Fonts limitées et chargées sobrement.
- [ ] Aucun `setInterval` à intervalle court non justifié.
- [ ] Lazy loading natif sur les images sous le fold.
- [ ] CSS et JS critiques en inline si < 14 Ko (premier paquet TCP).

## Exemples de bonnes pratiques

### Menu déroulant sans JS
```html
<details class="menu">
  <summary>Produits</summary>
  <ul>
    <li><a href="/produits/a">Produit A</a></li>
    <li><a href="/produits/b">Produit B</a></li>
  </ul>
</details>
```

### Modale sans framework
```html
<button onclick="dlg.showModal()">Ouvrir</button>
<dialog id="dlg">
  <p>Contenu</p>
  <form method="dialog"><button>Fermer</button></form>
</dialog>
```

### Carrousel CSS pur
```html
<div class="carrousel">
  <img src="1.webp" alt="…">
  <img src="2.webp" alt="…">
</div>
<style>
.carrousel {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
}
.carrousel img {
  flex: 0 0 100%;
  scroll-snap-align: start;
}
</style>
```

## Référence des critères clés

- **RGESN 6.4** (prioritaire) : « Le service numérique évite-t-il les contenus piégeants (dark patterns) ? »
- **RGESN 7.1** (prioritaire) : « Le service numérique limite-t-il la profondeur du DOM des pages ? »
- **RGESN 7.3** : « Le service numérique utilise-t-il une compression adaptée aux fichiers CSS et JavaScript ? »
- **RGESN 7.5** : « Le service numérique a-t-il recours majoritairement à des feuilles de style plutôt qu'à des animations en image ou en vidéo ? »
- **WSG 4.4** : Minimize DOM complexity
- **WSG 4.5** : Reduce JavaScript footprint
- **AFNOR SPEC 2201 §10.3** : Limiter les bibliothèques externes et favoriser le code natif
