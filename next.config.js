/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    eslint: {
      // Warning: This allows production builds to successfully complete even if
      // your project has ESLint errors.
      ignoreDuringBuilds: true,
    },
    typescript: {
      // Warning: This allows production builds to successfully complete even if
      // your project has type errors.
      ignoreBuildErrors: true,
    },
    // Add this to ensure proper React loading
    webpack: (config) => {
      // We don't need to explicitly set React aliases as Next.js handles this
      return config
    },
  }
  
  module.exports = nextConfig
  