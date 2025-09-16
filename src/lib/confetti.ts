// src/lib/confetti.ts
"use client";

import confetti from "canvas-confetti";

// 這一行一定要有，讓外部可以拿到 EffectName 型別
export type EffectName = "celebrate" | "fireworks" | "streamer" | "romance" | "gold";

export function playConfetti(effect: EffectName = "celebrate") {
  const w = window;

  const base = (opts: confetti.Options) =>
    confetti({
      ...opts,
      origin: { y: 0.6 }, // 從畫面中下方噴出
    });

  // 各種漂亮效果
  const effects: Record<EffectName, () => void> = {
    celebrate: () => {
      base({ particleCount: 140, spread: 70, startVelocity: 55 });
      base({ particleCount: 90, spread: 120, decay: 0.92, scalar: 0.9 });
    },

    fireworks: () => {
      let count = 16;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
      const interval = setInterval(function () {
        base({
          ...defaults,
          particleCount: 20,
          scalar: 0.9,
          origin: { x: Math.random(), y: Math.random() * 0.4 + 0.1 },
        });
        if (--count === 0) clearInterval(interval);
      }, 120);
    },

    streamer: () => {
      base({
        particleCount: 200,
        spread: 40,
        scalar: 1.2,
        gravity: 1.2,
        startVelocity: 25,
        colors: ["#4D96FF", "#00C2A8", "#6BCB77", "#FFD93D"],
      });
    },

    romance: () => {
      base({
        particleCount: 160,
        spread: 80,
        colors: ["#FF6B6B", "#EC4899", "#F472B6", "#FCA5A5"],
        scalar: 0.9,
        decay: 0.9,
      });
    },

    gold: () => {
      base({
        particleCount: 180,
        spread: 75,
        startVelocity: 55,
        colors: ["#E5B80B", "#F5D547", "#FFE08A"],
        scalar: 1.1,
      });
      base({
        particleCount: 100,
        spread: 120,
        decay: 0.92,
        scalar: 0.8,
        colors: ["#FDE68A", "#FBBF24"],
      });
    },
  };

  effects[effect]();
}
