import { defineNuxtConfig } from 'nuxt'

// https://v3.nuxtjs.org/docs/directory-structure/nuxt.config
export default defineNuxtConfig({
  experimental: {
    reactivityTransform: true
  },
  typescript: {
    strict: true,
    tsConfig: {
      compilerOptions: {
        resolveJsonModule: true,
        jsx: 'preserve',
        noImplicitReturns: true,
        noUnusedLocals: true,
        noUnusedParameters: true
      }
    }
  },
  srcDir: './app',
  css: ['destyle.css', '@/assets/styles/base.scss'],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: [
            '@import "@/assets/styles/variables.scss";',
            '@import "@/assets/styles/breakpoints.scss";'
          ].join('\n')
        }
      }
    }
  },
  meta: {
    title: 'dyp',
    htmlAttrs: {
      lang: 'ja'
    },
    meta: [
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        name: 'format-detection',
        content: 'telephone=no, address=no, email=no'
      },
      { hid: 'description', name: 'description', content: '' }
    ]
  },
  buildModules: ['./app/buildModules/load-contents.ts'],
  runtimeConfig: {
    public: {
      gtmId: process.env.GTM_ID
    }
  }
})
