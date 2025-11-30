<div align="center">
  <img src="docs/images/logo.png" alt="Find Me a Recipe" height="90" />
  
  <h1>🍳 Find Me a Recipe</h1>
  <p><strong>From leftover ingredients to full recipes – fast, smart, multilingual.</strong></p>

  <p>
    <a href="https://www.typescriptlang.org/"><img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript"/></a>
    <a href="https://react.dev/"><img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react"/></a>
    <a href="https://flask.palletsprojects.com/"><img alt="Flask" src="https://img.shields.io/badge/Flask-3.0-000000?style=for-the-badge&logo=flask"/></a>
    <a href="https://www.python.org/"><img alt="Python" src="https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python"/></a>
    <a href="LICENSE"><img alt="License" src="https://img.shields.io/badge/License-MIT-34c759?style=for-the-badge"/></a>
  </p>

  <p>
    <a href="#-features">Features</a> •
    <a href="#-demo">Demo</a> •
    <a href="#-quick-start">Quick&nbsp;Start</a> •
    <a href="#-usage">Usage</a> •
    <a href="#-architecture">Architecture</a> •
    <a href="#-api">API</a> •
    <a href="#-testing">Testing</a> •
    <a href="#-contributing">Contributing</a>
  </p>
</div>

<hr/>

<details>
<summary><strong>🇫🇷 Version française (déplier)</strong></summary>

**Find Me a Recipe** vous aide à transformer ce qu'il reste dans votre frigo en recettes adaptées, rapides et pertinentes. Ajoutez vos ingrédients, balayez des suggestions optimisées (swipe), consultez les détails et réduisez le gaspillage alimentaire. Support complet français / anglais, performances optimisées et architecture professionnelle.

</details>

---

## 📖 Overview

**Find Me a Recipe** helps you discover recipes matched to what you already have. Instead of searching blindly, you get curated, ingredient‑aware suggestions with minimal external shopping.

| Impact | Description |
|--------|-------------|
| 🌱 Less Waste | Use ingredients before they expire |
| 💰 Cost Efficient | Avoid buying unnecessary items |
| ⚡ Fast Discovery | Async scraping & caching reduce latency |
| 🌍 Multilingual | English / French with intelligent translation |
| ❤️ Favorites | Save, revisit, and organize liked recipes |
| 🎯 Relevance | Filters out recipes needing many missing items |

---

---

## ✨ Features

<table>
<thead><tr><th>Category</th><th>Highlights</th></tr></thead>
<tbody>
<tr><td><strong>Discovery</strong></td><td>Ingredient-driven search · Minimal missing items · Real-time scraping · High-res images</td></tr>
<tr><td><strong>UX</strong></td><td>Swipe navigation · Animated favorites · Sticky sections · Responsive layout</td></tr>
<tr><td><strong>Localization</strong></td><td>English/French UI · Smart translation of queries · Language-specific caching</td></tr>
<tr><td><strong>Performance</strong></td><td>Async batch fetch · Server + client caching · Optimized DOM & CSS · Efficient parsing</td></tr>
<tr><td><strong>Developer</strong></td><td>Automated tests · Structured logging · Single start script · Dockerized environment</td></tr>
</tbody>
</table>

---

---

## 🎬 Demo

> Screenshots & media placeholders below – replace with actual assets in `docs/images` & `docs/videos`.

| Screenshot | Description |
|------------|-------------|
| ![Homepage](docs/images/homepage.png) | Language selection + entry point |
| ![Ingredients](docs/images/ingredients.png) | Fridge ingredient builder |
| ![Swipe](docs/images/recipes.png) | Swipeable recipe discovery view |
| ![Details](docs/images/recipe-detail.png) | Full recipe (ingredients + steps) |
| ![Favorites](docs/images/favorites.png) | Favorites grid overview |

**Demo Video:** `docs/videos/demo.mp4` *(add after recording)*

---

---

## 🚀 Quick Start

