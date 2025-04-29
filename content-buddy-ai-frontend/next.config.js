/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
  images: {
    domains: [
      'api.dicebear.com',
      'www.google.com',
      'via.placeholder.com'
    ],
  },
}

module.exports = nextConfig 