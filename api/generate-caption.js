"use strict";
// Node.js runtime (default) — supported by `vercel dev` locally and Vercel production
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
/* eslint-disable @typescript-eslint/no-explicit-any */
async function readBody(req) {
    return new Promise((resolve, reject) => {
        let body = "";
        req.on("data", (chunk) => (body += chunk.toString()));
        req.on("end", () => resolve(body));
        req.on("error", reject);
    });
}
function json(res, status, data) {
    res.setHeader("Content-Type", "application/json");
    res.writeHead(status);
    res.end(JSON.stringify(data));
}
async function handler(req, res) {
    if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
    }
    if (req.method !== "POST") {
        json(res, 405, { error: "Method not allowed" });
        return;
    }
    let body;
    try {
        const raw = await readBody(req);
        body = JSON.parse(raw);
    }
    catch {
        json(res, 400, { error: "Invalid JSON body" });
        return;
    }
    const mood = body.mood;
    if (!mood || typeof mood !== "string" || mood.trim().length === 0) {
        json(res, 400, { error: "mood is required" });
        return;
    }
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        json(res, 500, { error: "OpenAI API key not configured on server" });
        return;
    }
    let openaiRes;
    try {
        openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: 'You write cute, funny cat meme captions. Keep each caption under 60 characters. Write in the voice of a cat — dramatic, self-important, or sleepy. Return a JSON object with a "captions" key containing an array of exactly 4 caption strings.',
                    },
                    {
                        role: "user",
                        content: `Generate 4 cute cat meme captions for this mood or situation: ${mood.trim()}`,
                    },
                ],
                response_format: { type: "json_object" },
                max_tokens: 300,
            }),
        });
    }
    catch (err) {
        json(res, 500, { error: err?.message ?? "Failed to reach OpenAI" });
        return;
    }
    if (!openaiRes.ok) {
        let errMsg = "OpenAI request failed";
        try {
            const errData = await openaiRes.json();
            errMsg = errData?.error?.message ?? errMsg;
        }
        catch {
            // ignore parse error
        }
        json(res, 500, { error: errMsg });
        return;
    }
    const data = await openaiRes.json();
    let captions = [];
    try {
        const parsed = JSON.parse(data.choices[0].message.content);
        if (Array.isArray(parsed.captions)) {
            captions = parsed.captions;
        }
        else {
            captions = Object.values(parsed).filter((v) => typeof v === "string");
        }
    }
    catch {
        json(res, 500, { error: "Failed to parse AI response" });
        return;
    }
    json(res, 200, { captions });
}