```bash
# Single command (auto: tests → docker or local fallback)
npm start
```

Opens frontend at `http://localhost:3000` and backend at `http://localhost:5001` (Docker) or chosen local port.

### Prerequisites
Node 18+, Python 3.12+, optional Docker.

### Alternative Setups

<details>
<summary><strong>▶ Docker workflow</strong></summary>

```bash
npm run docker:up            # build + start
npm run docker:down          # stop
```
</details>

<details>
<summary><strong>▶ Local (no Docker)</strong></summary>

```bash
# Frontend
cd client
npm install
npm start

# Backend (separate terminal)
cd flask-server
poetry install
poetry run flask --app app run
```
</details>

---

---

## 💻 Usage

| Step | Action | Result |
|------|--------|--------|
| 1 | Choose language | Interface adapts instantly |
| 2 | Add ingredients | Fridge list builds with images |
| 3 | Launch search | Recipes fetched + cached |
| 4 | Swipe interface | Browse suggestions fluidly |
| 5 | Open details | Full metadata, scalable portions |
| 6 | Favorite | Stored in local favorites grid |

**Advanced:** Adjustable servings · Favorites persistence · Multi-language cache separation.

---

---

## 🛠 Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 19 · TypeScript · Anime.js · CSS Variables · Jest/RTL |
| Backend | Flask · BeautifulSoup4 · aiohttp · asyncio · deep-translator |
| Infra | Docker · Docker Compose · Poetry · npm |
| Quality | Structured logging · Automated tests on start · Caching tiers |

---

---

## 🏗 Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Client (React)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Language     │  │  Recipe      │  │  Favorites   │      │
│  │  Context      │  │  Cache       │  │  Manager     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│           │                  │                  │            │
│           └──────────────────┴──────────────────┘            │
│                              ▼                               │
│                    ┌──────────────────┐                      │
│                    │   API Client      │                      │
│                    └──────────────────┘                      │
└────────────────────────────┬────────────────────────────────┘
                              │ HTTP/JSON
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Flask Backend (Python)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Routes       │  │  Translator  │  │  Cache       │      │
│  │  /research    │  │  (i18n)      │  │  (Redis-like)│      │
│  │  /detailed    │  │              │  │              │      │
│  │  /ingredient  │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│           │                  │                  │            │
│           └──────────────────┴──────────────────┘            │
│                              ▼                               │
│                    ┌──────────────────┐                      │
│                    │   Marmiton       │                      │
│                    │   Scraper        │                      │
│                    └──────────────────┘                      │
└────────────────────────────┬────────────────────────────────┘
                              │ HTTP
                              ▼
                    ┌──────────────────┐
                    │   Marmiton.org   │
                    │   (Recipe Site)  │
                    └──────────────────┘
```

### Project Structure (Simplified)

```
find-me-a-recipe/
├── client/                    # React frontend
│   ├── public/
│   │   ├── index.html
│   │   └── manifest.json
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── FavoritesGrid.tsx
│   │   │   ├── FieldAddingIngredients.tsx
│   │   │   ├── FieldSearchRecipe.tsx
│   │   │   ├── FilterButton.tsx
│   │   │   ├── Fridge.tsx
│   │   │   ├── Ingredient.tsx
│   │   │   ├── LanguageSwitch.tsx
│   │   │   ├── Recipe.tsx
│   │   │   ├── ResponsiveButton.tsx
│   │   │   ├── SearchBarIngredients.tsx
│   │   │   ├── SwipeCard.tsx
│   │   │   └── index.ts
│   │   ├── contexts/          # React contexts
│   │   │   └── LanguageContext.tsx
│   │   ├── images/            # SVG assets
│   │   ├── pages/             # Page components
│   │   │   ├── HomePage.tsx
│   │   │   └── MainPage.tsx
│   │   ├── styles/            # CSS modules
│   │   │   ├── variables.css  # Design system tokens
│   │   │   └── *.css
│   │   ├── types/             # TypeScript types
│   │   ├── utils/             # Utility functions
│   │   │   ├── recipeCache.ts
│   │   │   └── logger.ts
│   │   ├── __tests__/         # Jest tests
│   │   └── App.tsx
│   └── package.json
├── flask-server/              # Flask backend
│   ├── app.py                 # Main Flask application
│   ├── marmiton.py            # Recipe scraper
│   ├── translator.py          # Translation module
│   ├── image_scraper.py       # Image fetcher
│   ├── test_app.py            # Backend tests
│   ├── Dockerfile
│   └── pyproject.toml         # Poetry dependencies
├── scripts/
│   ├── start.js               # Smart startup script
│   └── setup-poetry.sh        # Poetry installation
├── docker-compose.yml         # Docker orchestration
├── DESIGN_SYSTEM.md           # Design documentation
├── PERFORMANCE.md             # Performance optimizations
└── README.md                  # This file
```

---

## 🧪 Testing

### Run All Tests

```bash
# Frontend tests (Jest + React Testing Library)
cd client && npm test

