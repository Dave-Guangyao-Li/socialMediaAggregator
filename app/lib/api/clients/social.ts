import { FeedItem, MediaItem, SocialPlatform } from "@/app/types/feed";

// Cache interface
interface Cache<T> {
  data: T;
  timestamp: number;
}

interface SocialClient {
  fetchPosts(
    query?: string,
    startTime?: string,
    endTime?: string
  ): Promise<FeedItem[]>;
}

// Helper function to format dates for consistent comparison
function formatDateForComparison(dateString?: string): string | null {
  if (!dateString || dateString === "") return null;
  // Format as YYYY-MM-DD for consistent string comparison
  return new Date(dateString).toISOString().split("T")[0];
}

// Helper to compare dates safely
function isDateInRange(
  testDate: string,
  startDate?: string,
  endDate?: string
): boolean {
  const testDateObj = new Date(testDate);
  const testDateFormatted = testDateObj.toISOString().split("T")[0];

  const startDateFormatted = formatDateForComparison(startDate);
  const endDateFormatted = formatDateForComparison(endDate);

  const isAfterStart =
    !startDateFormatted || testDateFormatted >= startDateFormatted;
  const isBeforeEnd =
    !endDateFormatted || testDateFormatted <= endDateFormatted;

  return isAfterStart && isBeforeEnd;
}

class JSONPlaceholderClient implements SocialClient {
  private baseUrl = "https://jsonplaceholder.typicode.com";
  private cache: Cache<FeedItem[]> | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private getRandomImage(seed: number): MediaItem[] {
    const categories = ["nature", "tech", "people", "architecture"];
    const category = categories[seed % categories.length];
    const imageId = (seed % 30) + 1; // Keep it between 1-30 for consistent images
    return [
      {
        url: `https://picsum.photos/id/${imageId}/800/600`,
        type: "image",
        thumbnailUrl: `https://picsum.photos/id/${imageId}/400/300`,
      },
    ];
  }

  private generateMockContent(post: any, user: any): string {
    const topics = [
      "AI and Machine Learning",
      "Web Development",
      "Mobile Apps",
      "Cloud Computing",
      "Cybersecurity",
    ];

    const hashtags = topics.map((t) => `#${t.replace(/\s+/g, "")}`);
    const selectedHashtags = hashtags
      .sort(() => Math.random() - 0.5)
      .slice(0, 2)
      .join(" ");

    return `${post.body}\n\n${selectedHashtags}`;
  }

  async fetchPosts(
    query?: string,
    startTime?: string,
    endTime?: string
  ): Promise<FeedItem[]> {
    try {
      console.log("JSONPlaceholder fetching with dates:", {
        startTime,
        endTime,
      });

      // Check cache for non-filtered requests
      if (
        this.cache &&
        Date.now() - this.cache.timestamp < this.CACHE_DURATION &&
        !query &&
        !startTime &&
        !endTime // Don't use cache for filtered searches
      ) {
        return this.cache.data;
      }

      const [postsRes, usersRes, commentsRes] = await Promise.all([
        fetch(`${this.baseUrl}/posts`),
        fetch(`${this.baseUrl}/users`),
        fetch(`${this.baseUrl}/comments`),
      ]);

      const [posts, users, comments] = await Promise.all([
        postsRes.json(),
        usersRes.json(),
        commentsRes.json(),
      ]);

      let items: FeedItem[] = posts.map((post: any, index: number) => {
        const user = users.find((u: any) => u.id === post.userId);
        const postComments = comments.filter((c: any) => c.postId === post.id);
        const seed = post.id + index;

        // Generate a deterministic date based on the post ID
        // This ensures consistent dates when filtering
        const daysAgo = (seed % 30) + (index % 7); // 0-36 days ago
        const postDate = new Date();
        postDate.setDate(postDate.getDate() - daysAgo);

        return {
          id: post.id.toString(),
          platform: "jsonplaceholder",
          content: this.generateMockContent(post, user),
          author: {
            id: user.id.toString(),
            name: user.name,
            username: user.username,
            profileImageUrl: `https://avatars.dicebear.com/api/human/${user.username}.svg`,
            platform: "jsonplaceholder",
          },
          createdAt: postDate.toISOString(),
          media: this.getRandomImage(seed),
          likes: Math.floor(Math.random() * 1000 + seed * 10),
          shares: Math.floor(Math.random() * 100 + seed * 5),
          comments: postComments.length,
          url: `https://jsonplaceholder.typicode.com/posts/${post.id}`,
          isBookmarked: false,
        };
      });

      // Apply text search filter if query exists
      if (query) {
        items = items.filter(
          (item) =>
            item.content.toLowerCase().includes(query.toLowerCase()) ||
            item.author.name.toLowerCase().includes(query.toLowerCase())
        );
      }

      // Apply date filtering
      if (startTime || endTime) {
        console.log("Filtering JSONPlaceholder by date range:", {
          startTime,
          endTime,
        });
        items = items.filter((item) =>
          isDateInRange(item.createdAt, startTime, endTime)
        );
        console.log(`After date filtering: ${items.length} items`);
      }

      // Update cache if this is not a filtered request
      if (!query && !startTime && !endTime) {
        this.cache = {
          data: items,
          timestamp: Date.now(),
        };
      }

      return items;
    } catch (error) {
      console.error("Error fetching JSONPlaceholder data:", error);
      // Return cached data if available, even if expired
      return this.cache?.data || [];
    }
  }
}

