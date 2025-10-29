# 🎯 칸반 프로젝트 관리 도구

React 기반의
드래그 앤 드롭 기능을 지원하는 칸반 보드 프로젝트 관리 도구입니다.

### 주요 기능

- ✅ 사용자 인증 (이메일, Google, GitHub, Kakao)
- ✅ 보드 생성 및 관리
- ✅ 칸반 컬럼 관리
- ✅ 작업 카드 드래그 앤 드롭
- ✅ 실시간 협업 (예정)

## 🛠 기술 스택

### Frontend

- **React 18** - UI 라이브러리
- **TypeScript** - 타입 안전성
- **Axios** - HTTP 클라이언트
- **Tailwind CSS** - 스타일링
- **React Beautiful DnD** - 드래그 앤 드롭 (예정)

### Backend

- **Java (Spring Boot)** - 사용자 관리 서비스
- **Python (FastAPI)** - 보드 관리 서비스

### Infrastructure

- **AWS EC2** - 백엔드 서버 호스팅

## 🏗 아키텍처

### 마이크로서비스 구조

```
┌─────────────────┐
│  React Frontend │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌──────────┐
│  Java  │ │  Python  │
│  API   │ │   API    │
│ :8080  │ │  :8000   │
└────────┘ └──────────┘
    │           │
    │           │
 [User DB]  [Board DB]
```

### 서비스 분리

**Java 서비스 (User Service)**

- 사용자 인증 및 관리
- JWT 토큰 발급/검증
- 사용자 프로필 관리

**Python 서비스 (Board Service)**

- 보드 CRUD
- 칸반 컬럼 관리
- 작업 카드 관리
- 드래그 앤 드롭 로직

## 📁 프로젝트 구조

```
kanban-project/
├── src/
│   ├── types/
│   │   └── index.ts              # TypeScript 타입 정의
│   ├── services/
│   │   ├── api.ts                # Axios 인스턴스 설정
│   │   ├── userService.ts        # Java API 호출
│   │   └── boardService.ts       # Python API 호출
│   ├── pages/
│   │   ├── Login.tsx             # 로그인 페이지
│   │   └── Dashboard.tsx         # 메인 대시보드
│   ├── components/
│   │   ├── Header.tsx            # 헤더 컴포넌트
│   │   ├── Column.tsx            # 칸반 컬럼
│   │   └── TaskCard.tsx          # 작업 카드
│   └── App.tsx
├── .env                          # 개발 환경 변수
├── .env.production              # 프로덕션 환경 변수
├── .env.example                 # 환경 변수 템플릿
├── package.json
└── README.md
```

## 🚀 시작하기

### 필수 요구사항

- Node.js 18.x 이상
- npm 또는 yarn
- Java 백엔드 서버 (Port 8080)
- Python 백엔드 서버 (Port 8000)

### 설치 및 실행

0. (\*)백엔드 서비스를 먼저 띄워주세요!

1. **저장소 클론**

```bash
git clone https://github.com/your-username/kanban-project.git
cd kanban-project
```

2. **의존성 설치**

```bash
npm install
```

3. **개발 서버 실행**

```bash
npm start
```

브라우저에서 `http://localhost:3000` 접속
