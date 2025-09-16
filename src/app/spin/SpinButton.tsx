"use client";
import { useState } from "react";

export default function SpinButton() {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const doSpin = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/spin", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "spin failed");
      setResult(json.prize);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={doSpin} className="px-4 py-2 rounded bg-black text-white">
        {loading ? "轉動中…" : "開始抽"}
      </button>
      {result && <p className="mt-4">抽到：{result}</p>}
    </>
  );
}
