import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllDecks, generateAutoDeck, deleteDeck, getCardCount } from '../services/deckService';
import type { Deck } from '../db/schema';

interface DeckWithCount extends Deck {
  cardCount: number;
}

export function Decks() {
  const navigate = useNavigate();
  const [decks, setDecks] = useState<DeckWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadDecks();
  }, []);

  async function loadDecks() {
    try {
      const allDecks = await getAllDecks();
      const decksWithCounts = await Promise.all(
        allDecks.map(async (deck) => ({
          ...deck,
          cardCount: await getCardCount(deck.id),
        }))
      );
      setDecks(decksWithCounts);
    } catch (error) {
      console.error('Failed to load decks:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateAutoDeck(difficulty?: 'beginner' | 'intermediate' | 'advanced') {
    setGenerating(true);
    try {
      await generateAutoDeck(difficulty);
      await loadDecks();
    } catch (error) {
      console.error('Failed to generate auto-deck:', error);
      alert('Failed to generate deck. Please try again.');
    } finally {
      setGenerating(false);
    }
  }

  async function handleDeleteDeck(deckId: string, deckName: string) {
    if (confirm(`Are you sure you want to delete "${deckName}"? This will delete all cards in this deck.`)) {
      try {
        await deleteDeck(deckId);
        await loadDecks();
      } catch (error) {
        console.error('Failed to delete deck:', error);
        alert('Failed to delete deck. Please try again.');
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading decks...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="text-indigo-600 hover:text-indigo-700 mb-4 flex items-center gap-2"
          >
            ← Back to Home
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Decks</h1>
        </div>

        {/* Generate Auto-Deck Section */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Generate Auto-Deck
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Create a deck of 50 unique Tagalog words from our word bank
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleGenerateAutoDeck('beginner')}
              disabled={generating}
              className="py-3 px-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg disabled:opacity-50"
            >
              Beginner
            </button>
            <button
              onClick={() => handleGenerateAutoDeck('intermediate')}
              disabled={generating}
              className="py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg disabled:opacity-50"
            >
              Intermediate
            </button>
            <button
              onClick={() => handleGenerateAutoDeck('advanced')}
              disabled={generating}
              className="py-3 px-4 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg disabled:opacity-50"
            >
              Advanced
            </button>
            <button
              onClick={() => handleGenerateAutoDeck()}
              disabled={generating}
              className="py-3 px-4 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg disabled:opacity-50"
            >
              Mixed
            </button>
          </div>
          {generating && (
            <p className="text-sm text-gray-500 mt-2">Generating deck...</p>
          )}
        </div>

        {/* Decks List */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Your Decks</h2>
          {decks.length === 0 ? (
            <div className="p-8 bg-white rounded-lg shadow text-center">
              <p className="text-gray-500">No decks yet. Generate an auto-deck to get started!</p>
            </div>
          ) : (
            decks.map((deck) => (
              <div
                key={deck.id}
                className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {deck.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {deck.cardCount} card{deck.cardCount !== 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Created {new Date(deck.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/deck/${deck.id}`)}
                      className="px-3 py-2 text-sm bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-medium rounded"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDeleteDeck(deck.id, deck.name)}
                      className="px-3 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 font-medium rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
