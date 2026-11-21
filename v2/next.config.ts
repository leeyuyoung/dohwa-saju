import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 바깥 폴더(1번째 버전)에도 package-lock.json이 있어서, 이 폴더를 프로젝트 기준으로 못 박아 둔다.
  outputFileTracingRoot: path.join(__dirname),
  turbopack: { root: path.join(__dirname) },
  async redirects() {
    return [
      { source: "/2027", destination: "/FateNavi3", permanent: true },
      { source: "/2027/:path*", destination: "/FateNavi3/:path*", permanent: true },
      { source: "/api/2027/:path*", destination: "/api/FateNavi/:path*", permanent: true },
      { source: "/FateNavi", destination: "/FateNavi3", permanent: true },
      { source: "/FateNavi/start", destination: "/FateNavi3/start", permanent: true },
      { source: "/FateNavi/concern", destination: "/FateNavi3/concern", permanent: true },
      { source: "/FateNavi/analyzing", destination: "/FateNavi3/analyzing", permanent: true },
      { source: "/FateNavi/result/sample", destination: "/FateNavi3/result/sample", permanent: true },
      { source: "/FateNavi/result/:token", destination: "/FateNavi3/result/:token", permanent: true },
    ];
  },
};

export default nextConfig;
