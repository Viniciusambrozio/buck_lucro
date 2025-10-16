import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configurações para resolver problemas de conexão
  serverExternalPackages: ['@supabase/ssr'],
  
  // Configurações para melhorar a hidratação
  reactStrictMode: true,
  
  // Headers de segurança e CORS
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },

  // Configurações de webpack para resolver problemas de módulos
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  },
};

export default nextConfig;
