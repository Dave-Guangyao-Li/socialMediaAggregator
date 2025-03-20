"use client";

import { useEffect, useState } from "react";
import {
  FeedItem as FeedItemType,
  FeedFilters as FeedFiltersType,
} from "@/app/types/feed";
import { feedService } from "@/app/lib/api/feedService";
import FeedItem from "./FeedItem";
import FeedFilters from "./FeedFilters";

const ITEMS_PER_PAGE = 10;

export default function Feed() {
  const [items, setItems] = useState<FeedItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FeedFiltersType>({
    platforms: ["jsonplaceholder", "mastodon"],
    searchQuery: "",
    startDate: "",
    endDate: "",
  });

  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const paginatedItems = items.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const fetchFeed = async (currentFilters: FeedFiltersType) => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching feed with filters:", currentFilters);
      const data = await feedService.fetchFeed(currentFilters);
      console.log("Received feed data:", data);
      setItems(data);
      setCurrentPage(1); // Reset to first page when filters change
    } catch (err) {
      console.error("Error fetching feed:", err);
      setError("Failed to load feed items. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Filters changed:", filters);
    fetchFeed(filters);
  }, [filters]);

  const handleFiltersChange = (newFilters: Partial<FeedFiltersType>) => {
    console.log("Updating filters:", newFilters);
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of feed
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-4">
      <FeedFilters filters={filters} onFiltersChange={handleFiltersChange} />
      {error && <div className="text-red-500 p-4 text-center">{error}</div>}
      {loading ? (
        <div className="text-center p-4">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-center p-4 text-gray-500">
          No items found. Try adjusting your filters.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-4">
            {paginatedItems.map((item) => (
              <FeedItem key={item.id} item={item} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 py-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-md ${
                  currentPage === 1
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}>
                Previous
              </button>
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded-md ${
                        currentPage === page
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}>
                      {page}
                    </button>
                  )
                )}
              </div>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-md ${
                  currentPage === totalPages
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}>
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
