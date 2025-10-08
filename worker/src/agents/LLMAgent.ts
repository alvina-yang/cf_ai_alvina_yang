interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatSession {
  id: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

interface Env {
  AI: Ai;
}

export class LLMAgent implements DurableObject {
  private state: DurableObjectState;
  private env: Env;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/chat' && request.method === 'POST') {
      return this.handleChat(request);
    }

    if (url.pathname === '/sessions' && request.method === 'GET') {
      return this.getSessions();
    }

    return new Response('Not found', { status: 404 });
  }

  private async handleChat(request: Request): Promise<Response> {
    try {
      const { message, sessionId, model = '@cf/meta/llama-3.3-70b-instruct-fp8-fast' } = await request.json() as any;

      await this.state.storage.sql.exec(
        'CREATE TABLE IF NOT EXISTS chat_sessions (id TEXT PRIMARY KEY, messages TEXT, created_at INTEGER, updated_at INTEGER)'
      );

      let session: ChatSession;
      if (sessionId) {
        const cursor = await this.state.storage.sql.exec('SELECT * FROM chat_sessions WHERE id = ?', sessionId);
        const rows = [...cursor];
        if (rows.length > 0) {
          session = {
            id: sessionId,
            messages: JSON.parse(rows[0].messages as string),
            createdAt: rows[0].created_at as number,
            updatedAt: Date.now(),
          };
        } else {
          session = {
            id: sessionId,
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
        }
      } else {
        session = {
          id: crypto.randomUUID(),
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
      }

      session.messages.push({ role: 'user', content: message });

      const aiResponse = await this.env.AI.run(model, {
        messages: session.messages,
      }) as any;

      session.messages.push({ role: 'assistant', content: aiResponse.response || aiResponse.text });

      await this.state.storage.sql.exec(
        `INSERT OR REPLACE INTO chat_sessions (id, messages, created_at, updated_at) 
         VALUES (?, ?, ?, ?)`,
        session.id,
        JSON.stringify(session.messages),
        session.createdAt,
        session.updatedAt
      );

      return Response.json({
        sessionId: session.id,
        response: aiResponse.response || aiResponse.text,
        messages: session.messages,
      });
    } catch (error) {
      console.error('Chat error:', error);
      return Response.json({ error: String(error) }, { status: 500 });
    }
  }

  private async getSessions(): Promise<Response> {
    try {
      await this.state.storage.sql.exec(
        'CREATE TABLE IF NOT EXISTS chat_sessions (id TEXT PRIMARY KEY, messages TEXT, created_at INTEGER, updated_at INTEGER)'
      );

      const cursor = await this.state.storage.sql.exec('SELECT * FROM chat_sessions ORDER BY updated_at DESC LIMIT 50');
      const rows = [...cursor];

      const sessions = rows.map((row: any) => ({
        id: row.id,
        messageCount: JSON.parse(row.messages).length,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

      return Response.json({ sessions });
    } catch (error) {
      console.error('Sessions error:', error);
      return Response.json({ error: String(error) }, { status: 500 });
    }
  }
}
