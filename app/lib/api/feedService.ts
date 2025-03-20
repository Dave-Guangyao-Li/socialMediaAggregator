import { FeedItem, FeedFilters, SocialPlatform } from "@/app/types/feed";
import { jsonPlaceholderClient, mastodonClient } from "./clients/social";

class FeedService {
  private baseUrl: string;

  constructor() {
    this.baseUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
  }

  async fetchFeed(filters: FeedFilters): Promise<FeedItem[]> {
    try {
      console.log("Fetching feed with filters:", filters);
      const allPosts: FeedItem[] = [];

      // Format date strings for consistent API calls
      const formattedStartDate = filters.startDate || undefined;
      const formattedEndDate = filters.endDate || undefined;

      console.log("Formatted date range:", {
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      });

      // Fetch from selected platforms in parallel
      const promises = filters.platforms.map(async (platform) => {
        console.log(`Fetching from platform: ${platform} with dates:`, {
          startDate: formattedStartDate,
          endDate: formattedEndDate,
        });

        try {
          switch (platform) {
            case "jsonplaceholder":
              return await jsonPlaceholderClient.fetchPosts(
                filters.searchQuery,
                formattedStartDate,
                formattedEndDate
              );
            case "mastodon":
              return await mastodonClient.fetchPosts(
                filters.searchQuery,
                formattedStartDate,
                formattedEndDate
              );
            default:
              console.log(`Unknown platform: ${platform}`);
              return [];
          }
        } catch (error) {
          console.error(`Error fetching from ${platform}:`, error);
          return [];
        }
      });

      const results = await Promise.all(promises);
      results.forEach((posts, index) => {
        console.log(
          `Received ${posts.length} posts from ${filters.platforms[index]}`
        );
        allPosts.push(...posts);
      });

      // Sort all posts by date
      const sortedPosts = allPosts.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      console.log(`Total posts after sorting: ${sortedPosts.length}`);
      return sortedPosts;
    } catch (error) {
      console.error("Error fetching feed:", error);
      throw error;
    }
  }

  async refreshPlatformData(platform: SocialPlatform): Promise<void> {
    // This is a no-op for these platforms as they don't need manual refresh
    return Promise.resolve();
  }

  async toggleBookmark(itemId: string, isBookmarked: boolean): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/bookmarks/${itemId}`, {
        method: isBookmarked ? "DELETE" : "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to update bookmark");
      }
    } catch (error) {
      console.error("Error updating bookmark:", error);
      throw error;
    }
  }
}

export const feedService = new FeedService();
