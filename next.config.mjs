/** @type {import('next').NextConfig} */
const basePath = process.env.BASE_PATH || '/DEMO-CochiLoco'

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath,
  assetPrefix: basePath,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
