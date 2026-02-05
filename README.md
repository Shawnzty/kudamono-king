# Kudamono King | 果物王

A peer-to-peer fruit marketplace connecting producers directly with consumers across Japan.

新鮮な果物を、生産者から直接。日本全国の生産者と消費者をつなぐP2Pフルーツマーケットプレイス。

## Features

- **Browse & Search** - Find fresh fruit by type, prefecture, or keyword
- **Create Listings** - Sell your fruit with photos, descriptions, and pricing
- **In-App Messaging** - Contact sellers directly through the platform
- **Bilingual** - Full Japanese and English support
- **Mobile-First** - Responsive Apple-style design

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS with custom Apple-style theme
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth v5
- **i18n**: next-intl (Japanese default, English)
- **Deployment**: Vercel + Railway

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Railway recommended)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-repo/kudamono-king.git
cd kudamono-king
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your `.env.local`:
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret"
```

5. Set up the database:
```bash
npx prisma migrate dev
```

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Deployment

### Vercel (Frontend)

1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy

### Railway (Database)

1. Create a new PostgreSQL database on Railway
2. Copy the connection string to your environment variables
3. Run migrations: `npx prisma migrate deploy`

## Project Structure

```
src/
├── app/
│   ├── [locale]/          # Localized pages (ja, en)
│   │   ├── (auth)/        # Login, register
│   │   └── (main)/        # Main app pages
│   └── api/               # API routes
├── components/
│   ├── ui/                # Base UI components
│   ├── layout/            # Header, footer, nav
│   ├── listings/          # Listing components
│   └── messages/          # Messaging components
├── i18n/                  # Internationalization config
├── lib/                   # Utilities, auth, prisma
└── messages/              # Translation files (ja.json, en.json)
```

## License

MIT
