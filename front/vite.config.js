import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'path';
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: './',
	root: './src',
	publicDir: resolve(__dirname, 'src/public'),
	assetsDir: 'assets',
	build: {
		outDir: resolve(__dirname, 'dist'),
		minify: false,//文字化け回避策として圧縮はプラグインでcssとjs別々に行う
		emptyOutDir: true,//ビルド時はまずdistファイルを空にしてから行う
		rollupOptions: {
			output: {
				//assetファイルはjs/image/css/fontに分類して指定した名前で保存
				entryFileNames: `assets/main.js`,
				assetFileNames: (assetFile) => {
					if (/\.css$/.test(assetFile.name)) {
						return 'assets/css/[name].[ext]';
					} else if (/\.( gif|jpeg|jpg|png|svg|webp| )$/.test(assetFile.name)) {
						return 'assets/image/[name].[ext]';
						} else if(/\.( ttf|otf|eot|woff|woff2| )$/.test(assetFile.name)) {
          return 'assets/fonts/[name].[ext]';
					} else {
						return 'assets/[name].[ext]';
					}
				}
			},
			input: {
				index: resolve(__dirname, './src/index.html')
			}
		}
	},
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
	},
	css: {
		preprocessorOptions: {
			scss: {
				api: 'modern-compiler'
			},
		},
	},
	server: {
    proxy: {
      "/api": {
        target: "http://localhost:80/",
        changeOrigin: true,
			},
    },
  },
})

