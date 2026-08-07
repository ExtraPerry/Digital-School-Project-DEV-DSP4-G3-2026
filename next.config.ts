import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

/**
 * Listing photography is served from the public `boat-images` Storage bucket,
 * so next/image has to be allowed to optimize that origin. Everything below is
 * derived from NEXT_PUBLIC_SUPABASE_URL rather than hardcoded: one config then
 * covers the local stack (http://127.0.0.1:54321) and a hosted project
 * (https://<ref>.supabase.co) with no per-environment branch.
 */
function supabaseUrl() {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!value) {
    // Fail loudly here rather than shipping a build whose every listing photo
    // 400s at runtime.
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is required to build the image configuration. " +
        "Copy .env.example to .env and fill it in.",
    );
  }

  return new URL(value);
}

/**
 * Next 16 refuses to fetch an upstream image that resolves to a loopback or
 * private address — an SSRF guard that is correct in production and exactly
 * wrong against the local Supabase container, which lives on 127.0.0.1.
 *
 * The guard is therefore lifted only when the configured Supabase project is
 * itself a local address. Point the app at a hosted project and it comes back
 * on automatically, so this can never silently ship to production.
 */
function isLocalHost(hostname: string) {
  return (
    hostname === "localhost" ||
    hostname === "::1" ||
    /^127\./.test(hostname) ||
    /^10\./.test(hostname) ||
    /^192\.168\./.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(hostname)
  );
}

const { protocol, hostname, port } = supabaseUrl();

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: protocol.replace(":", "") as "http" | "https",
        hostname,
        port,
        // Narrowed to the public object route: signed and authenticated Storage
        // URLs must never be proxied through the image optimizer.
        pathname: "/storage/v1/object/public/**",
      },
    ],
    dangerouslyAllowLocalIP: isLocalHost(hostname),
  },
};
const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
