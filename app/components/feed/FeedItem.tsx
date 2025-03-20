"use client";

import Image from "next/image";
import { FeedItem as FeedItemType } from "@/app/types/feed";
import { useFeedStore } from "@/app/lib/store/feedStore";
import { feedService } from "@/app/lib/api/feedService";

interface FeedItemProps {
  item: FeedItemType;
}

export default function FeedItem({ item }: FeedItemProps) {
  const toggleBookmark = useFeedStore((state) => state.toggleBookmark);

  const handleBookmarkClick = async () => {
    try {
      await feedService.toggleBookmark(item.id, !!item.isBookmarked);
      toggleBookmark(item.id);
    } catch (error) {
      console.error("Failed to toggle bookmark:", error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-start gap-3">
        {item.author.profileImageUrl && (
          <Image
            src={item.author.profileImageUrl}
            alt={item.author.name}
            width={40}
            height={40}
            className="rounded-full"
          />
        )}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{item.author.name}</h3>
              <p className="text-sm text-gray-500">@{item.author.username}</p>
            </div>
            <button
              onClick={handleBookmarkClick}
              className="text-gray-500 hover:text-gray-700">
              {item.isBookmarked ? "🔖" : "📑"}
            </button>
          </div>
          <p className="mt-2">{item.content}</p>
          {item.media && item.media.length > 0 && (
            <div className="mt-3 grid gap-2 grid-cols-2">
              {item.media.map((media, index) => (
                <div key={index} className="relative aspect-video">
                  {media.type === "image" ? (
                    <Image
                      src={media.url}
                      alt=""
                      fill
                      className="object-cover rounded"
                    />
                  ) : (
                    <video
                      src={media.url}
                      controls
                      className="w-full h-full rounded"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
            <span>❤️ {item.likes}</span>
            <span>🔁 {item.shares}</span>
            <span>💬 {item.comments}</span>
            <span className="ml-auto text-xs">
              {new Date(item.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
