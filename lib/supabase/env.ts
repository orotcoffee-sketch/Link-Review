// 실제 Supabase 프로젝트 값만 사용한다. 없으면 fallback 없이 즉시 에러를 던진다.
// NEXT_PUBLIC_* 는 정적 참조여야 번들에 인라인되므로 동적 접근(process.env[name])을 쓰지 않는다.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export function getSupabaseEnv() {
  if (!url || !publishableKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Set them in .env.local.",
    );
  }
  return { url, publishableKey };
}
