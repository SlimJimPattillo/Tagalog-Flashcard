# TagalogFlash MVP

A mobile-first PWA for learning Tagalog vocabulary using spaced repetition (SM-2 algorithm).

## Features

- ✅ **Spaced Repetition** - SM-2 algorithm for optimal memory retention
- ✅ **Auto-Generated Decks** - 500+ word bank with beginner, intermediate, and advanced levels
- ✅ **Offline-First** - All data stored locally with IndexedDB
- ✅ **Mobile-Optimized** - Touch-friendly interface with responsive design
- ✅ **Keyboard Shortcuts** - Space to reveal, 1-4 to grade
- ✅ **Progress Tracking** - Daily stats and recall distribution
- ✅ **Leech Detection** - Identifies difficult cards that need extra practice

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Database**: IndexedDB via Dexie
- **Routing**: React Router
- **PWA**: Manifest + Service Worker ready

## Getting Started

### Install Dependencies
```bash
npm install
```

### Development
```bash
npm run dev
```
Then open http://localhost:5173

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── CardFace.tsx
│   ├── GradeBar.tsx
│   ├── ProgressHeader.tsx
│   └── StatTile.tsx
├── data/            # Seed data
│   └── wordbank.ts  # 500 Tagalog words
├── db/              # Database layer
│   └── schema.ts    # Dexie schema and types
├── lib/             # Core logic
│   └── srs.ts       # SM-2 algorithm
├── pages/           # Route pages
│   ├── Home.tsx
│   ├── Review.tsx
│   ├── Decks.tsx
│   ├── Results.tsx
│   └── Settings.tsx
├── services/        # Business logic
│   ├── deckService.ts
│   └── reviewService.ts
└── App.tsx          # Root component with routing
```

## Usage

### 1. Generate a Deck
- Go to **Decks** page
- Click one of the difficulty buttons (Beginner, Intermediate, Advanced, or Mixed)
- This creates a deck with 50 unique words

### 2. Review Cards
- From the **Home** page, click **Start Review**
- Tap or press **Space** to reveal the answer
- Grade yourself using the buttons or keys **1-4**:
  - **1 (Again)** - Forgot the word
  - **2 (Hard)** - Remembered with difficulty
  - **3 (Good)** - Remembered correctly
  - **4 (Easy)** - Remembered easily

### 3. Track Progress
- View daily stats on the Home page
- Check recall distribution
- Monitor leech cards (difficult words)

## Keyboard Shortcuts

- **Space** - Reveal card answer
- **1** - Grade as "Again"
- **2** - Grade as "Hard"
- **3** - Grade as "Good"
- **4** - Grade as "Easy"

## Spaced Repetition Algorithm

This app uses a variant of the SM-2 algorithm with the following defaults:

- **Starting Ease Factor**: 2.5
- **Ease Factor Floor**: 1.3
- **Learning Steps**: 1 min, 10 min
- **Graduating Interval**: 1 day
- **Lapse Penalty**: -0.2 EF
- **Leech Threshold**: 8 lapses

## Data Storage

All data is stored locally in your browser using IndexedDB:
- **Decks** - Your created decks
- **Cards** - Flashcards with front/back and optional fields
- **Review States** - Scheduling data (intervals, ease factors, due dates)
- **Review Logs** - History of your reviews

## Future Enhancements

- Cloud sync and backup
- Audio pronunciation
- Typing mode for active recall
- Reverse practice (English → Tagalog)
- Streaks and gamification
- Community shared decks
- Grammar and phrases

## License

MIT
