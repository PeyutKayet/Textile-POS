// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  app: {
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0' }
      ]
    }
  },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/supabase',
    '@vite-pwa/nuxt'
  ],
  css: ['~/assets/css/tailwind.css'],
  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/register', '/kasir/*'], // <--- Tambahin route kasir biar orang bisa buka lewat link
    }
  },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Textile POS',
      short_name: 'TextilePOS',
      theme_color: '#2563eb', // Warna biru dari tombol kamu
      background_color: '#ffffff',
      display: 'standalone',
      icons: [
        {
          src: 'pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable'
        }
      ]
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}']
    },
    devOptions: {
      enabled: true, // Biar PWA jalan saat npm run dev
      type: 'module'
    }
  }
})