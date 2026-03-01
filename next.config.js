/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Enable Turbopack with proper alias configuration
  turbopack: {
    resolveAlias: {
      'mapbox-gl': 'mapbox-gl',
    },
  },
};

module.exports = nextConfig;
