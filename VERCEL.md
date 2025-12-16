Deploying to Vercel — quick notes

1) Env vars
- In Vercel dashboard (Project > Settings > Environment Variables) add:
  - `MONGODB_URI` = your connection string (do NOT commit this to Git)

2) API structure
- Serverless API endpoints live in `api/` (already added):
  - `GET /api/products` -> `api/products/index.js`
  - `POST /api/products/add` -> `api/products/add.js`
  - `POST /api/products/delete` -> `api/products/delete.js`
  - `POST /api/products/edit` -> `api/products/edit.js`

3) Local testing
- You can still run `node bot.js` locally (if you prefer running a single Express server) or test serverless routes with `vercel dev`.

4) Notes
- `lib/mongoose.js` uses a connection cache to avoid multiple connections on serverless platforms.
- Make sure the `MONGODB_URI` has access to your IPs if using a self-hosted database or correct whitelist settings on Atlas.
