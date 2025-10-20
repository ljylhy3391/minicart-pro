# 미니 커머스 (Minicart Pro)

전자상거래 플랫폼

## 기술 스택

- Next.js 15.5.4 + TypeScript + Tailwind CSS
- PostgreSQL + Prisma
- NextAuth.js (Google/Kakao OAuth)
- PortOne (아임포트) 결제
- Cloudflare R2 이미지 스토리지

## 환경 변수 설정

`.env.local` 파일을 생성하고 다음 환경 변수들을 설정하세요:

```env
# Database
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
KAKAO_CLIENT_ID="your-kakao-client-id"
KAKAO_CLIENT_SECRET="your-kakao-client-secret"

# Portone (아임포트)
PORTONE_STORE_ID="your-portone-store-id"
PORTONE_API_KEY="your-portone-api-key"
PORTONE_SECRET_KEY="your-portone-secret-key"

# Cloudflare R2
R2_ACCOUNT_ID="your-r2-account-id"
R2_ACCESS_KEY_ID="your-r2-access-key-id"
R2_SECRET_ACCESS_KEY="your-r2-secret-access-key"
R2_BUCKET_NAME="your-r2-bucket-name"
R2_PUBLIC_URL="https://your-r2-bucket-name.your-account-id.r2.cloudflarestorage.com"
```

## Cloudflare R2 설정

1. Cloudflare 대시보드에서 R2 스토리지 생성
2. 버킷 생성 및 퍼블릭 액세스 설정
3. API 토큰 생성 (R2:Edit 권한)
4. 환경 변수에 설정값 입력

## 실행 방법

```bash
# 의존성 설치
npm install

# 데이터베이스 마이그레이션
npm run db:push

# 개발 서버 실행
npm run dev
```

## 주요 기능

- ✅ 사용자 인증 (Google/Kakao OAuth)
- ✅ 상품 관리 및 이미지 업로드
- ✅ 장바구니 및 주문 시스템
- ✅ 아임포트 결제 연동
- ✅ 관리자 대시보드
- ✅ Cloudflare R2 이미지 스토리지
