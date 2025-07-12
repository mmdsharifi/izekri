# Hisnul Muslim: Daily Adhkar

An interactive, gamified web app for learning, practicing, and memorizing daily Adhkar (supplications) from the book "Hisnul Muslim". Designed for all ages, with a Duolingo-inspired learning experience, beautiful UI, and full test coverage.

## Features

- 📚 **All Daily Adhkar**: Covers authentic morning, evening, and daily supplications with Arabic, translation, transliteration, and virtue.
- 🎮 **Learning Stages**: Multiple quiz stages (Learn, Translate, Scramble, Fill Gaps, Review) for each dhikr, inspired by Duolingo.
- 🏆 **Progress Tracking**: Your progress and scores are saved locally and shown per category.
- 💎 **Gamification**: Earn points (💎) for each correct answer and completed review.
- 🔊 **Audio Playback**: Listen to each dhikr in high-quality audio.
- 🌙 **Dark/Light Mode**: Fully responsive and theme-aware.
- 🧪 **100% Test Coverage**: All features and UI are covered by robust tests (Vitest + Testing Library).
- 🚀 **PWA**: Installable on mobile/desktop for offline use.
- 🌐 **RTL Support**: Full right-to-left (RTL) and Persian/Arabic font support.

## Tech Stack

- **React 19** + TypeScript
- **Vite** (build, dev, PWA)
- **Tailwind CSS** (utility-first styling)
- **Vitest** + **Testing Library** (unit/integration tests)
- **Netlify** (CI/CD & deployment)

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)

### Local Setup

```sh
npm install
npm run dev
```

App runs at [http://localhost:5173](http://localhost:5173) by default.

### Run Tests & Coverage

```sh
npm run test
npm run test -- --coverage
```

Open `coverage/lcov-report/index.html` for a full coverage report.

### Build for Production

```sh
npm run build
```

### Deploy (Netlify)

```sh
npm run deploy
```

Or use the CI/CD pipeline (see `deploy:ci` script).

Live app: https://iazkari.netlify.app

## Project Structure

- `App.tsx` — Main app logic, theme, routing, and state
- `components/` — All UI components and quiz stages
- `constants.ts` — All dhikr data and categories
- `types.ts` — TypeScript types
- `tests/` — All test files (co-located with components)
- `coverage/` — Test coverage reports

## Contribution

Pull requests are welcome! Please:

- Write tests for new features (aim for 100% coverage)
- Use clear commit messages
- Follow the existing code style (Prettier/Tailwind)

## License

This project is licensed under the **MIT License**.

You are free to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, as long as the original copyright and license notice appear in all copies.

See [LICENSE](LICENSE) for the full text.

---

**Hisnul Muslim: Daily Adhkar** — Interactive, beautiful, and open source for the Ummah.
