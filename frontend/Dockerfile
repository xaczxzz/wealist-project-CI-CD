# --- Stage 1: Build (빌드 환경) ---
# Node.js 20 버전 사용 (현재 React/Vite 환경에 적합)
FROM node:20-alpine AS builder

# 작업 디렉토리 설정
WORKDIR /app

# pnpm 설치 (pnpm을 사용하고 계시므로)
RUN npm install -g pnpm

# 의존성 파일 복사 및 설치
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# 소스 코드 복사
COPY . .

# 프로덕션 빌드 실행 (번들 파일 생성)
# VITE 환경 변수를 주입해야 할 경우, 이곳에서 --mode production 등을 사용합니다.
RUN pnpm run build

# --- Stage 2: Production Server (경량 런타임 환경) ---
# Nginx를 사용하여 정적 파일을 서빙하는 가장 가벼운 이미지 사용
FROM nginx:stable-alpine AS production

# 컨테이너 포트 노출 (프론트엔드는 보통 80번 포트를 사용)
EXPOSE 80

# Stage 1에서 생성된 빌드 결과물(dist 폴더 내용)을 Nginx의 기본 정적 파일 서빙 위치로 복사
# /app/dist가 Vite 빌드 결과 폴더입니다.
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx 설정을 커스터마이징할 필요가 없으므로 기본 설정을 사용하고, Nginx 실행
CMD ["nginx", "-g", "daemon off;"]