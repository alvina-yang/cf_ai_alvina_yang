# AgentFlow Setup Guide

Complete setup guide for the AgentFlow AI-Powered Workflow Automation Platform.

## 📋 Prerequisites

- **Node.js** 18+ installed
- **Yarn** package manager (`npm install -g yarn`)
- **Cloudflare account** (for deployment)
- **Wrangler CLI** (`npm install -g wrangler`)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install frontend dependencies
yarn install

# Install worker dependencies
cd worker
yarn install
cd ..
```

### 2. Configure Environment

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_WORKER_URL=http://localhost:8787
```

For production, update to your deployed Worker URL:
```env
NEXT_PUBLIC_WORKER_URL=https://your-worker.your-subdomain.workers.dev
```

### 3. Set Up Cloudflare KV

Create a KV namespace for workflow storage:

```bash
wrangler kv:namespace create WORKFLOWS_KV
```

Copy the ID from the output and update `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "WORKFLOWS_KV"
id = "your-kv-namespace-id-here"
```

### 4. Run Development Servers

**Terminal 1 - Worker:**
```bash
yarn dev:worker
```

**Terminal 2 - Frontend:**
```bash
yarn dev
```

### 5. Open Your Browser

Navigate to `http://localhost:3000`

## 🏗️ Architecture

```
Frontend (Next.js) → Worker (Hono) → Durable Objects (Agents) → Workers AI (Llama 3.3)
                                    ↓
                                   KV Storage
```

## 🔧 Configuration

### Available Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_WORKER_URL` | Cloudflare Worker endpoint | `http://localhost:8787` |

### Cloudflare Bindings

The worker requires these bindings (configured in `wrangler.toml`):

- **AI**: Cloudflare Workers AI
- **WORKFLOWS_KV**: KV namespace for workflow storage
- **WORKFLOW_AGENT**: Durable Object for workflow execution
- **LLM_AGENT**: Durable Object for chat sessions

## 📦 Deployment

### Deploy Worker

```bash
yarn deploy:worker
```

### Deploy Frontend to Cloudflare Pages

Option 1 - Command Line:
```bash
yarn build
wrangler pages deploy .next
```

Option 2 - GitHub Integration:
1. Push code to GitHub
2. Connect repository in Cloudflare Pages dashboard
3. Set build command: `yarn build`
4. Set build output directory: `.next`
5. Add environment variable: `NEXT_PUBLIC_WORKER_URL` with your worker URL

## 🧪 Testing

### Test Workflow Creation

1. Open the app
2. Click "Start" in the node panel
3. Add an "LLM" node
4. Connect Start → LLM
5. Click the LLM node to configure
6. Add prompt: "Say hello to {{input.name}}"
7. Click Save in the header
8. Click Execute
9. Enter input: `{"name": "World"}`

### Test Chat Assistant

1. Click the chat button (bottom right)
2. Type a question: "How do I create a workflow?"
3. Or click the microphone for voice input
4. Receive AI-powered assistance

## 🔒 Security Notes

- All API endpoints use CORS protection
- Workflows are encrypted at rest in KV
- Execution state stored in Durable Objects SQL
- No sensitive data logged
- Add rate limiting for production use

## 🐛 Troubleshooting

### Worker not connecting

Check that:
- Worker is running (`yarn dev:worker`)
- `NEXT_PUBLIC_WORKER_URL` is correct
- CORS is configured for your domain

### AI model errors

Ensure:
- Workers AI is enabled in your Cloudflare account
- You're using a valid model ID
- Your account has AI usage quota

### KV namespace errors

Verify:
- KV namespace is created
- ID in `wrangler.toml` matches created namespace
- Binding name is `WORKFLOWS_KV`

### Durable Objects not working

Check:
- Durable Objects are enabled
- Migration tag is set in `wrangler.toml`
- Classes are properly exported in `worker/src/index.ts`

## 📚 Learn More

- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Workers AI](https://developers.cloudflare.com/workers-ai/)
- [Durable Objects](https://developers.cloudflare.com/durable-objects/)
- [Next.js](https://nextjs.org/docs)
- [React Flow](https://reactflow.dev/docs)

## 🤝 Support

For issues and questions:
1. Check existing documentation
2. Review Cloudflare Workers documentation
3. Check GitHub issues
4. Create a new issue with details

## 📝 Next Steps

After setup, try:
1. Creating a multi-node workflow
2. Using template variables `{{variable}}`
3. Connecting to external APIs
4. Building data transformation pipelines
5. Creating conditional logic flows

Happy automating! 🚀

