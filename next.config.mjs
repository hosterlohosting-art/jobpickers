/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['remotive.com', 'remotive.io', 'arbeitnow.com', 'localhost'],
    unoptimized: true
  }
};

export default nextConfig;
