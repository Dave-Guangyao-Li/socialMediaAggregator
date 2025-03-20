import { NextRequest, NextResponse } from "next/server";
import {
  jsonPlaceholderClient,
  mastodonClient,
} from "@/app/lib/api/clients/social";
import { FeedItem } from "@/app/types/feed";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query") || undefined;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;
    const platforms = searchParams.get("platforms")?.split(",") || [
      "jsonplaceholder",
      "mastodon",
    ];

    console.log("Feed API request:", {
      query,
      startDate,
      endDate,
      platforms,
    });

    const clientMap = {
      jsonplaceholder: jsonPlaceholderClient,
      mastodon: mastodonClient,
    };

    const selectedClients = platforms
      .filter((p): p is keyof typeof clientMap => p in clientMap)
      .map((p) => clientMap[p]);

    console.log(
      "Selected clients:",
      selectedClients.map((c) => c.constructor.name)
    );

    const results = await Promise.all(
      selectedClients.map(async (client) => {
        try {
          const posts = await client.fetchPosts(query, startDate, endDate);
          console.log(
            `Received ${posts.length} posts from ${client.constructor.name}`
          );
          return posts;
        } catch (error) {
          console.error(
            `Error fetching from ${client.constructor.name}:`,
            error
          );
          return [];
        }
      })
    );

    const allPosts = results
      .flat()
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    console.log(`Total posts: ${allPosts.length}`);
    return NextResponse.json(allPosts);
  } catch (error) {
    console.error("Error in feed API:", error);
    return NextResponse.json(
      { error: "Failed to fetch feed data" },
      { status: 500 }
    );
  }
}
