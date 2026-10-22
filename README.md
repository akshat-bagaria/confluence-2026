# Confluence 2026

The official website for Confluence, an IEEE Computer Society PESU hackathon. The site introduces the event, presents its challenge tracks and roadmap, answers common questions, and accepts team registrations.

## Built with

- [Astro](https://astro.build/) for pages and the registration API
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [MongoDB Atlas](https://www.mongodb.com/atlas) for registration data
- [Vercel](https://vercel.com/) for deployment

## Requirements

- Node.js 22.12.0 or later
- npm
- A MongoDB Atlas database for registration submissions

## Run the site locally

From the project root, install dependencies:

```bash
npm install
```

Create a local environment file by copying the example. In PowerShell:

```powershell
Copy-Item .env.example .env
```

In macOS/Linux shells, use:

```bash
cp .env.example .env
```

Open `.env` and set the MongoDB connection details:

```env
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB=confluence
```

Keep the real `.env` file private. It is ignored by Git. Never put the MongoDB URI in frontend code or a variable prefixed with `PUBLIC_`.

Start the development server:

```bash
npm run dev
```

Astro prints the local URL in the terminal, usually <http://localhost:4321>.

## Build and preview

Create a production build:

```bash
npm run build
```

Preview the build locally:

```bash
npm run preview
```

## Event website sections

- **Home:** event introduction, background video, and countdown timer
- **About:** event overview, venue, schedule, and prize pool
- **Tracks:** seven challenge areas with descriptions and idea prompts
- **Roadmap:** event checkpoints and expandable mission briefs
- **FAQs:** common participant questions
- **Registration:** a form for teams of three or four students, including each member's SRN

The website currently lists the event date as October 25, 2026. Confirm event information and agenda details with the organisers before publishing updates.

## Registration data

The registration form sends data to the Astro endpoint at `/api/register`. The endpoint validates the submitted fields and stores accepted registrations in the `registrations` collection in the configured MongoDB database.

For local registration submissions, `.env` must contain valid MongoDB settings and the Atlas network access rules must allow the connection. See [MONGODB-SETUP.md](MONGODB-SETUP.md) for Atlas setup and instructions for viewing submitted registrations.

## Deploy to Vercel

1. Push the project to GitHub and import that repository into Vercel.
2. In Vercel, open **Project Settings → Environment Variables**.
3. Add `MONGODB_URI` and `MONGODB_DB` for the environments you will deploy (Preview and Production).
4. Check MongoDB Atlas network access and database-user permissions as described in [MONGODB-SETUP.md](MONGODB-SETUP.md).
5. Deploy or redeploy the project.

Do not commit `.env` or share the MongoDB connection string. `.env.example` contains only placeholders and is safe to commit.

## Project structure

```text
src/
├── components/
│   ├── FAQS.astro
│   ├── Footer.astro
│   ├── Navbar.astro
│   ├── Roadmap.astro
│   ├── Timer.astro
│   └── Tracks.astro
├── pages/
│   ├── api/
│   │   └── register.ts
│   ├── index.astro
│   └── register.astro
└── styles/
    └── global.css
public/                 # Logo, icons, video, and footer artwork
```

## npm scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Build the site for deployment |
| `npm run preview` | Preview the production build locally |
