import { varlockNextConfigPlugin } from "@varlock/nextjs-integration/plugin";
import type { NextConfig } from "next";

const withVarlock = varlockNextConfigPlugin();

const nextConfig: NextConfig = {
  experimental: { globalNotFound: true },
  reactCompiler: true,
  typedRoutes: true,
};

export default withVarlock(nextConfig);
