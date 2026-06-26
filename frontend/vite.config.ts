import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function customAssetResolver() {
  return {
    name: 'custom-asset-resolver',
    resolveId(id) {
      if (id.startsWith('custom:asset/')) {
        const filename = id.replace('custom:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  plugins: [
    customAssetResolver(),
    // The React and Tailwind plugins are both required, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  build: {
    rollupOptions: {
      output: {
        // Split big, stable vendors into their own cacheable chunks so a code
        // change doesn't bust them and they can download in parallel.
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('maplibre-gl')) return 'maplibre'
          if (/[\\/]recharts[\\/]|[\\/]d3-|[\\/]victory-/.test(id)) return 'charts'
          if (/[\\/](react|react-dom|react-router|scheduler)[\\/]/.test(id)) return 'react-vendor'
          if (id.includes('motion')) return 'motion'
        },
      },
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
