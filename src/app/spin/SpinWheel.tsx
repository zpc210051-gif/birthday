"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Segment = { label: string; weight?: number };

type Props = {
  segments?: Segment[];
  size?: number;
  disabled?: boolean;                 // 外層控制是否可轉
  onRequestSpin?: () => boolean;      // 外層回傳 true 表示可以扣次數並開始轉
  onFinish?: (label: string) => void; // 抽完回呼
};

export default function SpinWheel({
  segments = [
    { label: "親親一次" },
    { label: "擁抱一下" },
    { label: "指定晚餐" },
    { label: "按摩 10 分" },
    { label: "看電影券" },
    { label: "小驚喜！" },
    { label: "手寫小卡" },
    { label: "任性一天" },
  ],
  size = 360,
  disabled = false,
  onRequestSpin,
  onFinish,
}: Props) {
  const radius = size / 2;
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [angle, setAngle] = useState(0);
  const frameRef = useRef<number | null>(null);

  const arc = 360 / segments.length;

  // 顏色帶
  const colors = useMemo(
    () =>
      [
        "#FF6B6B",
        "#FFD93D",
        "#6BCB77",
        "#4D96FF",
        "#B980F0",
        "#FF8E00",
        "#00C2A8",
        "#EC4899",
      ].slice(0, segments.length),
    [segments.length]
  );

  // 權重抽樣
  const pickIndex = () => {
    const weights = segments.map((s) => s.weight ?? 1);
    const total = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (let i = 0; i < weights.length; i++) {
      if (r < weights[i]) return i;
      r -= weights[i];
    }
    return segments.length - 1;
  };

  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

  const spin = () => {
    if (spinning) return;
    setError(null);

    // 由外層決定是否允許（也可在這裡扣次數）
    if (onRequestSpin && !onRequestSpin()) {
      setError("目前沒有可用的抽獎次數 🥲");
      return;
    }

    const targetIndex = pickIndex();
    const targetLabel = segments[targetIndex].label;

    const targetCenter = targetIndex * arc + arc / 2;
    const base = 360 - targetCenter;

    const turns = 6 + Math.floor(Math.random() * 2);
    const duration = 3500 + Math.random() * 700;
    const finalAngle = turns * 360 + base;

    setSpinning(true);
    const start = performance.now();
    const startAngle = angle % 360;

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = easeOutCubic(t);
      const a = startAngle + eased * (finalAngle - startAngle);
      setAngle(a);

      if (t < 1) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        cancelAnimationFrame(frameRef.current || 0);
        setSpinning(false);
        setResult(targetLabel);
        onFinish?.(targetLabel);
      }
    };

    frameRef.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  // 生成輪盤扇形 path
  const paths = segments.map((s, i) => {
    const a0 = ((i * arc - 90) * Math.PI) / 180;
    const a1 = (((i + 1) * arc - 90) * Math.PI) / 180;
    const x0 = radius + radius * Math.cos(a0);
    const y0 = radius + radius * Math.sin(a0);
    const x1 = radius + radius * Math.cos(a1);
    const y1 = radius + radius * Math.sin(a1);
    const largeArc = arc > 180 ? 1 : 0;
    const d = `M ${radius} ${radius} L ${x0} ${y0} A ${radius} ${radius} 0 ${largeArc} 1 ${x1} ${y1} Z`;
    return { d };
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        {/* 指針 */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-4" style={{ zIndex: 10 }}>
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: "12px solid transparent",
              borderRight: "12px solid transparent",
              borderBottom: "18px solid #111",
            }}
          />
        </div>

        {/* 輪盤本體 */}
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: `rotate(${angle}deg)` }}
        >
          <circle cx={radius} cy={radius} r={radius} fill="#f3f4f6" />
          {paths.map((p, i) => (
            <path key={i} d={p.d} fill={colors[i % colors.length]} />
          ))}
          {segments.map((s, i) => {
            const arc = 360 / segments.length;
            const centerAngle = i * arc + arc / 2 - 90;
            const rad = (centerAngle * Math.PI) / 180;
            const tx = radius + (radius * 0.62) * Math.cos(rad);
            const ty = radius + (radius * 0.62) * Math.sin(rad);
            return (
              <text
                key={i}
                x={tx}
                y={ty}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#fff"
                style={{ fontSize: Math.max(12, size * 0.035), fontWeight: 700 }}
                transform={`rotate(${centerAngle + 90}, ${tx}, ${ty})`}
              >
                {s.label}
              </text>
            );
          })}
          <circle cx={radius} cy={radius} r={radius * 0.08} fill="#111" />
        </svg>
      </div>

      <button
        onClick={spin}
        disabled={spinning || disabled}
        className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
      >
        {spinning ? "轉動中…" : "開始抽"}
      </button>

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {result && (
        <div className="text-center">
          <p className="text-lg font-bold">🎉 抽到：{result}</p>
        </div>
      )}
    </div>
  );
}
