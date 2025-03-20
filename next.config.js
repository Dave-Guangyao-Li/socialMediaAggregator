/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      "images.unsplash.com",
      "via.placeholder.com",
      "randomuser.me",
      "avatars.githubusercontent.com",
      "source.unsplash.com",
      "avatars.dicebear.com",
      "mastodon.social",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "*.mastodon.social",
      },
    ],
  },
  // Configure environment variables
  env: {
    API_BASE_URL: process.env.API_BASE_URL || "http://localhost:8000",
    SOCKET_URL: process.env.SOCKET_URL || "http://localhost:8000",
  },
};

module.exports = nextConfig;
