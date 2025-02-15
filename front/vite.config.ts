import { defineConfig } from 'vite'
import { resolve } from 'path'
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'

// https://vite.dev/config/
export default defineConfig({
    base: './',
    root: './src',
    publicDir: resolve(__dirname, 'src/public'),

    build: {
        outDir: resolve(__dirname, 'dist'),
        cssMinify: false, //文字化け回避策として圧縮はプラグインでcssとjs別々に行う
        emptyOutDir: true, //ビルド時はまずdistファイルを空にしてから行う
        rollupOptions: {
            output: {
                //assetファイルはimage/cssフォルダに分類して指定した名前で保存
                entryFileNames: `assets/main.js`,
                assetFileNames: (assetFile) => {
                    if (/\.css$/.test(assetFile.names[0]!)) {
                        return 'assets/css/[name].[ext]'
                    } else if (/\.( gif|jpeg|jpg|png|svg|webp| )$/.test(assetFile.names[0]!)) {
                        return 'assets/image/[name].[ext]'
                    } else {
                        return 'assets/[name].[ext]'
                    }
                }
            },
            input: {
                index: resolve(__dirname, './src/index.html')
            }
        }
    },
    plugins: [vue()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    css: {
        postcss: {
            plugins: [
                autoprefixer,
                cssnano({
                    preset: [
                        'default',
                        {
                            minifyFontValues: {
                                removeQuotes: false
                            }
                        }
                    ]
                })
            ]
        }
    },
    server: {
        port: 8099,
        proxy: {
            '/api': {
                target: 'http://localhost:80/',
                changeOrigin: true
            },
            '/sanctum/csrf-cookie': {
                target: 'http://localhost:80/',
                changeOrigin: true
            }
        }
    }
})
