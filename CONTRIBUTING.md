# Contributing to AgentFlow

Thank you for your interest in contributing to AgentFlow! This document provides guidelines and instructions for contributing.

## 🌟 Ways to Contribute

- **Bug Reports**: Found a bug? Open an issue with details
- **Feature Requests**: Have an idea? Share it in discussions
- **Code Contributions**: Submit PRs for bug fixes or new features
- **Documentation**: Improve docs, add examples, write tutorials
- **Templates**: Create and share workflow templates

## 🛠️ Development Setup

1. **Fork and Clone**
```bash
git clone https://github.com/YOUR_USERNAME/agentflow.git
cd agentflow
```

2. **Install Dependencies**
```bash
npm install
```

3. **Set Up Environment**
```bash
# Create KV namespace
npx wrangler kv:namespace create WORKFLOWS_KV

# Update wrangler.toml with your KV ID
# Copy .env.local.example to .env.local
```

4. **Run Development**
```bash
# Terminal 1
npm run dev:worker

# Terminal 2
npm run dev
```

## 📁 Project Structure

```
agentflow/
├── src/                      # Next.js frontend
│   ├── app/                  # Next.js app router
│   ├── components/           # React components
│   │   ├── layout/          # Layout components
│   │   ├── workflow/        # Workflow builder
│   │   └── ui/              # UI primitives
│   ├── lib/                 # Utilities and API
│   ├── store/               # Zustand state
│   └── types/               # TypeScript types
├── worker/                   # Cloudflare Worker
│   └── src/
│       ├── agents/          # Agent implementations
│       └── index.ts         # Worker entry point
├── examples/                 # Example workflows
└── docs/                    # Documentation

```

## 🎯 Adding New Node Types

Want to add a new node type? Here's how:

### 1. Update Type Definitions

**`src/types/workflow.ts`**
```typescript
export type NodeType = 'start' | 'llm' | 'http' | 'transform' | 'condition' | 'email' | 'end';
```

### 2. Add Node Logic

**`worker/src/agents/WorkflowAgent.ts`**
```typescript
case 'email':
  nodeResult = await this.executeEmailNode(node, currentInput);
  break;

// Add implementation
private async executeEmailNode(node: WorkflowNode, input: any): Promise<any> {
  const { to, subject, body } = node.data;
  // Your implementation here
  return { sent: true };
}
```

### 3. Add UI Configuration

**`src/components/workflow/NodeEditor.tsx`**
```typescript
case 'email':
  return (
    <>
      <div>
        <label>To</label>
        <input value={formData.to} onChange={...} />
      </div>
      <div>
        <label>Subject</label>
        <input value={formData.subject} onChange={...} />
      </div>
    </>
  );
```

### 4. Add to Node Panel

**`src/components/workflow/NodePanel.tsx`**
```typescript
{ 
  type: 'email', 
  label: 'Email', 
  icon: Mail, 
  description: 'Send email' 
}
```

### 5. Add Default Data

**`src/store/workflowStore.ts`**
```typescript
case 'email':
  return {
    label: 'Email',
    to: '',
    subject: '',
    body: '',
  };
```

## 🧪 Testing

### Manual Testing
1. Create a workflow with your new node
2. Test in development
3. Verify execution logs
4. Check error handling

### Future: Automated Tests
We're planning to add:
- Unit tests for agents
- Integration tests for workflows
- E2E tests with Playwright

## 📝 Code Style

- **TypeScript**: Strict mode enabled
- **Formatting**: Use Prettier (coming soon)
- **Linting**: Follow ESLint rules
- **Naming**: 
  - Components: PascalCase
  - Functions: camelCase
  - Files: Match component name or kebab-case

## 🔄 Pull Request Process

1. **Create a Branch**
```bash
git checkout -b feature/your-feature-name
```

2. **Make Changes**
- Write clean, documented code
- Follow existing patterns
- Test thoroughly

3. **Commit Changes**
```bash
git add .
git commit -m "feat: add email node type"
```

Use conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `refactor:` Code refactoring
- `test:` Tests
- `chore:` Maintenance

4. **Push and Create PR**
```bash
git push origin feature/your-feature-name
```

Then open a PR on GitHub with:
- Clear description of changes
- Screenshots (if UI changes)
- Testing steps
- Related issues

## 🐛 Bug Reports

When reporting bugs, include:
- **Description**: What happened?
- **Expected**: What should happen?
- **Steps**: How to reproduce?
- **Environment**: Browser, Node version, etc.
- **Logs**: Console errors, worker logs

## 💡 Feature Requests

For feature requests, describe:
- **Problem**: What problem does this solve?
- **Solution**: Your proposed solution
- **Alternatives**: Other options considered
- **Use Case**: Real-world example

## 📚 Documentation

Help improve docs by:
- Fixing typos or unclear sections
- Adding examples and tutorials
- Creating workflow templates
- Writing integration guides

## 🎨 UI/UX Improvements

We love UI improvements! Consider:
- Better visual feedback
- Accessibility enhancements
- Mobile responsiveness
- Dark mode support
- Keyboard shortcuts

## 🔐 Security

Found a security issue? **Do not** open a public issue. Instead:
- Email security concerns to [your-email]
- Provide details privately
- Wait for confirmation before disclosure

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You!

Every contribution helps make AgentFlow better. We appreciate your time and effort!

---

Questions? Open a discussion or reach out to the maintainers.
