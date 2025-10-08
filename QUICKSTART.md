# 🚀 AgentFlow - Quick Start Guide

Get AgentFlow up and running in 5 minutes!

## Prerequisites

- **Node.js 18+** installed ([download here](https://nodejs.org/))
- **Cloudflare account** (free tier works fine)
- **Terminal/Command line** access

## Step 1: Install Dependencies

```bash
npm install
```

This will install all required packages for both the frontend and backend.

## Step 2: Set Up Cloudflare KV

Create a KV namespace for storing workflows:

```bash
npx wrangler kv:namespace create WORKFLOWS_KV
```

You'll see output like:
```
🌀 Creating namespace with title "agentflow-worker-WORKFLOWS_KV"
✨ Success!
Add the following to your configuration file in your kv_namespaces array:
{ binding = "WORKFLOWS_KV", id = "abc123..." }
```

**Copy the `id` value** (e.g., `abc123...`)

## Step 3: Update Configuration

Open `wrangler.toml` and replace the KV namespace ID:

```toml
[[kv_namespaces]]
binding = "WORKFLOWS_KV"
id = "YOUR_KV_NAMESPACE_ID_HERE"  # ← Paste your ID here
```

## Step 4: Start Development Servers

You need **two terminal windows**:

### Terminal 1: Cloudflare Worker
```bash
npm run dev:worker
```

Wait for: `⎔ Ready on http://localhost:8787`

### Terminal 2: Next.js Frontend
```bash
npm run dev
```

Wait for: `✓ Ready on http://localhost:3000`

## Step 5: Open AgentFlow

Open your browser and navigate to:
```
http://localhost:3000
```

## 🎉 Create Your First Workflow

### Simple "Hello AI" Workflow

1. **Add Start Node**
   - Click "Start" in the left panel
   - It appears in the canvas

2. **Add LLM Node**
   - Click "LLM" in the left panel
   - Click the new node to edit it
   - Update the prompt: `"Say hello to {{input.name}}"`
   - Click "Save"

3. **Add End Node**
   - Click "End" in the left panel

4. **Connect Nodes**
   - Drag from the bottom circle of Start → top of LLM
   - Drag from bottom of LLM → top of End

5. **Save Workflow**
   - Click "Save" button in header
   - Name it "Hello AI"

6. **Execute Workflow**
   - Click "Execute" button
   - Enter input: `{"name": "World"}`
   - Watch the nodes light up as they execute!

## 📚 Try Example Workflows

Import pre-built examples:

1. Click **Import** button in header
2. Navigate to `examples/` folder
3. Select `content-analyzer.json` or `data-pipeline.json`
4. Click "Save"
5. Customize and execute!

## 🔧 Troubleshooting

### Worker Not Starting?
```bash
# Clear cache and restart
rm -rf .wrangler
npm run dev:worker
```

### Frontend Build Errors?
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### WebSocket Not Connecting?
- Check that worker is running on port 8787
- Verify `NEXT_PUBLIC_WORKER_URL=http://localhost:8787` in `.env.local`

### KV Namespace Issues?
```bash
# List your namespaces
npx wrangler kv:namespace list

# Use the ID from the list in wrangler.toml
```

## 🚢 Deploy to Production

### 1. Deploy Worker
```bash
npm run deploy:worker
```

Copy the deployed URL (e.g., `https://agentflow-worker.your-name.workers.dev`)

### 2. Update Frontend Environment

Create `.env.production.local`:
```env
NEXT_PUBLIC_WORKER_URL=https://agentflow-worker.your-name.workers.dev
```

### 3. Deploy Frontend

**Option A: Cloudflare Pages (Recommended)**
```bash
npm run deploy:pages
```

**Option B: Connect GitHub**
1. Push code to GitHub
2. Go to [Cloudflare Pages](https://pages.cloudflare.com/)
3. Connect repository
4. Build settings:
   - Build command: `npm run build`
   - Output directory: `.next`
   - Environment variable: `NEXT_PUBLIC_WORKER_URL=<your-worker-url>`

## 💡 Next Steps

### Learn the Basics
- Read the [full README](./README.md)
- Explore [example workflows](./examples/)
- Check out the [API documentation](./README.md#-api-reference)

### Build Something Cool
- **Developer Tools**: Code review automation, doc generation
- **Data Pipelines**: ETL workflows with AI processing
- **Automation**: Customer support routing, report generation

### Customize
- Add new node types in `worker/src/agents/WorkflowAgent.ts`
- Create custom UI components
- Build workflow templates for your team

## 🆘 Need Help?

- Check the [README](./README.md) for detailed documentation
- Review [Cloudflare Agents docs](https://developers.cloudflare.com/agents/)
- Inspect browser console for errors
- Check worker logs: `npm run tail` (in worker directory)

## 🎯 Common Use Cases

### 1. GitHub PR Analyzer
```
Start → HTTP (fetch PR) → LLM (analyze code) → HTTP (post comment) → End
```

### 2. Content Moderator
```
Start → HTTP (fetch content) → LLM (check safety) → Condition → [Approve/Reject] → End
```

### 3. Data Enrichment
```
Start → HTTP (fetch user) → LLM (generate bio) → Transform → HTTP (save) → End
```

---

**You're all set!** 🎉 Start building powerful AI workflows on the edge!
