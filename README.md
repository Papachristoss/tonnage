# Tonnage

Tonnage is a full-stack workout tracking app. It lets a user register/log in, log workout sessions made up of exercises and sets (weight × reps), and view their progress on a given exercise over time.

The name comes from the fitness term "tonnage" — the total weight lifted (sets × reps × weight) in a session or over time, which the app is built to track.

**Live demo:** [tonnage-theta.vercel.app](https://tonnage-theta.vercel.app/)

> The backend is hosted on Render's free tier, which spins down after ~15 minutes of inactivity. If the app hasn't been used recently, the first request may take 30-60 seconds while it wakes back up — subsequent requests are fast.

## What it does

- **Auth** — register and log in with a username/password; the API issues a JWT used to authenticate subsequent requests.
- **Exercises** — a shared list of exercises (e.g. Bench Press, Squat) that any logged-in user can browse or add to.
- **Workout sessions** — log a session containing multiple sets, each with an exercise, weight, and reps.
- **Progress tracking** — view how a specific exercise has progressed over time (weight/reps/tonnage across sessions), rendered as a chart on the frontend.

## Tech stack

**Backend — `tonnage-api/`**
- Java 21, Spring Boot 4.1.1
- Spring Web (REST API)
- Spring Data JPA (Hibernate) for persistence
- Spring Security + JWT (`jjwt`) for authentication
- PostgreSQL (hosted on [Neon](https://neon.tech)) as the database
- Bean Validation for request validation
- Lombok to cut down boilerplate
- Maven (with the Maven Wrapper, so no local Maven install is required)
- Docker (multi-stage build, used for deployment)

**Frontend — `tonnage-web/`**
- React 19 + Vite
- Tailwind CSS for styling
- Axios for API calls
- Recharts for the progress charts
- Lucide React for icons
- ESLint for linting

**Deployment**
- Backend hosted on [Render](https://render.com) (Docker-based deploy)
- Frontend hosted on [Vercel](https://vercel.com)
- Database hosted on [Neon](https://neon.tech) (serverless PostgreSQL)

## Project structure

```
Tonnage/
├── tonnage-api/     Spring Boot REST API (Dockerfile included)
└── tonnage-web/     React (Vite) frontend
```

## Running it locally

### Prerequisites
- Java 21
- Node.js (18+) and npm
- A PostgreSQL database (e.g. a free [Neon](https://neon.tech) project)

### 1. Backend setup

The API reads its database credentials and JWT secret from environment variables — nothing sensitive is hardcoded. Set the following before running:

| Variable | Example |
|---|---|
| `DB_URL` | `jdbc:postgresql://<your-neon-host>/<your-db>?sslmode=require` |
| `DB_USERNAME` | your database username |
| `DB_PASSWORD` | your database password |
| `JWT_SECRET` | a long random string, e.g. output of `openssl rand -hex 32` |

See `tonnage-api/.env.example` for the full list of expected variables.

Then, from `tonnage-api/`:

```bash
./mvnw spring-boot:run
```

The API starts on `http://localhost:8080`.

### 2. Frontend setup

From `tonnage-web/`:

```bash
npm install
npm run dev
```

The app starts on `http://localhost:5173` (Vite's default). It talks to the API at `http://localhost:8080` by default — to point it somewhere else (e.g. a deployed backend), set `VITE_API_URL` in a `.env` file inside `tonnage-web/`:

```
VITE_API_URL=http://localhost:8080/api
```

### 3. Open it

Visit `http://localhost:5173` in your browser, register a user, and start logging workouts.

## Deployment

The live version runs on:
- **Backend** — [Render](https://render.com), deployed from `tonnage-api/Dockerfile`, with `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, and `CORS_ALLOWED_ORIGINS` set as environment variables on the service.
- **Frontend** — [Vercel](https://vercel.com), deployed from `tonnage-web/`, with `VITE_API_URL` set to the live backend URL.
- **Database** — [Neon](https://neon.tech) (free-tier PostgreSQL).

Both platforms auto-deploy on every push to `master`.

## Notes

- Never commit real values for `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, or `VITE_API_URL` — keep them in your environment, a gitignored local properties file, or your platform's dashboard (Render/Vercel environment variables).