class MastodonClient implements SocialClient {
  private instance: string;
  private accessToken: string | null;
  private cache: Record<string, Cache<FeedItem[]>> = {};
  private readonly CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

  constructor() {
    this.instance =
      process.env.NEXT_PUBLIC_MASTODON_INSTANCE || "mastodon.social";
    this.accessToken = process.env.NEXT_PUBLIC_MASTODON_ACCESS_TOKEN || null;
    console.log("Mastodon client initialized with instance:", this.instance);
  }

  private getCacheKey(endpoint: string, params?: string): string {
    return `mastodon_${endpoint}_${params || ""}`;
  }

  async fetchPosts(
    query?: string,
    startTime?: string,
    endTime?: string
  ): Promise<FeedItem[]> {
    try {
      if (!this.accessToken) {
        console.warn(
          "No Mastodon access token available, returning empty array"
        );
        return [];
      }

      console.log("Fetching Mastodon posts with:", {
        query,
        startTime,
        endTime,
      });

      // Determine which endpoints to use based on the query
      const endpoints = query
        ? [
            `/api/v1/timelines/tag/${encodeURIComponent(query)}`,
            "/api/v1/timelines/home",
          ]
        : ["/api/v1/timelines/home", "/api/v1/timelines/public"];

      const results = await Promise.all(
        endpoints.map(async (endpoint) => {
          const params = new URLSearchParams();
          // NOTE: We don't pass date filters to the API because Mastodon's API
          // uses status IDs for pagination, not dates. We'll filter client-side.
          params.append("limit", "40");

          const cacheKey = this.getCacheKey(endpoint, params.toString());
          console.log(
            "Fetching from endpoint:",
            endpoint,
            "with params:",
            params.toString()
          );

          // Check cache only if not filtering
          if (
            !query &&
            !startTime &&
            !endTime &&
            this.cache[cacheKey] &&
            Date.now() - this.cache[cacheKey].timestamp < this.CACHE_DURATION
          ) {
            console.log("Using cached data for:", endpoint);
            return this.cache[cacheKey].data;
          }

          const url = `https://${this.instance}${endpoint}${
            params.toString() ? "?" + params.toString() : ""
          }`;
          console.log("Making request to:", url);

          const response = await fetch(url, {
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(
              `Failed to fetch from ${endpoint}:`,
              response.status,
              response.statusText,
              errorText
            );
            return [];
          }

          const posts = await response.json();
          console.log(`Received ${posts.length} posts from ${endpoint}`);

          const items = posts.map((post: any) => ({
            id: post.id,
            platform: "mastodon",
            content: post.content.replace(/<[^>]*>/g, ""),
            author: {
              id: post.account.id,
              name: post.account.display_name || post.account.username,
              username: post.account.username,
              profileImageUrl: post.account.avatar,
              platform: "mastodon",
            },
            createdAt: post.created_at,
            media: (post.media_attachments || []).map((media: any) => ({
              url: media.url,
              type: media.type === "image" ? "image" : "video",
              thumbnailUrl: media.preview_url,
            })),
            likes: post.favourites_count || 0,
            shares: post.reblogs_count || 0,
            comments: post.replies_count || 0,
            url: post.url,
            isBookmarked: false,
          }));

          // Cache only if not filtering
          if (!query && !startTime && !endTime) {
            this.cache[cacheKey] = {
              data: items,
              timestamp: Date.now(),
            };
          }

          return items;
        })
      );

      // Combine and deduplicate results
      const allPosts = results.flat();
      const uniquePosts = Array.from(
        new Map(allPosts.map((post) => [post.id, post])).values()
      );

      // Apply filters
      let filteredPosts = uniquePosts;

      // Apply text search if query exists
      if (query) {
        const searchTerms = query.toLowerCase().split(/\s+/);
        filteredPosts = filteredPosts.filter((post) => {
          const content = post.content.toLowerCase();
          const authorName = post.author.name.toLowerCase();
          const authorUsername = post.author.username.toLowerCase();
          return searchTerms.every(
            (term) =>
              content.includes(term) ||
              authorName.includes(term) ||
              authorUsername.includes(term)
          );
        });
      }

      // Apply date filtering client-side
      if (startTime || endTime) {
        console.log("Filtering Mastodon by date range:", {
          startTime,
          endTime,
        });
        filteredPosts = filteredPosts.filter((post) =>
          isDateInRange(post.createdAt, startTime, endTime)
        );
        console.log(`After date filtering: ${filteredPosts.length} posts`);
      }

      // Sort by date
      filteredPosts.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      console.log("Total filtered posts:", filteredPosts.length);
      return filteredPosts;
    } catch (error) {
      console.error("Error fetching Mastodon data:", error);
      return [];
    }
  }
}

// Export instances
export const jsonPlaceholderClient = new JSONPlaceholderClient();
export const mastodonClient = new MastodonClient();
