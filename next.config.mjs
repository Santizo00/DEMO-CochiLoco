/** @type {import('next').NextConfig} */
const githubRepo = process.env.GITHUB_REPOSITORY?.split('/')[1] || ''
const isGithubActions = process.env.GITHUB_ACTIONS === 'true'
const defaultBasePath = isGithubActions
  ? githubRepo.endsWith('.github.io')
    ? ''
    : `/${githubRepo}`
  : ''

const basePath = process.env.BASE_PATH ?? defaultBasePath
const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : 'yqlxcjxmpjupmsqelqyo.supabase.co'

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: supabaseHostname,
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default nextConfig
