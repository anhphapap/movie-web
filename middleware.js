import { NextResponse } from "next/server";

export const config = {
  matcher: ["/trang-chu"], // Áp dụng middleware cho trang /trang-chu
};

export default async function middleware(req) {
  const url = new URL(req.url);
  const userAgent = req.headers.get("user-agent") || "";

  // Danh sách bot mà ta muốn prerender
  const bots = [
    "googlebot",
    "bingbot",
    "yandex",
    "duckduckbot",
    "baiduspider",
    "facebookexternalhit",
    "twitterbot",
    "linkedinbot",
  ];

  const isBot = bots.some((bot) => userAgent.toLowerCase().includes(bot));

  // Nếu là bot → gửi request qua prerender.io
  if (isBot) {
    const prerenderUrl = `https://service.prerender.io/${url.href}`;
    return fetch(prerenderUrl, {
      headers: {
        "X-Prerender-Token": process.env.PRERENDER_TOKEN,
      },
    });
  }

  // Nếu không phải bot → xử lý bình thường (client-side)
  return NextResponse.next();
}
