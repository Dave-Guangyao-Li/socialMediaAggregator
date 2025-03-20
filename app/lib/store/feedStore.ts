import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import {
  FeedState,
  FeedItem,
  FeedFilters,
  SocialPlatform,
} from "@/app/types/feed";

interface FeedStore extends FeedState {
  filters: FeedFilters;
  setFilters: (filters: Partial<FeedFilters>) => void;
  setItems: (items: FeedItem[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  toggleBookmark: (itemId: string) => void;
  clearItems: () => void;
}

const initialFilters: FeedFilters = {
  platforms: ["jsonplaceholder", "mastodon"],
  startDate: undefined,
  endDate: undefined,
  searchQuery: undefined,
};

export const useFeedStore = create<FeedStore>()(
  devtools(
    persist(
      (set) => ({
        items: [],
        isLoading: false,
        error: null,
        lastUpdated: null,
        filters: initialFilters,

        setFilters: (newFilters) =>
          set((state) => ({
            filters: { ...state.filters, ...newFilters },
            items: [], // Clear items when filters change
          })),

        setItems: (newItems) =>
          set((state) => ({
            items: newItems,
            lastUpdated: new Date().toISOString(),
          })),

        setLoading: (isLoading) => set({ isLoading }),

        setError: (error) => set({ error }),

        toggleBookmark: (itemId) =>
          set((state) => ({
            items: state.items.map((item) =>
              item.id === itemId
                ? { ...item, isBookmarked: !item.isBookmarked }
                : item
            ),
          })),

        clearItems: () =>
          set({
            items: [],
            lastUpdated: null,
          }),
      }),
      {
        name: "feed-storage",
        partialize: (state) => ({
          items: state.items.filter((item) => item.isBookmarked),
          filters: state.filters,
        }),
      }
    )
  )
);
