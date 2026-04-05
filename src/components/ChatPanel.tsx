import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { chatWithAgent, type ChatMessage } from "@/api/medimatch";
import { Send, Loader2, Bot, User } from "lucide-react";

interface ChatPanelProps {
  city: string;
}

const ChatPanel = ({ city }: ChatPanelProps) => {
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, loading]);

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg || loading) return;
    setInput("");
    setLoading(true);

    // Optimistically add user message
    const newHistory: ChatMessage[] = [...history, { role: "user", content: msg }];
    setHistory(newHistory);

    try {
      const { updated_history } = await chatWithAgent(msg, city, history);
      setHistory(updated_history);
    } catch {
      setHistory([
        ...newHistory,
        {
          role: "assistant",
          content:
            "Sorry, I couldn't connect to the server. Please make sure the backend is running and try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[500px] flex-col rounded-xl border bg-card shadow-sm">
      {/* Chat messages */}
      <ScrollArea className="flex-1 px-4 py-4">
        {history.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
            <Bot className="mb-3 h-10 w-10 text-primary/40" />
            <p className="text-lg font-medium">Hi! I'm your AI receptionist 👋</p>
            <p className="mt-1 max-w-sm text-sm">
              Tell me what's bothering you and I'll help find the right doctor in{" "}
              <span className="font-semibold text-primary">{city}</span>.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {history.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
              {msg.role === "user" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl bg-muted px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t p-3">
        <div className="flex gap-2">
          <Input
            placeholder="Describe your symptoms…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
