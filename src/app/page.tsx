'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

// 與 SpinPage 同步的設定
const dailyTasks = [
  { code: 'quest1', title: '完美的照片一張' },
  { code: 'quest2', title: '保持愉悅的心情，同時不讓敦閔生氣' },
  { code: 'quest3', title: '有準時在敦閔規定的時間睡覺' },
];
const onceTasks = [
  { code: 'quest4', title: '第一次登入完成' },
  { code: 'quest5', title: '成功通關敦閔自製遊戲' },
];
const todayKey = () => new Date().toISOString().slice(0, 10);

export default function Home() {
  const [isLogin, setIsLogin] = useState(false);
  const [spinsLeft, setSpinsLeft] = useState<number | null>(null);
  const [dailyStatus, setDailyStatus] = useState<Record<string, string>>({});
  const [onceStatus, setOnceStatus] = useState<Record<string, string>>({});

  useEffect(() => {
    const login = localStorage.getItem('isLogin') === '1';
    setIsLogin(login);

    const storedSpins = localStorage.getItem('wheel:spinsLeft');
    setSpinsLeft(storedSpins ? Number(storedSpins) : null);

    const day = todayKey();

    // 每日任務狀態
    const daily: Record<string, string> = {};
    dailyTasks.forEach((t) => {
      const completed = !!localStorage.getItem(`wheel:dailyCompleted:${t.code}:${day}`);
      const claimed = !!localStorage.getItem(`wheel:taskDaily:${t.code}:${day}`);
      daily[t.code] = claimed ? '已領取' : completed ? '可領取' : '未完成';
    });
    setDailyStatus(daily);

    // 一次性任務狀態
    const once: Record<string, string> = {};
    onceTasks.forEach((t) => {
      const completed = !!localStorage.getItem(`wheel:onceCompleted:${t.code}`);
      const claimed = !!localStorage.getItem(`wheel:taskOnce:${t.code}`);
      once[t.code] = claimed ? '已完成' : completed ? '可領取' : '未完成';
    });
    setOnceStatus(once);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-amber-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(40rem_28rem_at_20%_-10%,rgba(255,192,203,.25),transparent),radial-gradient(30rem_20rem_at_110%_0%,rgba(255,235,205,.25),transparent)]" />

      <main className="relative mx-auto max-w-3xl px-6 py-12">
        {/* 標題區 */}
        <div className="mb-10 rounded-3xl border border-white/60 bg-white/70 shadow-xl backdrop-blur-md p-8">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎂</span>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-800">
              陳玟靜生日快樂❤️
            </h1>
          </div>
          <p className="mt-3 text-gray-600">每一次的吵架，都使我們成長，也讓我們更堅信未來的道路。</p>
          <p className="mt-3 text-gray-600">在經歷了兩年的愛情裡面，我們都受了傷，也成長了。</p>
          <p className="mt-3 text-gray-600">希望在未來的每一天，我們都能夠越來越好。</p>
          <p className="mt-3 text-gray-600">請不要放棄努力，為了我們的未來持續前進。</p>
          <p className="mt-3 text-gray-600">生日快樂 也 畢業快樂 愛妳的敦閔。</p>

          {/* ✅ 登入前後的按鈕切換 */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {isLogin ? (
              <>
                <Link
                  href="/spin"
                  className="inline-flex items-center justify-center rounded-xl bg-black px-5 py-3 text-white shadow-md transition hover:shadow-lg active:scale-[0.99]"
                >
                  🎉 開始轉盤
                </Link>
                <span className="inline-flex items-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-emerald-700">
                  已登入
                </span>
              </>
            ) : (
              <Link
                href="/sign-in"
                className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-5 py-3 text-gray-800 shadow-sm transition hover:bg-gray-50"
              >
                🎉 開始轉盤
              </Link>
            )}
          </div>
        </div>

        {/* 狀態卡片 */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* 剩餘次數 */}
          <div className="rounded-2xl border border-white/60 bg-white/70 p-5 backdrop-blur-md shadow-lg">
            <div className="mb-2 text-sm font-medium text-gray-500">剩餘抽數</div>
            <div className="text-4xl font-extrabold text-gray-800">{spinsLeft ?? '—'}</div>
            <p className="mt-2 text-sm text-gray-500">
              {spinsLeft === null
                ? '登入後可同步顯示'
                : spinsLeft > 0
                ? '快去試試今天的好手氣！'
                : '抽數用完啦～完成任務可獲得抽數'}
            </p>
          </div>

          {/* 今日任務 + 影片 + 浮動文字 */}
          <div className="relative rounded-2xl border border-pink-200 bg-white/80 p-5 backdrop-blur-md shadow-lg overflow-hidden">
            {/* Happy Birthday 浮動文字 */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 animate-bounce text-lg font-bold text-pink-500 drop-shadow">
              🎉 Happy Birthday 🎉
            </div>

            {/* 生日小短片（請把檔案放 public/videos/birthday-clip.mp4） */}
            <div className="mb-4 mt-6">
              <video
                src="/videos/birthday-clip.mp4"
                className="w-full rounded-xl border-4 border-pink-200 shadow-md"
                autoPlay
                muted
                loop
                playsInline
              />
            </div>

            <div className="mb-2 text-sm font-medium text-gray-500">今日任務</div>
            <ul className="space-y-2 text-gray-700 text-sm">
              {dailyTasks.map((t) => (
                <li key={t.code} className="flex items-center justify-between">
                  <span>{t.title}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      dailyStatus[t.code] === '已領取'
                        ? 'bg-emerald-100 text-emerald-700'
                        : dailyStatus[t.code] === '可領取'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {dailyStatus[t.code] ?? '—'}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* 一次性任務 */}
          <div className="rounded-2xl border border-white/60 bg-white/70 p-5 backdrop-blur-md shadow-lg">
            <div className="mb-2 text-sm font-medium text-gray-500">一次性任務</div>
            <ul className="space-y-2 text-gray-700 text-sm">
              {onceTasks.map((t) => (
                <li key={t.code} className="flex items-center justify-between">
                  <span>{t.title}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      onceStatus[t.code] === '已完成'
                        ? 'bg-emerald-100 text-emerald-700'
                        : onceStatus[t.code] === '可領取'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {onceStatus[t.code] ?? '—'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 底部小語 */}
        <div className="mt-10 text-center text-sm text-gray-500">
          Made with 💛 for you — 祝妳天天快樂
        </div>
      </main>
    </div>
  );
}
