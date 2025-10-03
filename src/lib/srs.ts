import type { Rating, ReviewState } from '../db/schema';

export interface SM2Config {
  easeFactorStart: number;
  easeFactorFloor: number;
  learningStepsMinutes: number[];
  graduatingIntervalDays: number;
  lapsePenalty: number;
  leechThreshold: number;
}

export const DEFAULT_SM2_CONFIG: SM2Config = {
  easeFactorStart: 2.5,
  easeFactorFloor: 1.3,
  learningStepsMinutes: [1, 10],
  graduatingIntervalDays: 1,
  lapsePenalty: -0.2,
  leechThreshold: 8,
};

export interface ReviewResult {
  intervalDays: number;
  easeFactor: number;
  repetition: number;
  dueAt: Date;
  lapseCount: number;
  isLeech: boolean;
}

/**
 * SM-2 spaced repetition algorithm
 * @param state Current review state
 * @param rating User's rating (again/hard/good/easy)
 * @param config SM-2 configuration
 * @returns Updated review state
 */
export function calculateNextReview(
  state: ReviewState,
  rating: Rating,
  config: SM2Config = DEFAULT_SM2_CONFIG
): ReviewResult {
  const now = new Date();
  let { intervalDays, easeFactor, repetition, lapseCount } = state;

  // Handle failure (Again)
  if (rating === 'again') {
    lapseCount++;
    repetition = 0;
    intervalDays = config.learningStepsMinutes[0] / (24 * 60); // Convert minutes to days
    easeFactor = Math.max(
      config.easeFactorFloor,
      easeFactor + config.lapsePenalty
    );
  }
  // Handle learning phase
  else if (repetition === 0) {
    if (rating === 'good') {
      repetition = 1;
      intervalDays = config.graduatingIntervalDays;
    } else if (rating === 'easy') {
      repetition = 1;
      intervalDays = config.graduatingIntervalDays * 1.5;
      easeFactor = Math.min(2.7, easeFactor + 0.15);
    } else if (rating === 'hard') {
      intervalDays = config.learningStepsMinutes[1] / (24 * 60);
    }
  }
  // Handle review phase
  else {
    repetition++;

    if (rating === 'hard') {
      easeFactor = Math.max(config.easeFactorFloor, easeFactor - 0.15);
      intervalDays = Math.max(1, intervalDays * 1.2);
    } else if (rating === 'good') {
      intervalDays = intervalDays * easeFactor;
    } else if (rating === 'easy') {
      easeFactor = Math.min(2.7, easeFactor + 0.15);
      intervalDays = intervalDays * easeFactor * 1.3;
    }
  }

  // Round interval and calculate due date
  intervalDays = Math.round(intervalDays * 10) / 10;
  const dueAt = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);

  return {
    intervalDays,
    easeFactor,
    repetition,
    dueAt,
    lapseCount,
    isLeech: lapseCount >= config.leechThreshold,
  };
}

/**
 * Initialize review state for a new card
 */
export function initializeReviewState(cardId: string): ReviewState {
  return {
    cardId,
    intervalDays: 0,
    easeFactor: DEFAULT_SM2_CONFIG.easeFactorStart,
    repetition: 0,
    dueAt: new Date(),
    lapseCount: 0,
  };
}
