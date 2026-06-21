/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Needed for Telegram Mini App
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: "frame-ancestors https://*.telegram.org https://telegram.org;" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;