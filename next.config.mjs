/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Rimuoviamo la configurazione webpack per gli alias,
  // poiché ora @/ punterà direttamente alla radice del progetto
  // e Next.js gestisce gli import dalla radice per impostazione predefinita.
}

export default nextConfig
