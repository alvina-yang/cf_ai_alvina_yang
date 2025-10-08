# 🚢 Deployment Guide

Complete guide to deploying AgentFlow to production on Cloudflare.

## Prerequisites

- Cloudflare account (free or paid)
- Domain (optional, but recommended)
- Completed local setup (see [QUICKSTART.md](./QUICKSTART.md))

## Quick Deploy (Automated)

Use our deployment script:

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

This will:
1. ✅ Deploy the Worker
2. ✅ Build the frontend
3. ✅ Deploy to Cloudflare Pages
4. ✅ Configure environment variables

## Manual Deployment

### Step 1: Deploy Worker

```bash
npm run deploy:worker
```

Copy your worker URL (e.g., `https://agentflow-worker.your-subdomain.workers.dev`)

### Step 2: Create Production Environment

Create `.env.production.local`:

```env
NEXT_PUBLIC_WORKER_URL=https://agentflow-worker.your-subdomain.workers.dev
```

### Step 3: Deploy Frontend

**Option A: Cloudflare Pages CLI**

```bash
npm run build
npx wrangler pages deploy .next --project-name agentflow
```

**Option B: GitHub Integration (Recommended)**

1. Push your code to GitHub
2. Go to [Cloudflare Pages Dashboard](https://dash.cloudflare.com/pages)
3. Click "Create a project"
4. Connect your GitHub repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `.next`
   - **Root directory**: `/`
   - **Environment variables**:
     ```
     NEXT_PUBLIC_WORKER_URL=https://your-worker-url.workers.dev
     ```
6. Click "Save and Deploy"

## Production Configuration

### 1. KV Namespace (Production)

Create a production KV namespace:

```bash
npx wrangler kv:namespace create WORKFLOWS_KV --env production
```

Update `wrangler.toml`:

```toml
[env.production]
name = "agentflow-worker"

[[env.production.kv_namespaces]]
binding = "WORKFLOWS_KV"
id = "your-production-kv-id"
```

### 2. Worker Configuration

Edit `wrangler.toml` for production:

```toml
name = "agentflow-worker"
main = "worker/src/index.ts"
compatibility_date = "2024-01-01"

[env.production]
name = "agentflow-worker-production"

# Production KV
[[env.production.kv_namespaces]]
binding = "WORKFLOWS_KV"
id = "your-production-kv-id"

# AI Binding
[env.production.ai]
binding = "AI"

# Rate limiting (optional)
[env.production.limits]
cpu_ms = 50
```

### 3. CORS Configuration

Update worker for production domains in `worker/src/index.ts`:

```typescript
app.use('*', cors({
  origin: [
    'http://localhost:3000',
    'https://agentflow.pages.dev',
    'https://your-custom-domain.com'
  ],
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));
```

Redeploy worker after changes:
```bash
npm run deploy:worker
```

## Custom Domain

### For Pages (Frontend)

1. Go to your Pages project settings
2. Click "Custom domains"
3. Add your domain (e.g., `app.yourdomain.com`)
4. Add CNAME record to your DNS:
   ```
   app.yourdomain.com CNAME agentflow.pages.dev
   ```

### For Worker (Backend)

1. Go to Workers & Pages > your worker
2. Click "Triggers" tab
3. Click "Add Custom Domain"
4. Enter subdomain (e.g., `api.yourdomain.com`)
5. Cloudflare handles SSL automatically

Update `.env.production.local`:
```env
NEXT_PUBLIC_WORKER_URL=https://api.yourdomain.com
```

## Environment Variables

### Production Environment Variables

**Frontend (Cloudflare Pages):**
- `NEXT_PUBLIC_WORKER_URL`: Your worker URL

**Worker (wrangler.toml):**
- `ENVIRONMENT`: `production`
- Additional API keys as needed

## Security Best Practices

### 1. Rate Limiting

Add to `worker/src/index.ts`:

```typescript
// Simple rate limiting
const rateLimiter = new Map();

app.use('*', async (c, next) => {
  const ip = c.req.header('cf-connecting-ip');
  const now = Date.now();
  const requests = rateLimiter.get(ip) || [];
  
  // Clean old entries
  const recent = requests.filter(t => now - t < 60000);
  
  if (recent.length > 100) { // 100 requests per minute
    return c.text('Rate limit exceeded', 429);
  }
  
  recent.push(now);
  rateLimiter.set(ip, recent);
  
  await next();
});
```

### 2. Authentication (Optional)

For private deployments, add API key authentication:

```typescript
app.use('/api/*', async (c, next) => {
  const apiKey = c.req.header('Authorization');
  
  if (apiKey !== c.env.API_KEY) {
    return c.text('Unauthorized', 401);
  }
  
  await next();
});
```

Add `API_KEY` to wrangler secrets:
```bash
wrangler secret put API_KEY
```

### 3. Input Validation

Always validate user input:

```typescript
import { z } from 'zod';

const workflowSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  nodes: z.array(z.any()),
  edges: z.array(z.any()),
});

// In route handler
const body = await c.req.json();
const validated = workflowSchema.parse(body);
```

## Monitoring

### 1. Worker Analytics

View in Cloudflare Dashboard:
- Workers & Pages > your worker > Analytics
- Request count, CPU time, errors

### 2. Tail Logs

Watch live logs:
```bash
npx wrangler tail
```

### 3. Error Tracking

Add error logging:

```typescript
app.onError((err, c) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: c.req.path,
    method: c.req.method,
  });
  
  return c.json({ error: 'Internal server error' }, 500);
});
```

## Performance Optimization

### 1. Caching

Cache workflow definitions:

```typescript
// In worker
const cached = await c.env.WORKFLOWS_KV.get(`workflow:${id}`, {
  type: 'json',
  cacheTtl: 300, // Cache for 5 minutes
});
```

### 2. Edge Caching

Add cache headers:

```typescript
app.get('/api/workflows/:id', async (c) => {
  const workflow = await getWorkflow(c.req.param('id'));
  
  return c.json(workflow, {
    headers: {
      'Cache-Control': 'public, max-age=300',
    },
  });
});
```

### 3. Minimize Bundle Size

- Use dynamic imports for large dependencies
- Remove unused code
- Optimize images and assets

## Scaling Considerations

### Free Tier Limits

Cloudflare free tier includes:
- **Workers**: 100,000 requests/day
- **KV**: 100,000 reads/day, 1,000 writes/day
- **Durable Objects**: 10 requests/second

### Upgrading

For production workloads:
- **Workers Paid**: $5/month, 10M requests included
- **Workers AI**: Pay per request
- **Durable Objects**: $0.15/million requests

## Rollback Strategy

### Quick Rollback

```bash
# List deployments
npx wrangler deployments list

# Rollback to previous version
npx wrangler rollback [deployment-id]
```

### Version Management

Tag your deployments:

```bash
git tag -a v1.0.0 -m "Production release 1.0.0"
git push origin v1.0.0
```

## Troubleshooting

### Worker Not Accessible

- Check worker is deployed: `wrangler deployments list`
- Verify CORS settings include your frontend domain
- Check worker logs: `wrangler tail`

### Frontend Build Fails

- Clear cache: `rm -rf .next`
- Check environment variables in Pages settings
- Verify build output directory is `.next`

### WebSocket Issues

- Ensure worker supports WebSocket upgrades
- Check that frontend uses correct protocol (ws/wss)
- Verify no proxy blocking WebSocket connections

### KV Errors

- Confirm KV namespace exists and ID is correct
- Check KV bindings in wrangler.toml
- Verify KV permissions

## Health Checks

Add a health endpoint:

```typescript
app.get('/health', async (c) => {
  // Check KV connectivity
  try {
    await c.env.WORKFLOWS_KV.get('health_check');
  } catch (e) {
    return c.json({ status: 'unhealthy', kv: 'error' }, 500);
  }
  
  return c.json({ 
    status: 'healthy',
    timestamp: Date.now(),
    version: '1.0.0'
  });
});
```

Monitor this endpoint with tools like:
- Uptime Robot
- Pingdom
- StatusCake

## Backup Strategy

### Export Workflows

Create a backup script:

```bash
#!/bin/bash
# backup-workflows.sh

WORKER_URL="https://your-worker.workers.dev"
BACKUP_DIR="./backups/$(date +%Y%m%d)"

mkdir -p "$BACKUP_DIR"

# Fetch all workflows
curl "$WORKER_URL/api/workflows" > "$BACKUP_DIR/workflows.json"

echo "Backup complete: $BACKUP_DIR"
```

Schedule with cron:
```
0 2 * * * /path/to/backup-workflows.sh
```

## Cost Estimation

### Example Usage (Small Team)

- 10,000 workflow executions/month
- Average 3 LLM calls per workflow
- 50GB data transfer

**Estimated Cost**: ~$15-20/month

- Workers: $5/month
- Workers AI: 30,000 requests × $0.0001 = $3
- Durable Objects: ~$5
- KV: Included in Workers plan
- Pages: Free

## Next Steps

- ✅ Deploy to production
- ⚙️ Configure custom domain
- 🔒 Set up authentication
- 📊 Monitor performance
- 🔄 Implement backup strategy
- 📈 Plan for scaling

---

Need help? Check the [README](./README.md) or open an issue!
