import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer'; // 1. 플러그인 임포트

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // 2. Rollup Visualizer 플러그인 추가:
    // 빌드 후 번들 크기 분석 리포트를 자동으로 생성합니다.
    visualizer({
      open: true, // 빌드 완료 후 브라우저에서 리포트를 자동으로 엽니다.
      filename: 'dist/stats.html', // 리포트 파일 경로 및 이름
      title: 'Kanban App Bundle Analysis', // 리포트 제목
      gzipSize: true, // gzip 압축 후 사이즈도 함께 표시하여 실제 전송 크기 예측
    }),
  ],
  server: {
    port: 3000,
  },
  build: {
    // 정확한 분석을 위해 소스맵(Source Map)을 활성화합니다.
    sourcemap: true,
  },
});
