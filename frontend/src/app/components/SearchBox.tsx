"use client";

import { useState } from "react";

interface SearchResult {
  question: string;
  answer: string;
  similarity: number;
  distance: number;
}

interface SearchResponse {
  success: boolean;
  results: SearchResult[];
  error?: string;
  details?: string;
}

export default function SearchBox() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) {
      setError("Please enter a question");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);
    setResults([]);

    try {
      const response = await fetch("/api/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: query.trim() }),
      });

      const data: SearchResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch results");
      }

      if (data.success && data.results) {
        setResults(data.results);
        // console.log("Search results:  searchBox.jsx", data.results);
        setSuccess(true);
      } else {
        throw new Error(data.error || "No results found");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatSimilarity = (similarity: number) => {
    return `${(similarity * 100).toFixed(1)}%`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          🏥 Healthcare Q/A Assistant
        </h1>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a healthcare question..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-6 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Searching...
                </div>
              ) : (
                "Search"
              )}
            </button>
          </div>
        </form>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <span className="text-xl">❌</span>
              <div>
                <h3 className="font-semibold">Error</h3>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success State */}
        {success && results.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-800 mb-4">
              <span className="text-xl">✅</span>
              <h2 className="text-xl font-semibold">
                Found {results.length} relevant answers
              </h2>
            </div>

            {results.map((result, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-6 border border-gray-200"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Q: {result.question}
                  </h3>
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {formatSimilarity(result.similarity)} match
                  </span>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  <strong>A:</strong> {result.answer}
                </p>
                <div className="mt-3 text-xs text-gray-500">
                  Distance: {result.distance.toFixed(4)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results State */}
        {success && results.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-500">
              <span className="text-4xl mb-4 block">🔍</span>
              <h3 className="text-lg font-semibold mb-2">
                No relevant answers found
              </h3>
              <p>Try rephrasing your question or ask something else.</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">
                Searching for healthcare answers...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
