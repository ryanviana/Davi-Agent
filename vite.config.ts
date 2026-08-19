import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Proxy só do dev server. Faz duas coisas:
 *  1. mata o CORS da OpenAI, mantendo o app front-only;
 *  2. injeta a Authorization aqui, no processo do Vite — a chave nunca entra no bundle.
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const chave = env.VITE_OPENAI_API_KEY || env.OPENAI_API_KEY || ''
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/oai': {
          target: 'https://api.openai.com',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/oai/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (req) => {
              if (chave) req.setHeader('Authorization', `Bearer ${chave}`)
            })
          },
        },
      },
    },
  }
})
