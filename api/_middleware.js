export const config = {
  matcher: ["/((?!api).*)"], // áp dụng cho toàn site (trừ /api)
};

export default function middleware(req) {
  const userAgent = req.headers.get("user-agent") || "";
  const isBot =
    /(googlebot|bingbot|yandex|duckduckbot|baiduspider|facebookexternalhit|twitterbot|linkedinbot)/i.test(
      userAgent
    );

  if (isBot) {
    const prerenderUrl = `https://service.prerender.io/${req.nextUrl.origin}${
      req.nextUrl.pathname
    }${req.nextUrl.search || ""}`;
    return Response.redirect(prerenderUrl, 307, {
      headers: {
        "X-Prerender-Token": process.env.PRERENDER_TOKEN,
      },
    });
  }

  return NextResponse.next();
}
