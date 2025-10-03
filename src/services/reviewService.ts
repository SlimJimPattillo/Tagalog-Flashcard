import { ulid } from 'ulid';
import { db } from '../db/schema';
import type { Card, ReviewState, ReviewLog, Rating } from '../db/schema';
import { calculateNextReview } from '../lib/srs';

export interface DueCard extends Card {
  reviewState: ReviewState;
}

/**
 * Get all cards due for review
 */
export async function getDueCards(): Promise<DueCard[]> {
  const now = new Date();
  const dueStates = await db.reviewStates.where('dueAt').belowOrEqual(now).toArray();

  const cards: DueCard[] = [];
  for (const state of dueStates) {
    const card = await db.cards.get(state.cardId);
    if (card) {
      cards.push({ ...card, reviewState: state });
    }
  }

  return cards;
}

/**
 * Get count of cards due today
 */
export async function getDueCount(): Promise<number> {
  const now = new Date();
  return db.reviewStates.where('dueAt').belowOrEqual(now).count();
}

/**
 * Record a review and update the card's review state
 */
export async function recordReview(
  cardId: string,
  rating: Rating,
  durationMs?: number
): Promise<void> {
  const state = await db.reviewStates.get(cardId);
  if (!state) {
    throw new Error('Review state not found for card');
  }

  // Calculate next review
  const result = calculateNextReview(state, rating);

  // Update review state
  await db.reviewStates.update(cardId, {
    intervalDays: result.intervalDays,
    easeFactor: result.easeFactor,
    repetition: result.repetition,
    dueAt: result.dueAt,
    lapseCount: result.lapseCount,
  });

  // Log the review
  const log: ReviewLog = {
    id: ulid(),
    cardId,
    reviewedAt: new Date(),
    rating,
    durationMs,
  };
  await db.reviewLogs.add(log);
}

/**
 * Get review statistics for today
 */
export interface TodayStats {
  reviewed: number;
  againCount: number;
  hardCount: number;
  goodCount: number;
  easyCount: number;
  leechCount: number;
}

export async function getTodayStats(): Promise<TodayStats> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const logs = await db.reviewLogs
    .where('reviewedAt')
    .aboveOrEqual(today)
    .toArray();

  const stats: TodayStats = {
    reviewed: logs.length,
    againCount: 0,
    hardCount: 0,
    goodCount: 0,
    easyCount: 0,
    leechCount: 0,
  };

  for (const log of logs) {
    if (log.rating === 'again') stats.againCount++;
    else if (log.rating === 'hard') stats.hardCount++;
    else if (log.rating === 'good') stats.goodCount++;
    else if (log.rating === 'easy') stats.easyCount++;
  }

  // Count leeches (cards with high lapse count)
  const allStates = await db.reviewStates.toArray();
  stats.leechCount = allStates.filter(s => s.lapseCount >= 8).length;

  return stats;
}

/**
 * Get leeches (difficult cards with many lapses)
 */
export async function getLeeches(): Promise<DueCard[]> {
  const states = await db.reviewStates.where('lapseCount').aboveOrEqual(8).toArray();

  const cards: DueCard[] = [];
  for (const state of states) {
    const card = await db.cards.get(state.cardId);
    if (card) {
      cards.push({ ...card, reviewState: state });
    }
  }

  return cards;
}
