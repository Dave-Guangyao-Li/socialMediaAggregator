// export type SocialPlatform = "twitter" | "facebook" | "instagram" | "linkedin";
export type SocialPlatform = "jsonplaceholder" | "mastodon";
export interface MediaItem {
  url: string;
  type: "image" | "video";
  thumbnailUrl?: string;
}

export interface Author {
  id: string;
  name: string;
  username: string;
  profileImageUrl?: string;
  platform: SocialPlatform;
}

export interface FeedItem {
  id: string;
  platform: SocialPlatform;
  content: string;
  author: Author;
  createdAt: string;
  media?: MediaItem[];
  likes: number;
  shares: number;
  comments: number;
  url: string;
  isBookmarked?: boolean;
}

export interface FeedState {
  items: FeedItem[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

export interface FeedFilters {
  platforms: SocialPlatform[];
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
}
