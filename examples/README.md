# Example Workflows

This directory contains pre-built workflow templates that you can import into AgentFlow.

## Available Templates

### 1. Content Analyzer (`content-analyzer.json`)
**Use Case**: Fetch and analyze web content or API data with AI

**Flow**:
```
Start → HTTP Fetch → LLM Analysis → Transform → End
```

**Example Input**:
```json
{
  "repo": "cloudflare/workers-sdk"
}
```

### 2. ETL Data Pipeline (`data-pipeline.json`)
**Use Case**: Extract data, classify with AI, and route based on priority

**Flow**:
```
Start → Extract Data → AI Classification → Condition → [Urgent/Normal] → End
```

**Features**:
- Conditional branching based on AI classification
- Different webhooks for different priorities
- Demonstrates complex workflow routing

## How to Import

1. Open AgentFlow in your browser
2. Click the **Import** button in the header
3. Select one of these JSON files
4. The workflow will load with all nodes and connections
5. Click **Save** to store it
6. Customize the nodes for your specific use case
7. Click **Execute** to run it

## Customization Ideas

### Content Analyzer
- Change the API endpoint to analyze different content
- Modify the LLM prompt for different analysis types
- Add more transform steps for data formatting

### Data Pipeline
- Add more condition nodes for complex routing
- Include additional HTTP nodes for multi-step processing
- Integrate with your own APIs and webhooks

## Creating Your Own Templates

1. Build a workflow in AgentFlow
2. Click **Export** to download the JSON
3. Add it to this directory
4. Share with your team!
