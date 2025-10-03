import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CardFace } from '../components/CardFace';
import { GradeBar } from '../components/GradeBar';
import { ProgressHeader } from '../components/ProgressHeader';
import { getDueCards, recordReview, type DueCard } from '../services/reviewService';
import type { Rating } from '../db/schema';

export function Review() {
  const navigate = useNavigate();
  const [cards, setCards] = useState<DueCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [sessionStats, setSessionStats] = useState({
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
  });

  useEffect(() => {
    loadCards();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyPress(e: KeyboardEvent) {
      if (loading || cards.length === 0) return;

      if (!revealed && e.key === ' ') {
        e.preventDefault();
        setRevealed(true);
      } else if (revealed) {
        const ratings: Record<string, Rating> = {
          '1': 'again',
          '2': 'hard',
          '3': 'good',
          '4': 'easy',
        };
        if (ratings[e.key]) {
          e.preventDefault();
          handleGrade(ratings[e.key]);
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [revealed, loading, cards]);

  async function loadCards() {
    try {
      const dueCards = await getDueCards();
      setCards(dueCards);
      if (dueCards.length === 0) {
        // No cards due, redirect to home
        setTimeout(() => navigate('/'), 1000);
      }
    } catch (error) {
      console.error('Failed to load due cards:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleReveal = useCallback(() => {
    if (!revealed) {
      setRevealed(true);
    }
  }, [revealed]);

  const handleGrade = useCallback(
    async (rating: Rating) => {
      if (!revealed || cards.length === 0) return;

      const currentCard = cards[currentIndex];
      const duration = Date.now() - startTime;

      try {
        await recordReview(currentCard.id, rating, duration);

        // Update session stats
        setSessionStats((prev) => ({
          ...prev,
          [rating]: prev[rating] + 1,
        }));

        // Move to next card
        if (currentIndex < cards.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setRevealed(false);
          setStartTime(Date.now());
        } else {
          // Session complete
          navigate('/results', {
            state: { stats: sessionStats, cardsReviewed: cards.length },
          });
        }
      } catch (error) {
        console.error('Failed to record review:', error);
      }
    },
    [revealed, cards, currentIndex, startTime, sessionStats, navigate]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading cards...</p>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No cards due!
          </h2>
          <p className="text-gray-600 mb-6">Great job! Come back later for more practice.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Progress Header */}
      <ProgressHeader
        current={currentIndex + 1}
        total={cards.length}
        dueCount={cards.length - currentIndex}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center items-center p-6">
        <div
          onClick={handleReveal}
          className="cursor-pointer w-full"
          role="button"
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === 'Enter') handleReveal();
          }}
        >
          <CardFace card={currentCard} revealed={revealed} direction="tl_to_en" />
        </div>

        {/* Grade Bar */}
        {revealed && (
          <div className="mt-6 w-full animate-fadeIn">
            <GradeBar onGrade={handleGrade} />
          </div>
        )}

        {/* Keyboard hints */}
        <div className="mt-6 text-center text-sm text-gray-500">
          {!revealed ? (
            <p>Press Space to reveal</p>
          ) : (
            <p>Press 1-4 to grade</p>
          )}
        </div>
      </div>
    </div>
  );
}
