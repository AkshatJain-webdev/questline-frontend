import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The default bottom-left spot covers the theme controls in the sidebar.
  devIndicators: { position: "bottom-right" },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
