# Free Deployment

## 1. Neon PostgreSQL

1. Create a free project at https://neon.com.
2. Copy its pooled PostgreSQL connection string.
3. Keep it private; this becomes Render's `DATABASE_URL`.

## 2. Render Backend

1. In Render, choose **New > Blueprint** and select this GitHub repository.
2. Render reads `render.yaml` and creates `eduguard-ai-api`.
3. Set these required environment variables:
   - `DATABASE_URL`: Neon pooled connection string
   - `FRONTEND_URL`: temporary value `http://localhost:3000`
4. Deploy and copy the generated backend URL.
5. Verify `https://YOUR-RENDER-URL/health`.

The first deploy automatically creates the database schema and demo accounts.

## 3. Vercel Frontend

1. Import the same GitHub repository into Vercel.
2. Set **Root Directory** to `frontend`.
3. Keep the detected Create React App build settings.
4. Add:
   - `REACT_APP_API_URL=https://YOUR-RENDER-URL/api`
5. Deploy and copy the generated Vercel URL.

## 4. Final CORS Setting

In Render, replace `FRONTEND_URL` with the exact Vercel URL and redeploy.

## Demo Login

- Admin: `admin@eduguard.ai` / `Admin@123`
- Teacher: `teacher@eduguard.ai` / `Teacher@123`
- Counselor: `counselor@eduguard.ai` / `Counselor@123`

