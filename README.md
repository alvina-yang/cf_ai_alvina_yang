# 🚀 AgentFlow - AI-Powered Workflow Automation Platform

A sophisticated visual workflow builder that enables developers to create, deploy, and execute AI-powered automation workflows on Cloudflare's edge infrastructure. Built with Next.js, React Flow, and Cloudflare's Agents SDK with Durable Objects.

![AgentFlow](https://img.shields.io/badge/Next.js-14-black) ![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers-orange) ![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)

## ✨ Features

### 🎨 Visual Workflow Builder
- **Drag-and-drop interface** powered by React Flow
- **Real-time visual feedback** during workflow execution
- **Intuitive node connections** with animated edges
- **Multiple node types**: Start, LLM, HTTP, Transform, Condition, End

### 🤖 AI-Powered Agents
- **Llama 3.3 70B** integration via Cloudflare Workers AI
- **Persistent state management** with Durable Objects
- **WebSocket real-time updates** for execution monitoring
- **Autonomous task execution** with error handling
- **AI Chat Assistant** with workflow context
- **Voice input** using Whisper speech-to-text
- **Session memory** for continuous conversations

### 🔧 Node Types

| Node | Description | Use Cases |
|------|-------------|-----------|
| **LLM** | AI language model processing | Text generation, analysis, summarization |
| **HTTP** | External API calls | Data fetching, webhooks, integrations |
| **Transform** | Data manipulation | JSON parsing, field extraction, merging |
| **Condition** | Conditional branching | Logic gates, routing, validation |

### 🛠️ Developer Features
- **Template variables** with `{{variable}}` syntax
- **Workflow export/import** for sharing and versioning
- **Execution history** stored in SQL with timeline visualization
- **Real-time monitoring** via WebSockets
- **Modular architecture** for easy extension
- **Centralized configuration** for easy customization
- **Type-safe** TypeScript throughout
- **Modern UI** with Tailwind CSS and Framer Motion

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Frontend                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ React Flow   │  │   Zustand    │  │  Components  │ │
│  │   Builder    │  │    Store     │  │   (UI/UX)    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                           │
                   REST API / WebSocket
                           │
┌─────────────────────────────────────────────────────────┐
│              Cloudflare Workers (Hono)                   │
│  ┌──────────────────────────────────────────────────┐  │
│  │            API Routes & CORS Handler              │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────────────┐  ┌───────────────┐  ┌──────────────┐
│ WorkflowAgent │  │   LLMAgent    │  │  Workers AI  │
│ Durable Object│  │ Durable Object│  │  (Llama 3.3) │
│  + SQL State  │  │  + SQL State  │  │              │
└───────────────┘  └───────────────┘  └──────────────┘
        │                  │
┌───────────────┐  ┌───────────────┐
│  Workflows KV │  │   WebSocket   │
│   Storage     │  │  Connections  │
└───────────────┘  └───────────────┘
```

## 📦 Installation

### Prerequisites
- Node.js 18+ installed
- **Yarn** package manager (`npm install -g yarn`)
- Cloudflare account (for deployment)
- Wrangler CLI installed globally (`npm install -g wrangler`)

### Quick Setup

1. **Install dependencies**
```bash
yarn install
cd worker && yarn install && cd ..
```

2. **Create `.env.local` file**
```env
NEXT_PUBLIC_WORKER_URL=http://localhost:8787
```

3. **Create Cloudflare KV namespace**
```bash
wrangler kv:namespace create WORKFLOWS_KV
```

4. **Update `wrangler.toml` with your KV namespace ID**
```toml
[[kv_namespaces]]
binding = "WORKFLOWS_KV"
id = "your-kv-namespace-id-here"
```

5. **Run development servers**

Terminal 1 - Cloudflare Worker:
```bash
yarn dev:worker
```

Terminal 2 - Next.js Frontend:
```bash
yarn dev
```

6. **Open browser**
```
http://localhost:3000
```

📘 **For detailed setup instructions, see [SETUP.md](SETUP.md)**

## 🚀 Usage

### Creating a Workflow

1. **Add Start Node**: Click "Start" in the node panel
2. **Add Processing Nodes**: Add LLM, HTTP, Transform, or Condition nodes
3. **Connect Nodes**: Drag from output handle to input handle
4. **Configure Nodes**: Click a node to edit its properties
5. **Add End Node**: Terminate the workflow
6. **Save**: Click the Save button in the header
7. **Execute**: Click Execute and provide input data

### Example: AI Content Analyzer

```
Start → HTTP (fetch content) → LLM (analyze) → Transform (format) → End
```

**HTTP Node Configuration:**
```json
{
  "url": "https://api.example.com/articles/{{articleId}}",
  "method": "GET"
}
```

**LLM Node Configuration:**
```json
{
  "prompt": "Analyze this article and provide key insights: {{data}}",
  "model": "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
  "temperature": 0.7
}
```

### Using Template Variables

Use `{{variable}}` syntax to reference data from previous nodes:
- `{{input.userId}}` - Access input data
- `{{data.response}}` - Access response from previous node
- `{{text}}` - Access text from LLM output

### Using the AI Chat Assistant

1. Click the **chat bubble** button in the bottom right
2. Type your question or click the **microphone** for voice input
3. Get AI-powered help with:
   - Workflow design and architecture
   - Debugging execution errors
   - Best practices and optimization tips
   - Understanding node configuration

**Voice Input:**
- Click the microphone icon to start recording
- Speak your question naturally
- Click again to stop and transcribe
- Uses Cloudflare Workers AI Whisper model

**Features:**
- Persistent chat sessions with memory
- Context-aware responses
- Real-time AI assistance
- Beautiful animated UI

## 📡 API Reference

### Create Workflow
```typescript
POST /api/workflows
{
  "id": "workflow-123",
  "name": "My Workflow",
  "nodes": [...],
  "edges": [...]
}
```

### Execute Workflow
```typescript
POST /api/workflows/:id/execute
{
  "input": { "key": "value" }
}
```

### WebSocket Monitoring
```typescript
WS /api/workflows/:id/ws

Events:
- execution_started
- node_started
- node_completed
- node_failed
- execution_completed
```

## 🎯 Use Cases

### Developer Tools
- **Code Review Automation**: Fetch PR → Analyze with LLM → Post comments
- **Documentation Generator**: Read code → Generate docs → Update wiki
- **Bug Triage**: Fetch issues → Classify with AI → Assign to team

### Data Processing
- **ETL Pipelines**: Extract → Transform with AI → Load
- **Content Moderation**: Fetch content → Analyze sentiment → Flag/approve
- **Data Enrichment**: Fetch data → Enhance with LLM → Store results

### Workflow Automation
- **Customer Support**: Receive ticket → Classify → Route to agent
- **Report Generation**: Gather data → Analyze → Format → Email
- **Monitoring Alerts**: Check status → Evaluate with AI → Notify team

## 🛡️ Security

- All API endpoints use CORS protection
- Workflows stored in Cloudflare KV with encryption at rest
- Execution state persisted in Durable Objects SQL
- No sensitive data logged or exposed
- Rate limiting recommended for production

## 🔧 Configuration

### Environment Variables

**Frontend (.env.local):**
```env
NEXT_PUBLIC_WORKER_URL=http://localhost:8787
```

**Worker (wrangler.toml):**
```toml
name = "agentflow-worker"
compatibility_date = "2024-01-01"

[ai]
binding = "AI"

[[kv_namespaces]]
binding = "WORKFLOWS_KV"
id = "your-kv-namespace-id"
```

## 📚 Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **UI**: Tailwind CSS, React Flow, Lucide Icons
- **State**: Zustand, TanStack Query
- **Backend**: Cloudflare Workers, Hono
- **Agents**: Cloudflare Agents SDK, Durable Objects
- **AI**: Cloudflare Workers AI (Llama 3.3 70B)
- **Storage**: Cloudflare KV, Durable Objects SQL

## 🚢 Deployment

### Deploy Worker
```bash
npm run deploy:worker
```

### Deploy Frontend (Cloudflare Pages)
```bash
npm run deploy:pages
```

Built with ⚡ on Cloudflare's edge network