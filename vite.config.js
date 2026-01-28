/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));



export default defineConfig(({ command}) => {
  const isDev = !process.env.PROD && command ==='serve';

  console.log(' DevMode: ', isDev)

  const config = {
    // 1. Critical for your zip-and-run requirement. 
    // Ensures <script src="./assets/..."> instead of /assets/...
    base: './',
    plugins: [react(), nodePolyfills({
      include: ['events', 'fs', 'crypto','stream','os','timers'], // This is optional, default includes all
      globals: {
        Buffer: true,
        // Needed for many crypto operations
        global: true,
        process: true
      },
      protocolImports: true // Handles 'node:fs' imports        
    }),
    // This will provide the 'events' module to the browser
    ],
    resolve: {
      alias: {
        // 3. Replaces your old "browser": { "fs": false } logic
        // This mocks 'fs' so libraries like 'incyclist-devices' don't crash
        //'fs': path.resolve(__dirname, 'src/mocks/empty.js'),
        '@': path.resolve(__dirname, './src'),
          // 4. Ensure the alias points to the EXACT entry file
      }
    },
    define: {
      // Defines __dirname as the current directory URL in the browser
      '__dirname': JSON.stringify(process.cwd())
      // You might also need this for process.env.NODE_ENV if it causes errors
      //'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    },
    build: {
      // 4. Folder to be zipped for your clients
      outDir: 'build',
      emptyOutDir: true,
      // Ensures the build is compatible with the filesystem (file:// protocol)
      assetsInlineLimit: 4096
    },
    server: {
      port: 3000,
      open: true
    },
    test: {
      projects: [{
        extends: true,
        plugins: [
        // The plugin will run tests for the stories defined in your Storybook config
        // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
        storybookTest({
          configDir: path.join(dirname, '.storybook')
        })],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{
              browser: 'chromium'
            }]
          },
          setupFiles: ['.storybook/vitest.setup.js']
        }
      }]
    }
  }

  if (isDev) {
    const prev = config.resolve.alias??{}

    config.resolve.alias =  { ...prev ,
        'incyclist-services': path.resolve(__dirname, '../services/lib/index.js'),
        'incyclist-devices': path.resolve(__dirname, '../devices/lib/esm/index.js')
    }

    config.optimizeDeps = {
      exclude: [
        'incyclist-services',
        'incyclist-devices'  
    ] 
    }
    config.ssr= {
      exclude: [
        'incyclist-services' ,
        'incyclist-devices' 
        ] 
    }
  }
    else {

        const prevOptimizeDeps= config.optimizeDeps??{}
        config.optimizeDeps =  {
            ...prevOptimizeDeps,
            exclude: ['incyclist-devices']
        }        
    }

    console.log (JSON.stringify(config,null,2))
  return config

})


