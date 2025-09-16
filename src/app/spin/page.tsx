"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import SpinWheel from "./SpinWheel";
import { playConfetti } from "@/lib/confetti";
import type { EffectName } from "@/lib/confetti";

// ================== 設定區 ==================
const BASE_DAILY_SPINS = 1;

// 每日任務（每天可領一次）
const dailyTasks = [
  { code: "quest1", title: "完美的照片一張", spins: 2 },
  { code: "quest2", title: "保持愉悅的心情，同時不讓敦閔生氣", spins: 2 },
  { code: "quest3", title: "有準時在敦閔規定的時間睡覺", spins: 2 },
];

// 一次性任務（完成後永久不再出現）
const onceTasks = [
  { code: "quest4", title: "第一次登入完成", spins: 5 },
  { code: "quest5", title: "成功通關敦閔自製遊戲", spins: 20 },
];

// 獎項 + 權重
const prizeSegments = [
  { label: "銘謝惠顧", weight: 1.5 },
  { label: "10元代金卷", weight: 1.3 },
  { label: "指定晚餐", weight: 0.2 },
  { label: "按摩 1 分", weight: 1 },
  { label: "免費電影券", weight: 0.2 },
  { label: "100元代金卷", weight: 0.5 },
  { label: "盲盒自選1個", weight: 0.3 },
  { label: "超級無敵霹靂神秘大獎", weight: 0.1 },
];

const todayKey = () => new Date().toISOString().slice(0, 10);

// 獎項對應效果 + 音效 + 訊息
type PrizeConfig = {
  effect: EffectName;
  sound?: string;
  message?: string;
};

const prizeConfig: Record<string, PrizeConfig> = {
  "銘謝惠顧": {
    effect: "romance",
    sound: "/sounds/romance.mp3",
    message: "居居居居然是 銘  謝  惠  顧!!!! 太猛了吧 給你一個讚",
  },
  "10元代金卷": {
    effect: "romance",
    sound: "/sounds/romance.mp3",
    message: "顧名思義就是十元喔 揪咪",
  },
  "指定晚餐": {
    effect: "streamer",
    sound: "/sounds/streamer.mp3",
    message: "可以指定一個1000元以下的晚餐一份!",
  },
  "按摩 1 分": {
    effect: "streamer",
    sound: "/sounds/streamer.mp3",
    message: "按摩大師敦閔親自幫妳按摩按得服服貼貼那種<3",
  },
  "免費電影券": {
    effect: "fireworks",
    sound: "/sounds/fireworks.mp3",
    message: "選擇吧 去挑選妳最愛的電影 出門玩玩瞜",
  },
  "100元代金卷": {
    effect: "celebrate",
    sound: "/sounds/celebrate.mp3",
    message: "就是一張紅紅的小朋友喔:)",
  },
  "盲盒自選1個": {
    effect: "celebrate",
    sound: "/sounds/celebrate.mp3",
    message: "妳喜歡的盲盒挑一個 敦閔爸爸送給你啦",
  },
  "超級無敵霹靂神秘大獎": {
    effect: "gold",
    sound: "/sounds/gold.mp3",
    message: "恭喜妳獲得了最終大獎 請找敦閔輸入作弊碼:(jp6ru/4g/ b4dj94xk4)即可領取大獎",
  },
};
// ===================================================

