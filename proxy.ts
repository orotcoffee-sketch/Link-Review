import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSupabaseEnv } from "@/lib/supabase/env";

// session 이 없으면 보호 route 직접 접근을 / 로 돌려보낸다.
export async function proxy(request: NextRequest) {
  const { url, publishableKey } = getSupabaseEnv();
  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return response;
}

export const config = {
  // "/" (Entry) 와 /auth/*, _next, 정적 파일을 제외한 모든 route 는 session 이 필요하다.
  matcher: ["/((?!auth|_next|.*\\..*).+)"],
};
