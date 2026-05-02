# chef-game-

Copper Spoon Kitchen recipe app.

## Run locally

Use the Node server so the Taste provider proxy endpoint is available:

```bash
npm start
```

Then open `http://localhost:3000`.

## Deploy and Share (Render)

This repo is ready for Render deployment using `render.yaml`.

1. Push this repo to GitHub.
2. In Render, click New + and choose Blueprint.
3. Select this repository.
4. Render will detect `render.yaml` and create a web service.
5. Wait for deploy to finish, then open the generated HTTPS URL.

Share that URL with anyone. The app includes PWA install support and backend search routes.

## Health Check

The server exposes `GET /healthz` for hosting health checks.
