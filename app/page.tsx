"use client";

import Feed from "./components/feed/Feed";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          Social Media Content Aggregator
        </h1>
        <Feed />
      </div>
    </main>
  );
}
