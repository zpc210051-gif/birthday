"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");

  // 👉 固定帳密
  const FIXED_ACCOUNT = "1"; // 陳玟靜專屬通道
  const FIXED_PASSWORD = "1"; // g/ b4dj94xk42841p4204

  const handleLogin = () => {
    if (account === FIXED_ACCOUNT && password === FIXED_PASSWORD) {
      // ✅ 登入成功 → 改用 sessionStorage（分頁/瀏覽器關掉就會清除）
      sessionStorage.setItem("isLogin", "1");
      // 保險：把舊的 localStorage 清掉
      localStorage.removeItem("isLogin");

      router.push("/spin");
    } else {
      alert("帳密打錯了啦，笨逼笑你  : )");
    }
  };

  return (
    <main className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">登入</h1>
      <input
        type="text"
        placeholder="輸入帳號"
        value={account}
        onChange={(e) => setAccount(e.target.value)}
        className="border rounded w-full p-2 mb-3"
      />
      <input
        type="password"
        placeholder="輸入密碼"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border rounded w-full p-2 mb-3"
      />
      <button
        onClick={handleLogin}
        className="px-4 py-2 rounded bg-black text-white w-full"
      >
        登入
      </button>
    </main>
  );
}
