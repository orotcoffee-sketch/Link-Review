import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// OAuth(Kakao) / 이메일 인증 / 비밀번호 재설정 링크의 공통 callback.
// 실패하면 raw 오류 페이지 대신 로그인 화면으로 되돌리고 오류 메시지를 전달한다.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  // open redirect 방지: 같은 사이트의 절대 경로만 허용
  const dest = next && next.startsWith("/") && !next.startsWith("//") ? next : "/home";

  const fail = (message: string) =>
    NextResponse.redirect(
      `${origin}/?view=login&error=${encodeURIComponent(message.slice(0, 200))}`,
    );

  const providerError =
    searchParams.get("error_description") ?? searchParams.get("error");
  if (providerError) return fail(providerError);
  if (!code) return fail("Sign-in failed. Please try again.");

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return fail(error.message);
  return NextResponse.redirect(`${origin}${dest}`);
}
