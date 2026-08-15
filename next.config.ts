import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: isGithubPages ? "/FleetClose" : "",
  assetPrefix: isGithubPages ? "/FleetClose" : undefined,
};

export default nextConfig;
