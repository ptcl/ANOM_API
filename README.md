# AN0M Protocol API

REST API for the AN0M Protocol management system built with Express.js, TypeScript, and MongoDB.

## Features

- 🔐 **Bungie OAuth** - Authentication via Destiny 2 accounts
- 👤 **Agent Management** - User profiles, roles, divisions
- 📜 **Contracts** - Mission/challenge tracking system
- 🏅 **Badges & Emblems** - Reward system
- 📖 **Lore** - Story/content management
- ⏱️ **Timelines** - Interactive story experiences
- 📢 **Announcements** - System notifications
- 🎁 **Reward Codes** - Promotional code system

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Auth**: JWT + Bungie OAuth
- **Validation**: Zod
- **Docs**: Swagger/OpenAPI 3.0

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm
- MongoDB instance
- Bungie Developer Account ([Register here](https://www.bungie.net/en/Application))

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/anom-api.git
cd anom-api

# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env

# Configure your .env file with your values

# Start development server
pnpm dev
```

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
NODE_ENV=development

# Server
PORT=
FRONTEND_URL=
CORS_ORIGINS=
MONGO_URL=

# JWT
JWT_SECRET=
JWT_EXPIRES_IN=

# Bungie OAuth
BUNGIE_CLIENT_ID=
BUNGIE_CLIENT_SECRET=
BUNGIE_API_KEY=
BUNGIE_REDIRECT_URI=
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with hot reload |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm test` | Run tests |
| `pnpm test:coverage` | Run tests with coverage |
| `pnpm lint` | Run ESLint |

## API Documentation

Once the server is running:

- **English**: [http://localhost:3031/docs](http://localhost:3031/docs)
- **French**: [http://localhost:3031/docs/fr](http://localhost:3031/docs/fr)
- **Status**: [http://localhost:3031/api/status](http://localhost:3031/api/status)

## Project Structure

```
src/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── docs/            # Swagger documentation (EN)
├── docs-fr/         # Swagger documentation (FR)
├── middlewares/     # Express middlewares
├── models/          # Mongoose models
├── routes/          # API routes
├── schemas/         # Zod validation schemas
├── services/        # Business logic
├── types/           # TypeScript types
└── utils/           # Utility functions
```

## License

MIT License - see [LICENSE](LICENSE) file.
