import { api } from "./api";
import { readCookie } from "@/lib/utils";

export type ChatMessage = { _id?: string; role: "user" | "assistant"; content: string; createdAt?: string };
export type StreamEvent = { delta?: string; done?: boolean; error?: string; notConfigured?: boolean };

const base = () => process.env.NEXT_PUBLIC_API_URL || "/api";

export const chatService = {
  history: async () => (await api.get<{ items: ChatMessage[]; provider: string | null }>("/chat/history")).data,
  clear: async () => (await api.delete("/chat/history")).data,
  /** POST /chat and stream SSE deltas. Retries once after refreshing the access token. */
  async stream(message: string, locale: string, onEvent: (e: StreamEvent) => void, signal?: AbortSignal) {
    const send = () =>
      fetch(`${base()}/chat`, {
        method: "POST",
        credentials: "include",
        signal,
        headers: { "Content-Type": "application/json", "X-CSRF-Token": readCookie("csrfToken") },
        body: JSON.stringify({ message, locale }),
      });
    let res = await send();
    if (res.status === 401) {
      await api.post("/auth/refresh");
      res = await send();
    }
    if (res.status === 429) return onEvent({ error: "RATE_LIMITED" });
    if (!res.ok || !res.body) return onEvent({ error: "NETWORK" });
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let idx;
      while ((idx = buffer.indexOf("\n\n")) >= 0) {
        const chunk = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);
        const line = chunk.split("\n").find((l) => l.startsWith("data:"));
        if (!line) continue;
        try {
          onEvent(JSON.parse(line.slice(5).trim()));
        } catch {
          /* ignore */
        }
      }
    }
  },
};
