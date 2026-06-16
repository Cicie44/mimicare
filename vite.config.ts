import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";
import type { IncomingMessage, ServerResponse } from "node:http";

// Reads a Node.js HTTP request body as a string
function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk: Buffer) => {
      body += chunk.toString();
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function sendJson(res: ServerResponse, status: number, data: object) {
  res.setHeader("Content-Type", "application/json");
  res.writeHead(status);
  res.end(JSON.stringify(data));
}

// Vite dev-only plugin: handles /api/generate-caption locally.
// In production, api/generate-caption.ts (Vercel Function) handles this route.
function captionApiPlugin(openaiApiKey: string): Plugin {
  return {
    name: "caption-api",
    configureServer(server) {
      server.middlewares.use(
        "/api/generate-caption",
        async (req: IncomingMessage, res: ServerResponse) => {
          if (req.method !== "POST") {
            sendJson(res, 405, { error: "Method not allowed" });
            return;
          }

          if (!openaiApiKey) {
            sendJson(res, 500, {
              error: "OPENAI_API_KEY is not set in your .env file",
            });
            return;
          }

          let bodyStr: string;
          try {
            bodyStr = await readBody(req);
          } catch {
            sendJson(res, 400, { error: "Failed to read request body" });
            return;
          }

          let body: { mood?: unknown };
          try {
            body = JSON.parse(bodyStr) as { mood?: unknown };
          } catch {
            sendJson(res, 400, { error: "Invalid JSON body" });
            return;
          }

          const mood = body.mood;
          if (!mood || typeof mood !== "string" || mood.trim().length === 0) {
            sendJson(res, 400, { error: "mood is required" });
            return;
          }

          let openaiRes: Response;
          try {
            openaiRes = await fetch(
              "https://api.openai.com/v1/chat/completions",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${openaiApiKey}`,
                },
                body: JSON.stringify({
                  model: "gpt-4o-mini",
                  messages: [
                    {
                      role: "system",
                      content:
                        'You write cute, funny cat meme captions. Keep each caption under 60 characters. Write in the voice of a cat — dramatic, self-important, or sleepy. Return a JSON object with a "captions" key containing an array of exactly 4 caption strings.',
                    },
                    {
                      role: "user",
                      content: `Generate 4 cute cat meme captions for this mood or situation: ${mood.trim()}`,
                    },
                  ],
                  response_format: { type: "json_object" },
                  max_tokens: 300,
                }),
              }
            );
          } catch (err) {
            const message =
              err instanceof Error ? err.message : "Failed to reach OpenAI";
            sendJson(res, 500, { error: message });
            return;
          }

          if (!openaiRes.ok) {
            let errMsg = "OpenAI request failed";
            try {
              const errData = (await openaiRes.json()) as {
                error?: { message?: string };
              };
              errMsg = errData.error?.message ?? errMsg;
            } catch {
              // ignore JSON parse error
            }
            sendJson(res, 500, { error: errMsg });
            return;
          }

          const data = (await openaiRes.json()) as {
            choices: [{ message: { content: string } }];
          };

          let captions: string[] = [];
          try {
            const parsed = JSON.parse(data.choices[0].message.content) as {
              captions?: string[];
            } & Record<string, unknown>;
            if (Array.isArray(parsed.captions)) {
              captions = parsed.captions;
            } else {
              captions = Object.values(parsed).filter(
                (v): v is string => typeof v === "string"
              );
            }
          } catch {
            sendJson(res, 500, { error: "Failed to parse AI response" });
            return;
          }

          sendJson(res, 200, { captions });
        }
      );
    },
  };
}

export default defineConfig(({ mode }) => {
  // Load ALL env vars (not just VITE_-prefixed) so OPENAI_API_KEY is available here
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), captionApiPlugin(env.OPENAI_API_KEY ?? "")],
  };
});