# Backend tests (unittest)
cd flask-server && python test_app.py

# Or with Docker
docker-compose exec flask python test_app.py
```

### Coverage & Automation
Frontend (Jest): Components · Context · Utils. Backend (unittest): Routes · Translation · Image fetch. All executed automatically pre-start via `npm start`.

---

---

## 📚 API

<details>
<summary><strong>▶ REST Endpoints (expand)</strong></summary>

#### POST `/research_recipe`
Request:
```json
{"ingredients":["tomato","cheese"],"language":"en"}
```
Response (excerpt):
```json
{"recipes":[{"name":"Pasta Caprese","image":"https://...","rate":"4.5"}]}
```

#### POST `/detailed_recipe`
Request:
```json
{"recipe_name":"Pasta Caprese","language":"en"}
```

#### GET `/ingredient_image?query=tomato&language=en`
Returns an image URL or generated placeholder.

</details>

---

---

## 🎨 Design System

The app uses a centralized design system with CSS variables for consistency:

- **Colors**: Primary gradient, semantic colors
- **Typography**: Nunito font, 6 size scales
- **Spacing**: 4px-based system (8px, 16px, 24px, 32px, etc.)
- **Shadows**: 5 elevation levels
- **Animations**: Standardized transitions (200ms, 300ms, 400ms)

See [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) for details.

---

## ⚡ Performance

The app is optimized for speed:

- **Server-side caching**: 30min for searches, 1h for detailed recipes
- **Parallel image fetching**: ~10x faster with async/await
- **Client-side caching**: 30-minute TTL for recipes
- **Lazy loading**: Components load on demand

See [PERFORMANCE.md](PERFORMANCE.md) for technical details.

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Run tests**: `npm test` (frontend) and `python test_app.py` (backend)
5. **Commit**: `git commit -m "Add amazing feature"`
6. **Push**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Development Guidelines

- Write tests for new features
- Follow existing code style (TypeScript + ESLint)
- Update documentation as needed
- Keep commits atomic and well-described

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Thibault Nieuviarts**

- Email: thibault.nieuviarts@gmail.com
- GitHub: [@Fordann](https://github.com/Fordann)

---

## 🙏 Acknowledgments

- **Marmiton.org** for recipe data
- **Google Translate** for multilingual support
- **React** and **Flask** communities for excellent documentation
- All contributors who help improve this project

---

## 🗺 Roadmap

- [ ] Add more recipe sources (AllRecipes, BBC Good Food)
- [ ] User accounts and cloud-saved favorites
- [ ] Advanced filters (dietary restrictions, cuisine type)
- [ ] Meal planning calendar
- [ ] Shopping list generation
- [ ] Nutritional information
- [ ] Recipe ratings and reviews
- [ ] Social sharing features
- [ ] Mobile app (React Native)

---

<div align="center">

**Made with ❤️ and 🍝**

[⬆ Back to Top](#-find-me-a-recipe)

</div>