export default function SpinPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  // ✅ 使用 sessionStorage 做登入保護（關掉瀏覽器就會登出）
  useEffect(() => {
    // 清掉舊邏輯殘留
    localStorage.removeItem("isLogin");

    const isLogin = sessionStorage.getItem("isLogin");
    if (isLogin !== "1") {
      router.replace("/sign-in");
    } else {
      setReady(true);
    }
  }, [router]);

  // 次數
  const [spinsLeft, setSpinsLeft] = useState(0);

  // 任務領取 / 完成狀態
  const [claimedDaily, setClaimedDaily] = useState<Record<string, boolean>>({});
  const [claimedOnce, setClaimedOnce] = useState<Record<string, boolean>>({});
  const [completedDaily, setCompletedDaily] = useState<Record<string, boolean>>({});
  const [completedOnce, setCompletedOnce] = useState<Record<string, boolean>>({});

  // 當日
  const day = useMemo(() => todayKey(), []);

  // key 生成器
  const completedKeyDaily = (code: string, day: string) =>
    `wheel:dailyCompleted:${code}:${day}`;
  const completedKeyOnce = (code: string) => `wheel:onceCompleted:${code}`;

  // 初始化
  useEffect(() => {
    const storedDay = localStorage.getItem("wheel:day");
    if (storedDay !== day) {
      localStorage.setItem("wheel:day", day);
      localStorage.setItem("wheel:spinsLeft", String(BASE_DAILY_SPINS));
      dailyTasks.forEach((t) => {
        localStorage.removeItem(`wheel:taskDaily:${t.code}:${day}`);
        localStorage.removeItem(completedKeyDaily(t.code, day));
      });
    }

    setSpinsLeft(Number(localStorage.getItem("wheel:spinsLeft") || BASE_DAILY_SPINS));

    // 已領狀態
    const d: Record<string, boolean> = {};
    dailyTasks.forEach((t) => {
      d[t.code] = !!localStorage.getItem(`wheel:taskDaily:${t.code}:${day}`);
    });
    setClaimedDaily(d);

    const o: Record<string, boolean> = {};
    onceTasks.forEach((t) => {
      o[t.code] = !!localStorage.getItem(`wheel:taskOnce:${t.code}`);
    });
    setClaimedOnce(o);

    // 完成狀態
    const cd: Record<string, boolean> = {};
    dailyTasks.forEach((t) => {
      cd[t.code] = !!localStorage.getItem(completedKeyDaily(t.code, day));
    });
    setCompletedDaily(cd);

    const co: Record<string, boolean> = {};
    onceTasks.forEach((t) => {
      co[t.code] = !!localStorage.getItem(completedKeyOnce(t.code));
    });
    setCompletedOnce(co);

    // 提供全域方法方便你測試
    (window as any).__completeDaily = (code: string) => {
      localStorage.setItem(completedKeyDaily(code, day), "1");
      setCompletedDaily((prev) => ({ ...prev, [code]: true }));
      console.log(`[OK] 已標記每日任務完成：${code}`);
    };
    (window as any).__completeOnce = (code: string) => {
      localStorage.setItem(completedKeyOnce(code), "1");
      setCompletedOnce((prev) => ({ ...prev, [code]: true }));
      console.log(`[OK] 已標記一次性任務完成：${code}`);
    };

    // Console 縮寫
    (window as any).cd = (code: string) => (window as any).__completeDaily?.(code);
    (window as any).co = (code: string) => (window as any).__completeOnce?.(code);
  }, [day]);

  // 要求轉盤開始轉
  const onRequestSpin = () => {
    if (spinsLeft <= 0) return false;
    const n = spinsLeft - 1;
    setSpinsLeft(n);
    localStorage.setItem("wheel:spinsLeft", String(n));
    return true;
  };

  // 領取每日任務（要完成才可領）
  const claimDaily = (code: string, add: number) => {
    if (claimedDaily[code] || !completedDaily[code]) return;
    const newCount = spinsLeft + add;
    setSpinsLeft(newCount);
    localStorage.setItem("wheel:spinsLeft", String(newCount));
    localStorage.setItem(`wheel:taskDaily:${code}:${day}`, "1");
    setClaimedDaily((prev) => ({ ...prev, [code]: true }));
  };

  // 領取一次性任務（要完成才可領）
  const claimOnce = (code: string, add: number) => {
    if (claimedOnce[code] || !completedOnce[code]) return;
    const newCount = spinsLeft + add;
    setSpinsLeft(newCount);
    localStorage.setItem("wheel:spinsLeft", String(newCount));
    localStorage.setItem(`wheel:taskOnce:${code}`, "1");
    setClaimedOnce((prev) => ({ ...prev, [code]: true }));
  };

  // 播放音效
  const playSound = (url?: string) => {
    if (!url) return;
    const audio = new Audio(url);
    audio.volume = 1;
    audio.play().catch(() => {});
  };

  if (!ready) return null;

  return (
    <main className="p-6 max-w-2xl mx-auto space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold">好運大轉盤</h1>
        <div className="text-sm">
          剩餘次數：<span className="font-bold">{spinsLeft}</span>
        </div>
      </header>

      <SpinWheel
        segments={prizeSegments}
        disabled={spinsLeft <= 0}
        onRequestSpin={onRequestSpin}
        onFinish={(prize) => {
          const cfg = prizeConfig[prize] ?? { effect: "celebrate" as EffectName };
          playConfetti(cfg.effect);
          playSound(cfg.sound);
          if (cfg.message) alert(cfg.message);
        }}
      />

      {/* 每日任務 */}
      <section className="space-y-3">
        <h2 className="font-semibold">每日任務（午夜重置）</h2>
        <ul className="space-y-2">
          {dailyTasks.map((t) => (
            <li key={t.code} className="flex items-center justify-between border rounded p-2">
              <div>
                <div className="font-medium">{t.title}</div>
                <div className="text-xs text-gray-500">+{t.spins} 次（今日）</div>
              </div>
              <button
                className="px-3 py-1 rounded border"
                disabled={claimedDaily[t.code] || !completedDaily[t.code]}
                onClick={() => claimDaily(t.code, t.spins)}
              >
                {claimedDaily[t.code] ? "今日已領" : !completedDaily[t.code] ? "未完成" : "領取"}
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* 一次性任務 */}
      <section className="space-y-3">
        <h2 className="font-semibold">一次性任務（僅能完成一次）</h2>
        <ul className="space-y-2">
          {onceTasks.map((t) => (
            <li key={t.code} className="flex items-center justify-between border rounded p-2">
              <div>
                <div className="font-medium">{t.title}</div>
                <div className="text-xs text-gray-500">+{t.spins} 次（永久）</div>
              </div>
              <button
                className="px-3 py-1 rounded border"
                disabled={claimedOnce[t.code] || !completedOnce[t.code]}
                onClick={() => claimOnce(t.code, t.spins)}
              >
                {claimedOnce[t.code] ? "已完成" : !completedOnce[t.code] ? "未完成" : "領取"}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <button
        className="px-3 py-2 rounded border"
        onClick={() => {
          // ✅ 登出改用 sessionStorage
          sessionStorage.removeItem("isLogin");
          router.push("/sign-in");
        }}
      >
        登出
      </button>
    </main>
  );
}
