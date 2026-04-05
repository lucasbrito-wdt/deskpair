import { useState } from "react";
import { Shield, Loader2, KeyRound } from "lucide-react";
import { cn } from "@/lib/cn";
import { useConfig } from "@/hooks/useConfig";
import { generateTlsCerts, generateRsaKey } from "@/lib/tauri";

export function SecuritySettings() {
  const { config, updateField } = useConfig();
  const [generatingTls, setGeneratingTls] = useState(false);
  const [generatingRsa, setGeneratingRsa] = useState(false);
  const [tlsPaths, setTlsPaths] = useState<{ cert: string; key: string } | null>(null);
  const [rsaPath, setRsaPath] = useState<string | null>(null);

  async function handleGenerateTls() {
    setGeneratingTls(true);
    try {
      const paths = await generateTlsCerts();
      setTlsPaths(paths);
    } catch (err) {
      console.error("TLS generation failed:", err);
    } finally {
      setGeneratingTls(false);
    }
  }

  async function handleGenerateRsa() {
    setGeneratingRsa(true);
    try {
      const path = await generateRsaKey();
      setRsaPath(path);
    } catch (err) {
      console.error("RSA generation failed:", err);
    } finally {
      setGeneratingRsa(false);
    }
  }

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-surface-400" />
        <h3 className="text-sm font-semibold text-surface-200 uppercase tracking-wider">
          Security
        </h3>
      </div>

      {/* Auth toggle */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm text-surface-200">Enable Authentication</span>
          <p className="text-xs text-surface-500 mt-0.5">Require credentials to connect</p>
        </div>
        <button
          onClick={() => updateField("enableAuth", !config.enableAuth)}
          className={cn(
            "relative h-6 w-11 rounded-full transition-colors",
            config.enableAuth ? "bg-accent-500" : "bg-surface-700",
          )}
          role="switch"
          aria-checked={config.enableAuth}
        >
          <span
            className={cn(
              "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
              config.enableAuth ? "translate-x-5.5" : "translate-x-0.5",
            )}
          />
        </button>
      </div>

      {/* Username / Password */}
      {config.enableAuth && (
        <div className="grid grid-cols-2 gap-3 pl-1">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-surface-400">Username</span>
            <input
              type="text"
              value={config.username}
              onChange={(e) => updateField("username", e.target.value)}
              className={cn(
                "rounded-lg px-3 py-2 text-sm",
                "bg-surface-800/60 border border-surface-700/40 text-surface-200",
                "focus:outline-none focus:border-accent-500/50",
              )}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-surface-400">Password</span>
            <input
              type="password"
              value={config.password}
              onChange={(e) => updateField("password", e.target.value)}
              className={cn(
                "rounded-lg px-3 py-2 text-sm",
                "bg-surface-800/60 border border-surface-700/40 text-surface-200",
                "focus:outline-none focus:border-accent-500/50",
              )}
            />
          </label>
        </div>
      )}

      {/* TLS */}
      <div className="flex flex-col gap-3 pt-2 border-t border-surface-800/30">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-surface-200">TLS Encryption</span>
            <p className="text-xs text-surface-500 mt-0.5">Encrypt VNC traffic</p>
          </div>
          <button
            onClick={() => updateField("tlsEnabled", !config.tlsEnabled)}
            className={cn(
              "relative h-6 w-11 rounded-full transition-colors",
              config.tlsEnabled ? "bg-accent-500" : "bg-surface-700",
            )}
            role="switch"
            aria-checked={config.tlsEnabled}
          >
            <span
              className={cn(
                "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                config.tlsEnabled ? "translate-x-5.5" : "translate-x-0.5",
              )}
            />
          </button>
        </div>

        {config.tlsEnabled && (
          <div className="flex flex-col gap-2 pl-1">
            <button
              onClick={handleGenerateTls}
              disabled={generatingTls}
              className={cn(
                "flex items-center gap-2 self-start rounded-lg px-4 py-2 text-xs font-medium",
                "border border-surface-700/50 bg-surface-800/50 text-surface-300",
                "hover:bg-surface-700/50 disabled:opacity-50",
              )}
            >
              {generatingTls ? <Loader2 className="h-3 w-3 animate-spin" /> : <KeyRound className="h-3 w-3" />}
              Generate TLS Certificates
            </button>
            {tlsPaths && (
              <div className="text-[10px] font-mono text-surface-500 space-y-0.5">
                <p>Cert: {tlsPaths.cert}</p>
                <p>Key: {tlsPaths.key}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* RSA-AES */}
      <div className="flex flex-col gap-2 pt-2 border-t border-surface-800/30">
        <span className="text-sm text-surface-200">RSA-AES Key</span>
        <button
          onClick={handleGenerateRsa}
          disabled={generatingRsa}
          className={cn(
            "flex items-center gap-2 self-start rounded-lg px-4 py-2 text-xs font-medium",
            "border border-surface-700/50 bg-surface-800/50 text-surface-300",
            "hover:bg-surface-700/50 disabled:opacity-50",
          )}
        >
          {generatingRsa ? <Loader2 className="h-3 w-3 animate-spin" /> : <KeyRound className="h-3 w-3" />}
          Generate RSA Key
        </button>
        {rsaPath && (
          <span className="text-[10px] font-mono text-surface-500">{rsaPath}</span>
        )}
      </div>
    </section>
  );
}
