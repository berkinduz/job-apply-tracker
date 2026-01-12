import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next");
  const redirectToParam = searchParams.get("redirect_to");
  let next = "/applications";

  if (nextParam && nextParam !== "/") {
    next = nextParam;
  } else if (redirectToParam) {
    try {
      const redirectUrl = new URL(redirectToParam);
      if (redirectUrl.origin === origin) {
        const candidate = `${redirectUrl.pathname}${redirectUrl.search}`;
        if (candidate && candidate != "/") {
          next = candidate;
        }
      }
    } catch {
      if (redirectToParam.startsWith("/") && redirectToParam !== "/") {
        next = redirectToParam;
      }
    }
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);

    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
