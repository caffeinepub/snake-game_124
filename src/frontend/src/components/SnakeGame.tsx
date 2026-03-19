import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSubmitScore } from "@/hooks/useQueries";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

const GRID_SIZE = 20;
const CELL_SIZE = 24;
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;
const TICK_INTERVAL = 120;

type Point = { x: number; y: number };
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

interface GameState {
  snake: Point[];
  food: Point;
  dir: Direction;
  nextDir: Direction;
  score: number;
  running: boolean;
  paused: boolean;
  dead: boolean;
}

function randomFood(snake: Point[]): Point {
  let pos: Point;
  do {
    pos = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (snake.some((s) => s.x === pos.x && s.y === pos.y));
  return pos;
}

function initState(): GameState {
  const snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];
  return {
    snake,
    food: randomFood(snake),
    dir: "RIGHT",
    nextDir: "RIGHT",
    score: 0,
    running: true,
    paused: false,
    dead: false,
  };
}

const NEON_GREEN = "#39FF14";
const NEON_MAGENTA = "#FF4FD8";
const BG_COLOR = "#070A0A";
const GRID_COLOR = "rgba(57,255,20,0.06)";

function drawGame(ctx: CanvasRenderingContext2D, state: GameState) {
  const { snake, food } = state;

  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  ctx.strokeStyle = GRID_COLOR;
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= GRID_SIZE; i++) {
    ctx.beginPath();
    ctx.moveTo(i * CELL_SIZE, 0);
    ctx.lineTo(i * CELL_SIZE, CANVAS_SIZE);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * CELL_SIZE);
    ctx.lineTo(CANVAS_SIZE, i * CELL_SIZE);
    ctx.stroke();
  }

  const fx = food.x * CELL_SIZE + CELL_SIZE / 2;
  const fy = food.y * CELL_SIZE + CELL_SIZE / 2;
  ctx.save();
  ctx.shadowColor = NEON_MAGENTA;
  ctx.shadowBlur = 18;
  ctx.fillStyle = NEON_MAGENTA;
  ctx.beginPath();
  ctx.arc(fx, fy, CELL_SIZE / 2 - 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  snake.forEach((seg, idx) => {
    const x = seg.x * CELL_SIZE;
    const y = seg.y * CELL_SIZE;
    const r = idx === 0 ? 7 : 5;
    const alpha = idx === 0 ? 1 : Math.max(0.4, 1 - idx * 0.04);
    ctx.save();
    ctx.shadowColor = NEON_GREEN;
    ctx.shadowBlur = idx === 0 ? 20 : 10;
    ctx.fillStyle = idx === 0 ? NEON_GREEN : `rgba(57,255,20,${alpha})`;
    ctx.beginPath();
    const pad = idx === 0 ? 1 : 2;
    ctx.roundRect(
      x + pad,
      y + pad,
      CELL_SIZE - pad * 2,
      CELL_SIZE - pad * 2,
      r,
    );
    ctx.fill();
    ctx.restore();
  });

  if (snake.length > 0) {
    const head = snake[0];
    const hx = head.x * CELL_SIZE;
    const hy = head.y * CELL_SIZE;
    ctx.fillStyle = BG_COLOR;
    ctx.beginPath();
    ctx.arc(hx + 7, hy + 7, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(hx + CELL_SIZE - 7, hy + 7, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

interface Props {
  onScoreChange: (score: number) => void;
  highScore: number;
  onHighScore: (score: number) => void;
}

export default function SnakeGame({
  onScoreChange,
  highScore,
  onHighScore,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>(initState());
  const animRef = useRef<number>(0);
  const lastTickRef = useRef<number>(0);
  const [score, setScore] = useState(0);
  const [isDead, setIsDead] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const submitScore = useSubmitScore();

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawGame(ctx, stateRef.current);
  }, []);

  const gameLoop = useCallback(
    (timestamp: number) => {
      const state = stateRef.current;
      if (state.dead) {
        render();
        return;
      }
      if (!state.paused) {
        if (timestamp - lastTickRef.current >= TICK_INTERVAL) {
          lastTickRef.current = timestamp;
          state.dir = state.nextDir;

          const head = state.snake[0];
          let nx = head.x;
          let ny = head.y;
          if (state.dir === "UP") ny--;
          else if (state.dir === "DOWN") ny++;
          else if (state.dir === "LEFT") nx--;
          else nx++;

          if (nx < 0 || nx >= GRID_SIZE || ny < 0 || ny >= GRID_SIZE) {
            state.dead = true;
            setIsDead(true);
            setScore(state.score);
            onScoreChange(state.score);
            if (state.score > highScore) onHighScore(state.score);
            render();
            return;
          }

          if (state.snake.some((s) => s.x === nx && s.y === ny)) {
            state.dead = true;
            setIsDead(true);
            setScore(state.score);
            onScoreChange(state.score);
            if (state.score > highScore) onHighScore(state.score);
            render();
            return;
          }

          const ate = nx === state.food.x && ny === state.food.y;
          const newSnake = [{ x: nx, y: ny }, ...state.snake];
          if (!ate) newSnake.pop();
          else {
            state.score += 10;
            setScore(state.score);
            onScoreChange(state.score);
            if (state.score > highScore) onHighScore(state.score);
            state.food = randomFood(newSnake);
          }
          state.snake = newSnake;
        }
      }
      render();
      animRef.current = requestAnimationFrame(gameLoop);
    },
    [render, highScore, onHighScore, onScoreChange],
  );

  const startLoop = useCallback(() => {
    cancelAnimationFrame(animRef.current);
    lastTickRef.current = 0;
    animRef.current = requestAnimationFrame(gameLoop);
  }, [gameLoop]);

  const restart = useCallback(() => {
    stateRef.current = initState();
    setScore(0);
    setIsDead(false);
    setSubmitted(false);
    setPlayerName("");
    onScoreChange(0);
    startLoop();
  }, [startLoop, onScoreChange]);

  useEffect(() => {
    startLoop();
    return () => cancelAnimationFrame(animRef.current);
  }, [startLoop]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const state = stateRef.current;
      const { key } = e;

      if (key === "p" || key === "P") {
        state.paused = !state.paused;
        if (!state.paused) {
          animRef.current = requestAnimationFrame(gameLoop);
        }
        return;
      }
      if (key === "r" || key === "R") {
        restart();
        return;
      }

      const dirMap: Record<string, Direction> = {
        ArrowUp: "UP",
        w: "UP",
        W: "UP",
        ArrowDown: "DOWN",
        s: "DOWN",
        S: "DOWN",
        ArrowLeft: "LEFT",
        a: "LEFT",
        A: "LEFT",
        ArrowRight: "RIGHT",
        d: "RIGHT",
        D: "RIGHT",
      };
      const newDir = dirMap[key];
      if (!newDir) return;
      e.preventDefault();

      const opposites: Record<Direction, Direction> = {
        UP: "DOWN",
        DOWN: "UP",
        LEFT: "RIGHT",
        RIGHT: "LEFT",
      };
      if (newDir !== opposites[state.dir]) {
        state.nextDir = newDir;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [gameLoop, restart]);

  const handleSubmit = () => {
    if (!playerName.trim()) return;
    submitScore.mutate(
      { name: playerName.trim(), score },
      { onSuccess: () => setSubmitted(true) },
    );
  };

  return (
    <div
      className="relative"
      style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
    >
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        data-ocid="game.canvas_target"
        style={{ display: "block" }}
      />

      <AnimatePresence>
        {isDead && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{
              background: "rgba(7,10,10,0.88)",
              backdropFilter: "blur(4px)",
            }}
            data-ocid="game.modal"
          >
            <p
              className="font-orbitron text-xl font-bold mb-1"
              style={{ color: "#FF4FD8", textShadow: "0 0 20px #FF4FD8" }}
            >
              GAME OVER
            </p>
            <p
              className="font-orbitron text-3xl font-black mb-4"
              style={{ color: "#39FF14", textShadow: "0 0 20px #39FF14" }}
            >
              {score}
            </p>

            {!submitted ? (
              <div className="flex flex-col gap-2 w-48">
                <Input
                  placeholder="Your name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  className="text-center font-orbitron text-xs"
                  style={{
                    background: "rgba(57,255,20,0.06)",
                    border: "1px solid rgba(57,255,20,0.5)",
                    color: "#F2F2F2",
                  }}
                  data-ocid="game.input"
                />
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitScore.isPending}
                  className="neon-btn-magenta font-orbitron text-xs py-2 px-4 rounded"
                  data-ocid="game.submit_button"
                >
                  {submitScore.isPending ? "SAVING..." : "SUBMIT SCORE"}
                </button>
              </div>
            ) : (
              <p className="font-orbitron text-xs" style={{ color: "#39FF14" }}>
                SCORE SAVED!
              </p>
            )}

            <Button
              onClick={restart}
              className="mt-4 neon-btn font-orbitron text-xs py-1.5 px-6"
              variant="ghost"
              data-ocid="game.primary_button"
            >
              RESTART
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
