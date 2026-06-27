import type { NextConfig } from "next";

// Runtime warning if BLOB_READ_WRITE_TOKEN is missing (don't throw at build time)
if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.warn('[next.config] Warning: BLOB_READ_WRITE_TOKEN is not set. Cloud sync will be disabled.');
  }
}

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
