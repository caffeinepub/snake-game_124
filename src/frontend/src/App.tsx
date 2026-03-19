import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { motion } from "motion/react";
import { useCallback, useState } from "react";
import SnakeGame from "./components/SnakeGame";
import { useLeaderboard } from "./hooks/useQueries";

const queryClient = new QueryClient();

const MEDALS = ["🥇", "🥈", "🥉"];

function LeaderboardCard() {
  const { data: entries = [], isLoading } = useLeaderboard();

  return (
    <div
      className="rounded-lg p-5 flex flex-col gap-3"
      style={{
        background: "oklch(0.12 0.015 165)",
        border: "1px solid oklch(0.87 0.29 140 / 0.35)",
        boxShadow: "0 0 20px oklch(0.87 0.29 140 / 0.08)",
        minHeight: 280,
      }}
    >
      <h3
        className="font-orbitron font-bold text-sm uppercase tracking-widest mb-2"
        style={{ color: "#39FF14", textShadow: "0 0 10px #39FF1488" }}
      >
        🏆 Live Leaderboard
      </h3>
      {isLoading ? (
        <p
          className="font-orbitron text-xs"
          style={{ color: "#B8B8B8" }}
          data-ocid="leaderboard.loading_state"
        >
          Loading...
        </p>
      ) : entries.length === 0 ? (
        <p
          className="font-orbitron text-xs"
          style={{ color: "#B8B8B8" }}
          data-ocid="leaderboard.empty_state"
        >
          No scores yet. Be the first!
        </p>
      ) : (
        <div className="flex flex-col gap-2" data-ocid="leaderboard.list">
          {entries.map((entry, i) => (
            <div
              key={`${entry.name}-${entry.score}-${i}`}
              className="flex items-center justify-between"
              style={{
                borderBottom: "1px solid oklch(0.87 0.29 140 / 0.1)",
                paddingBottom: 6,
              }}
              data-ocid={`leaderboard.item.${i + 1}`}
            >
              <span
                className="font-orbitron text-xs"
                style={{ color: "#B8B8B8" }}
              >
                {MEDALS[i] ?? `#${i + 1}`} {entry.name}
              </span>
              <span
                className="font-orbitron text-sm font-bold"
                style={{ color: "#39FF14", textShadow: "0 0 6px #39FF1466" }}
              >
                {entry.score}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function HowToPlayCard() {
  return (
    <div
      className="rounded-lg p-5 flex flex-col gap-3"
      style={{
        background: "oklch(0.12 0.015 165)",
        border: "1px solid oklch(0.65 0.28 325 / 0.35)",
        boxShadow: "0 0 20px oklch(0.65 0.28 325 / 0.08)",
        minHeight: 280,
      }}
    >
      <h3
        className="font-orbitron font-bold text-sm uppercase tracking-widest mb-2"
        style={{ color: "#FF4FD8", textShadow: "0 0 10px #FF4FD888" }}
      >
        📖 How to Play
      </h3>
      <div className="flex flex-col gap-2">
        {[
          ["Arrow Keys / WASD", "Move snake"],
          ["P", "Pause / Resume"],
          ["R", "Restart game"],
          ["+10", "Per food eaten"],
          ["Avoid", "Walls & yourself"],
        ].map(([key, desc]) => (
          <div key={key} className="flex items-center gap-3">
            <span
              className="font-orbitron text-xs font-bold px-2 py-1 rounded"
              style={{
                color: "#39FF14",
                border: "1px solid oklch(0.87 0.29 140 / 0.4)",
                background: "oklch(0.09 0.012 165)",
                whiteSpace: "nowrap",
                minWidth: 100,
                textAlign: "center",
              }}
            >
              {key}
            </span>
            <span
              className="font-orbitron text-xs"
              style={{ color: "#B8B8B8" }}
            >
              {desc}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GameApp() {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const handleHighScore = useCallback((s: number) => {
    setHighScore((prev) => Math.max(prev, s));
  }, []);

  return (
    <div className="min-h-screen circuit-bg flex flex-col">
      {/* Header */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-8 py-4"
        style={{
          background: "oklch(0.09 0.012 165 / 0.95)",
          borderBottom: "1px solid oklch(0.87 0.29 140 / 0.25)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div className="flex items-center gap-3">
          <div>
            <div
              className="font-orbitron font-black text-2xl tracking-widest animate-flicker"
              style={{
                color: "#39FF14",
                textShadow: "0 0 15px #39FF14, 0 0 30px #39FF1466",
              }}
            >
              NEON SNAKE
            </div>
            <div
              className="font-orbitron text-xs tracking-[0.3em]"
              style={{ color: "#B8B8B8" }}
            >
              ARCADE
            </div>
          </div>
        </div>
        <nav className="flex items-center gap-6">
          <a
            href="#game"
            className="font-orbitron text-xs tracking-widest neon-green"
            data-ocid="nav.link"
          >
            PLAY
          </a>
          <a
            href="#leaderboard"
            className="font-orbitron text-xs tracking-widest"
            style={{ color: "#B8B8B8" }}
            data-ocid="nav.link"
          >
            SCORES
          </a>
          <button
            type="button"
            className="neon-btn font-orbitron text-xs tracking-widest py-2 px-5 rounded"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            data-ocid="nav.primary_button"
          >
            PLAY NOW
          </button>
        </nav>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center py-10 px-4 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full"
          style={{ maxWidth: 1060 }}
          id="game"
        >
          {/* Game Panel */}
          <div
            className="rounded-xl p-6 mb-8"
            style={{
              background: "oklch(0.12 0.015 165)",
              border: "1px solid oklch(0.87 0.29 140 / 0.5)",
              boxShadow:
                "0 0 30px oklch(0.87 0.29 140 / 0.15), 0 0 60px oklch(0.87 0.29 140 / 0.07)",
            }}
          >
            {/* Score Strip */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex gap-8">
                <div>
                  <div
                    className="font-orbitron text-xs tracking-widest"
                    style={{ color: "#B8B8B8" }}
                  >
                    SCORE
                  </div>
                  <div
                    className="font-orbitron text-3xl font-black"
                    style={{ color: "#39FF14", textShadow: "0 0 15px #39FF14" }}
                    data-ocid="game.panel"
                  >
                    {score}
                  </div>
                </div>
                <div>
                  <div
                    className="font-orbitron text-xs tracking-widest"
                    style={{ color: "#B8B8B8" }}
                  >
                    HIGH SCORE
                  </div>
                  <div
                    className="font-orbitron text-3xl font-black"
                    style={{ color: "#FF4FD8", textShadow: "0 0 15px #FF4FD8" }}
                  >
                    {highScore}
                  </div>
                </div>
              </div>
            </div>

            {/* Game + Controls */}
            <div className="flex gap-6 flex-wrap">
              {/* Canvas */}
              <div
                className="rounded-lg overflow-hidden"
                style={{
                  border: "2px solid oklch(0.87 0.29 140 / 0.7)",
                  boxShadow:
                    "0 0 25px #39FF1440, inset 0 0 25px rgba(57,255,20,0.04)",
                }}
              >
                <SnakeGame
                  onScoreChange={setScore}
                  highScore={highScore}
                  onHighScore={handleHighScore}
                />
              </div>

              {/* Controls */}
              <div className="flex flex-col gap-4 min-w-[180px]">
                <h4
                  className="font-orbitron font-bold text-xs uppercase tracking-widest"
                  style={{ color: "#39FF14", textShadow: "0 0 8px #39FF1466" }}
                >
                  Game Controls
                </h4>

                <div className="flex flex-col gap-3">
                  <div className="flex flex-col items-center gap-1">
                    <div className="key-badge">↑</div>
                    <div className="flex gap-1">
                      <div className="key-badge">←</div>
                      <div className="key-badge">↓</div>
                      <div className="key-badge">→</div>
                    </div>
                  </div>
                  <p
                    className="font-orbitron text-xs"
                    style={{ color: "#B8B8B8" }}
                  >
                    or WASD keys
                  </p>
                </div>

                <div className="flex flex-col gap-2 mt-2">
                  {[
                    ["P", "Pause"],
                    ["R", "Restart"],
                  ].map(([k, label]) => (
                    <div key={k} className="flex items-center gap-2">
                      <div className="key-badge">{k}</div>
                      <span
                        className="font-orbitron text-xs"
                        style={{ color: "#B8B8B8" }}
                      >
                        {label}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      window.dispatchEvent(
                        new KeyboardEvent("keydown", { key: "r" }),
                      );
                    }}
                    className="neon-btn font-orbitron text-xs py-2 px-4 rounded"
                    data-ocid="game.secondary_button"
                  >
                    ↺ RESTART
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Lower cards */}
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            id="leaderboard"
          >
            <LeaderboardCard />
            <HowToPlayCard />
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer
        className="text-center py-5 font-orbitron text-xs"
        style={{
          color: "#B8B8B8",
          borderTop: "1px solid oklch(0.87 0.29 140 / 0.15)",
        }}
      >
        © {new Date().getFullYear()}. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noreferrer"
          style={{ color: "#39FF14" }}
        >
          caffeine.ai
        </a>
      </footer>

      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GameApp />
    </QueryClientProvider>
  );
}
