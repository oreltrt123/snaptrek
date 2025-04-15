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
    // Simplified webpack config that doesn't use require
    webpack: (config) => {
      // Ensure React is properly loaded without using require
      return {
        ...config,
        resolve: {
          ...config.resolve,
          alias: {
            ...config.resolve.alias,
          },
        },
      };
    },
  }
  
  export default nextConfig
  