import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyRes", (proxyRes, req, res) => {
            // ✅ Forward Set-Cookie headers from Django to browser
            const cookies = proxyRes.headers["set-cookie"];
            if (cookies) {
              proxyRes.headers["set-cookie"] = cookies.map((cookie) =>
                cookie
                  .replace(/Domain=[^;]+;?/i, "")   // remove domain
                  .replace(/Secure;?/gi, "")          // remove Secure flag
                  .replace(/SameSite=None/gi, "SameSite=Lax") // fix samesite
              );
            }
          });
        },
      },
    },
  },
})