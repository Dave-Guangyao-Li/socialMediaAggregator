# Social Media Content Aggregator

## Project Background

### Why This Project?

In the current social media landscape, users often need to switch between multiple platforms to stay updated. This project addresses several key challenges:

1. **API Accessibility Crisis**

   - Twitter's API becoming increasingly restrictive and expensive
   - Need for alternative data sources that are developer-friendly
   - Opportunity to showcase integration with open-source platforms

2. **Technical Learning Objectives**

   - Implement real-world API integrations with rate limiting and error handling
   - Manage complex state across multiple data sources
   - Handle real-time updates and data synchronization
   - Optimize performance for large datasets

3. **Architecture Evolution**
   - Started with a simple fetch-based approach
   - Evolved to handle complex caching and state management
   - Implemented robust error handling and retry mechanisms

## Technical Architecture

### Project Structure

```
app/
├── components/
│   └── feed/
│       ├── Feed.tsx           # Main feed component
│       ├── FeedItem.tsx       # Individual post component
│       └── FeedFilters.tsx    # Filter interface
├── lib/
│   ├── api/
│   │   ├── clients/
│   │   │   └── social.ts      # Platform-specific clients
│   │   └── feedService.ts     # Unified feed service
│   └── store/
│       └── feedStore.ts       # Global state management
└── types/
    └── feed.ts               # TypeScript interfaces
```

### Key Technical Challenges & Solutions

1. **Complex State Management** (`app/lib/store/feedStore.ts`)

   - Challenge: Managing filter state, pagination, and cached data across platforms
   - Solution: Implemented Zustand with middleware for persistence and debugging

   ```typescript
   // app/lib/store/feedStore.ts
   export const useFeedStore = create<FeedStore>()(
     devtools(
       persist(
         (set) => ({
           items: [],
           filters: initialFilters,
           setFilters: (newFilters) =>
             set((state) => ({
               filters: { ...state.filters, ...newFilters },
               items: [], // Reset items on filter change
             })),
           // Optimistic updates for better UX
           toggleBookmark: (itemId) =>
             set((state) => ({
               items: state.items.map((item) =>
                 item.id === itemId
                   ? { ...item, isBookmarked: !item.isBookmarked }
                   : item
               ),
             })),
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
   ```

2. **API Integration & Error Handling** (`app/lib/api/clients/social.ts`)

   - Challenge: Different API structures, rate limits, and error formats
   - Solution: Implemented modular client architecture with unified error handling

   ```typescript
   // app/lib/api/clients/social.ts
   class MastodonClient implements SocialClient {
     private retryCount = 3;
     private retryDelay = 1000;

     async fetchPosts(query?: string): Promise<FeedItem[]> {
       for (let attempt = 1; attempt <= this.retryCount; attempt++) {
         try {
           const endpoints = this.getEndpoints(query);
           const results = await Promise.all(
             endpoints.map(async (endpoint) => {
               const response = await this.fetchWithTimeout(endpoint);
               if (!response.ok) {
                 throw new Error(`HTTP error! status: ${response.status}`);
               }
               return this.transformResponse(await response.json());
             })
           );
           return this.deduplicateResults(results.flat());
         } catch (error) {
           if (attempt === this.retryCount) throw error;
           await this.delay(this.retryDelay * attempt);
         }
       }
       return [];
     }
   }
   ```

3. **Performance Optimization Journey**

   a. **From Infinite Scroll to Pagination** (`app/components/feed/Feed.tsx`)

   - Initial approach: Infinite scroll with dynamic loading
   - Problems encountered:
     - Memory issues with large datasets
     - Complex state management for scroll position
     - Difficult to implement "jump to date" feature
   - Final solution: Smart pagination with configurable page size

   ```typescript
   // app/components/feed/Feed.tsx
   export default function Feed() {
     const [currentPage, setCurrentPage] = useState(1);
     const ITEMS_PER_PAGE = 10;

     // Efficient pagination with memoization
     const paginatedItems = useMemo(
       () =>
         items.slice(
           (currentPage - 1) * ITEMS_PER_PAGE,
           currentPage * ITEMS_PER_PAGE
         ),
       [items, currentPage]
     );

     // Optimized page navigation
     const handlePageChange = useCallback((page: number) => {
       setCurrentPage(page);
       window.scrollTo({ top: 0, behavior: "smooth" });
     }, []);
   }
   ```

   b. **Smart Caching Implementation** (`app/lib/api/clients/social.ts`)

   - Evolution of caching strategy:
     1. Simple in-memory cache
     2. Platform-specific cache durations
     3. Intelligent cache invalidation

   ```typescript
   // app/lib/api/clients/social.ts
   interface Cache<T> {
     data: T;
     timestamp: number;
     query?: string;
   }

   class JSONPlaceholderClient implements SocialClient {
     private cache: Record<string, Cache<FeedItem[]>> = {};
     private readonly CACHE_DURATION = 5 * 60 * 1000;

     private getCacheKey(query?: string, filters?: FilterOptions): string {
       return JSON.stringify({ query, filters });
     }

     private isValidCache(cache: Cache<FeedItem[]>, query?: string): boolean {
       return (
         Date.now() - cache.timestamp < this.CACHE_DURATION &&
         (!query || cache.query === query)
       );
     }

     async fetchPosts(query?: string): Promise<FeedItem[]> {
       const cacheKey = this.getCacheKey(query);
       const cachedData = this.cache[cacheKey];

       if (cachedData && this.isValidCache(cachedData, query)) {
         return cachedData.data;
       }

       // Fetch and cache logic
     }
   }
   ```

4. **Rate Limiting and Protection** (`app/lib/api/feedService.ts`)

   - Implemented token bucket algorithm for rate limiting
   - Added request queuing for concurrent calls

   ```typescript
   // app/lib/api/feedService.ts
   class RateLimiter {
     private tokens: number;
     private lastRefill: number;
     private queue: Array<() => Promise<void>> = [];

     async acquireToken(): Promise<void> {
       if (this.tokens > 0) {
         this.tokens--;
         return Promise.resolve();
       }

       return new Promise((resolve) => {
         this.queue.push(async () => {
           this.tokens--;
           resolve();
         });
       });
     }
   }
   ```

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Mastodon account and API access token

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/social-media-aggregator.git
   cd social-media-aggregator
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env.local` file:

   ```env
   NEXT_PUBLIC_MASTODON_INSTANCE=mastodon.social
   NEXT_PUBLIC_MASTODON_ACCESS_TOKEN=your_access_token
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Configuration

### Mastodon Setup

1. Go to your Mastodon instance (e.g., https://mastodon.social)
2. Navigate to Settings > Development
3. Create a new application
4. Required permissions: read:statuses
5. Copy the access token to your `.env.local` file

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

## Future Enhancements

### Planned Technical Improvements

1. **Real-time Updates**

   - WebSocket integration for live feed updates
   - Server-Sent Events for efficient one-way communication
   - Optimistic UI updates for better UX

2. **Backend Features**

   - Node.js/Express server for better rate limiting
   - MongoDB for persistent storage
   - Redis for distributed caching

3. **Authentication & Authorization**
   - JWT-based authentication
   - Role-based access control
   - OAuth integration for social login

## Current Limitations

1. **Technical Constraints**

   - No real-time updates (WebSocket implementation pending)
   - Limited to client-side caching
   - No server-side rendering for dynamic content

2. **Platform Limitations**
   - JSONPlaceholder provides static data only
   - Mastodon API rate limits per instance
   - No cross-platform content correlation

## License

MIT
