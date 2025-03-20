# Social Media Content Aggregator

A real-time social media content aggregator that collects posts from various platforms and displays them in a personalized, real-time dashboard.

## Features

- **Data Aggregation**: Pull data from public APIs (Twitter, Reddit, or mock APIs)
- **Personalized Feeds**: Customize content preferences with keywords, tags, and sources
- **Real-Time Updates**: WebSockets for live and responsive feed updates
- **Performance Optimization**: Lazy loading and virtualization for smooth scrolling
- **Data Caching**: Local storage and IndexedDB for reduced API calls
- **Search and Filter**: Search within aggregated feeds and filter by source/keyword
- **Theme Support**: Light and dark themes with responsive design

## Tech Stack

- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: Node.js, Express, MongoDB
- **Real-Time Updates**: Socket.IO
- **Caching**: IndexedDB with local storage fallback
- **Performance**: Lazy loading, virtualized lists (react-window)
- **State Management**: Zustand

## Project Structure

```
/socialMediaAggregator
  /app             # Next.js app directory
    /api           # Client-side API routes
    /components    # React components
    /hooks         # Custom React hooks
    /lib           # Utilities and libraries
    /styles        # Global styles
    /types         # TypeScript type definitions
  /public          # Static assets
  /server          # Backend Node.js/Express server
    /api           # API routes
    /controllers   # Request handlers
    /models        # MongoDB models
    /services      # Business logic
    /websockets    # Socket.IO configuration
  /.cursor/rules   # Cursor IDE rules and best practices
```

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- MongoDB instance (local or cloud)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/social-media-aggregator.git
   cd social-media-aggregator
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   API_KEY_TWITTER=your_twitter_api_key
   API_KEY_REDDIT=your_reddit_api_key
   ```

4. Start the development servers:
   ```
   # Start the Next.js frontend
   npm run dev
   
   # In a separate terminal, start the backend server
   npm run server
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Development Guidelines

- Follow the best practices outlined in the `.cursor/rules` directory
- Use TypeScript for type safety
- Follow the modular architecture pattern
- Write clean, maintainable code with proper documentation
- Optimize for performance wherever possible

## License

MIT 