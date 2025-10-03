import { ulid } from 'ulid';
import { db } from '../db/schema';
import type { Deck, Card } from '../db/schema';
import { WORD_BANK } from '../data/wordbank';
import { initializeReviewState } from '../lib/srs';

export async function createDeck(name: string): Promise<Deck> {
  const deck: Deck = {
    id: ulid(),
    name,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  await db.decks.add(deck);
  return deck;
}

export async function getAllDecks(): Promise<Deck[]> {
  return db.decks.orderBy('updatedAt').reverse().toArray();
}

export async function getDeck(id: string): Promise<Deck | undefined> {
  return db.decks.get(id);
}

export async function updateDeck(id: string, name: string): Promise<void> {
  await db.decks.update(id, { name, updatedAt: new Date() });
}

export async function deleteDeck(id: string): Promise<void> {
  // Delete all cards in the deck
  const cards = await db.cards.where('deckId').equals(id).toArray();
  const cardIds = cards.map(c => c.id);

  // Delete review states and logs for those cards
  await db.reviewStates.bulkDelete(cardIds);
  await db.reviewLogs.where('cardId').anyOf(cardIds).delete();

  // Delete cards and deck
  await db.cards.where('deckId').equals(id).delete();
  await db.decks.delete(id);
}

/**
 * Generate an auto-deck with 50 unique words
 */
export async function generateAutoDeck(
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
): Promise<Deck> {
  // Get all existing cards to avoid duplicates
  const existingCards = await db.cards.toArray();
  const existingWords = new Set(existingCards.map(c => c.front.toLowerCase()));

  // Filter word bank based on difficulty and existing words
  let availableWords = WORD_BANK.filter(
    w => !existingWords.has(w.tagalog.toLowerCase())
  );

  if (difficulty) {
    availableWords = availableWords.filter(w => w.difficulty === difficulty);
  }

  // Shuffle and take 50 words
  const shuffled = availableWords.sort(() => Math.random() - 0.5);
  const selectedWords = shuffled.slice(0, Math.min(50, shuffled.length));

  // Create deck with counter for duplicates
  const baseName = difficulty
    ? `Auto-Deck (${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)})`
    : 'Auto-Deck (Mixed)';

  // Check for existing decks with same base name and add counter
  const existingDecks = await db.decks.toArray();
  const sameNameDecks = existingDecks.filter(d =>
    d.name.startsWith(baseName)
  );

  const deckName = sameNameDecks.length > 0
    ? `${baseName} (${sameNameDecks.length + 1})`
    : baseName;

  const deck = await createDeck(deckName);

  // Create cards
  for (const word of selectedWords) {
    await createCard(deck.id, {
      front: word.tagalog,
      back: word.english,
      pos: word.pos,
    });
  }

  return deck;
}

/**
 * Get count of cards in a deck
 */
export async function getCardCount(deckId: string): Promise<number> {
  return db.cards.where('deckId').equals(deckId).count();
}

interface CreateCardData {
  front: string;
  back: string;
  pos?: string;
  example?: string;
  note?: string;
  audioUrl?: string;
}

export async function createCard(deckId: string, data: CreateCardData): Promise<Card> {
  const card: Card = {
    id: ulid(),
    deckId,
    front: data.front.trim(),
    back: data.back.trim(),
    pos: data.pos?.trim(),
    example: data.example?.trim(),
    note: data.note?.trim(),
    audioUrl: data.audioUrl,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.cards.add(card);
  await db.reviewStates.add(initializeReviewState(card.id));

  return card;
}

export async function getCardsForDeck(deckId: string): Promise<Card[]> {
  return db.cards.where('deckId').equals(deckId).toArray();
}

export async function updateCard(id: string, data: Partial<CreateCardData>): Promise<void> {
  await db.cards.update(id, { ...data, updatedAt: new Date() });
}

export async function deleteCard(id: string): Promise<void> {
  await db.reviewStates.delete(id);
  await db.reviewLogs.where('cardId').equals(id).delete();
  await db.cards.delete(id);
}

export async function bulkImportCards(deckId: string, cards: CreateCardData[]): Promise<void> {
  for (const cardData of cards) {
    await createCard(deckId, cardData);
  }
}
