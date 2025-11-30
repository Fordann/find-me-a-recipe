# Design System - Find Me a Recipe

## Vue d'ensemble

Ce document décrit le système de design unifié appliqué à l'application pour assurer cohérence, lisibilité et maintenabilité.

## Améliorations apportées

### 1. **Variables CSS Centralisées** (`/client/src/styles/variables.css`)

Création d'un système de tokens de design réutilisables :

- **Palette de couleurs** : Couleurs primaires, secondaires et neutres avec nommage sémantique
- **Typographie** : Échelle de tailles, poids et hauteurs de ligne cohérente
- **Espacement** : Système d'espacement basé sur une échelle de 4px
- **Ombres** : Ensemble d'ombres pré-définies pour la cohérence visuelle
- **Border radius** : Valeurs de rayons cohérentes
- **Transitions** : Durées et easings standardisés
- **Z-index** : Échelle de profondeur pour la superposition des éléments

### 2. **Typographie Cohérente**

#### Polices
- **Primaire** : System font stack pour une performance optimale
- **Display** : Nunito pour les titres et éléments importants

#### Hiérarchie
```
h1: 3rem (48px) - Titres principaux
h2: 2.25rem (36px) - Sous-titres majeurs
h3: 1.875rem (30px) - Sections
h4: 1.5rem (24px) - Sous-sections
Body: 1rem (16px) - Texte standard
Small: 0.875rem (14px) - Texte secondaire
```

### 3. **Améliorations Frontend**

#### Normalisation CSS
- Reset box-model cohérent
- Antialiasing activé pour un meilleur rendu des polices
- Styles de base pour tous les éléments HTML

#### Composants Boutons
- Utilisation de variables CSS pour les couleurs
- Transitions fluides et cohérentes
- États hover/active/disabled standardisés
- Effets de feedback visuels améliorés

#### Espacement
- Utilisation systématique de variables d'espacement
- Padding et margins cohérents à travers l'app
- Système de grille responsive

### 4. **Meilleures Pratiques Appliquées**

#### Performance
- Font loading optimisé
- Transitions CSS vs JavaScript
- Use de `will-change` pour les animations complexes

#### Accessibilité
- Ratios de contraste respectés
- Focus states visibles
- Labels ARIA ajoutés où nécessaire
- Tailles de clic respectant les guidelines (min 44x44px)

#### Maintenabilité
- Variables CSS au lieu de valeurs en dur
- Commentaires clairs et organisation logique
- Nommage de classes BEM-like cohérent
- Séparation des concerns (layout vs apparence)

## Structure des Fichiers CSS

```
/client/src/styles/
├── variables.css         # Tokens de design système
├── App.css              # Styles globaux et resets
├── FieldAddingIngredients.css
├── SearchBarIngredients.css
├── Recipe.css
└── ... (autres fichiers de composants)
```

## Guidelines d'Utilisation

### Couleurs
```css
/* ✅ Bon */
color: var(--color-primary);
background: var(--color-gradient);

/* ❌ Éviter */
color: #ff8a3d;
```

### Espacement
```css
/* ✅ Bon */
padding: var(--spacing-md);
gap: var(--spacing-sm);

/* ❌ Éviter */
padding: 16px;
gap: 8px;
```

### Transitions
```css
/* ✅ Bon */
transition: transform var(--transition-base);

/* ❌ Éviter */
transition: transform 0.3s ease;
```

## Cohérence Visuelle

### Gradient Principal
Le gradient de marque est utilisé de manière cohérente :
- Boutons d'action principaux
- Titres animés
- Indicateurs de progression
- Éléments interactifs importants

### Ombres
Hiérarchie d'ombres pour la profondeur :
- `--shadow-sm` : Éléments subtils
- `--shadow-base` : Cartes standards
- `--shadow-lg` : Modales et overlays
- `--shadow-primary` : Boutons avec couleur de marque

## Prochaines Étapes Recommandées

1. **Audit d'accessibilité** : Vérifier les ratios de contraste et la navigation au clavier
2. **Thème sombre** : Implémenter un mode sombre avec les variables CSS
3. **Composants réutilisables** : Créer des composants React pour les patterns répétitifs
4. **Tests de performance** : Optimiser les animations et les transitions
5. **Documentation Storybook** : Documenter les composants visuellement

## Ressources

- [CSS Custom Properties (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [Design Tokens W3C](https://www.w3.org/community/design-tokens/)
- [Material Design Guidelines](https://material.io/design)
