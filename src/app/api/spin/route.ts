// src/app/api/spin/route.ts
import { createServerSupabase } from "../../lib/supabaseServer";


export async function POST() {
  const supabase = createServerSupabase();

  // 必須已登入
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "not authenticated" }, { status: 401 });

  // 用使用者身分呼叫 RPC（RLS 生效，auth.uid() 有值）
  const { data, error } = await supabase.rpc("spin_once");
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json(data);
}
