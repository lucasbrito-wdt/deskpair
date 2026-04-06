import { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Trash2, Download, ArrowDown, Copy, Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { useServer } from "@/hooks/useServer";

export function LogsPage() {
  const { logs, clearLogs } = useServer();
  const [filter, setFilter] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredLogs = useMemo(() => {
    if (!filter) return logs;
    const lower = filter.toLowerCase();
    return logs.filter((line) => line.toLowerCase().includes(lower));
  }, [logs, filter]);

  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [filteredLogs, autoScroll]);

  function handleScroll() {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const atBottom = scrollHeight - scrollTop - clientHeight < 40;
    setAutoScroll(atBottom);
  }

  async function copyLogs() {
    const text = filteredLogs.join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function exportLogs() {
    const blob = new Blob([logs.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `touchvnc-logs-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function scrollToBottom() {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
      setAutoScroll(true);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-surface-800/40">
        <div
          className={cn(
            "flex flex-1 items-center gap-2 rounded-lg px-3 py-2",
            "bg-surface-800/50 border border-surface-700/30",
          )}
        >
          <Search className="h-3.5 w-3.5 text-surface-500 shrink-0" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter logs..."
            className={cn(
              "flex-1 bg-transparent text-sm text-surface-200 placeholder:text-surface-600",
              "focus:outline-none",
            )}
          />
        </div>

        <span className="text-[10px] font-mono text-surface-500">
          {filteredLogs.length} lines
        </span>

        <button
          onClick={copyLogs}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg",
            "border border-surface-700/50 bg-surface-800/50",
            "hover:bg-surface-700/50",
            copied
              ? "text-green-400 border-green-500/30"
              : "text-surface-400 hover:text-surface-300",
          )}
          title="Copy logs"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </button>

        <button
          onClick={exportLogs}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg",
            "border border-surface-700/50 bg-surface-800/50 text-surface-400",
            "hover:bg-surface-700/50 hover:text-surface-300",
          )}
          title="Export logs"
        >
          <Download className="h-3.5 w-3.5" />
        </button>

        <button
          onClick={clearLogs}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg",
            "border border-surface-700/50 bg-surface-800/50 text-surface-400",
            "hover:bg-red-500/15 hover:text-red-400 hover:border-red-500/30",
          )}
          title="Clear logs"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Log output */}
      <div className="relative flex-1 min-h-0">
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className={cn(
            "h-full overflow-y-auto p-4",
            "bg-surface-950/80",
            "font-mono text-xs leading-[1.7]",
          )}
        >
          {filteredLogs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-full text-surface-600"
            >
              {logs.length === 0 ? "No logs yet. Start the server to see output." : "No matching log lines."}
            </motion.div>
          ) : (
            filteredLogs.map((line, i) => (
              <div
                key={i}
                className={cn(
                  "whitespace-pre-wrap break-all",
                  line.includes("[stderr]")
                    ? "text-amber-400/80"
                    : line.includes("ERROR") || line.includes("error")
                      ? "text-red-400/80"
                      : "text-surface-400",
                )}
              >
                <span className="text-surface-600 select-none mr-3">{String(i + 1).padStart(4)}</span>
                {line}
              </div>
            ))
          )}
        </div>

        {/* Scroll-to-bottom button */}
        {!autoScroll && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={scrollToBottom}
            className={cn(
              "absolute bottom-4 right-4 flex h-8 w-8 items-center justify-center",
              "rounded-full bg-surface-800 border border-surface-700/50",
              "text-surface-400 hover:text-surface-200",
              "shadow-lg",
            )}
          >
            <ArrowDown className="h-4 w-4" />
          </motion.button>
        )}
      </div>
    </div>
  );
}
