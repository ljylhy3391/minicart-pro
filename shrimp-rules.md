# 미니 커머스 프로젝트 개발 규칙

## 🚫 절대 금지 사항

### 환경 변수 파일 수정 금지

- **절대 금지**: `.env`, `.env.local`, `.env.production` 등 모든 환경 변수 파일 수정
- **허용**: 환경 변수 파일 읽기만 가능 (현재 설정 확인용)
- **규칙**: 환경 변수 관련 작업이 필요할 때는 사용자에게 먼저 물어보고 진행
- **예시 금지**: `DATABASE_URL`, `NEXT_PUBLIC_*`, `PORTONE_*` 등 모든 환경 변수 수정

## 📁 프로젝트 구조 규칙

### Next.js 15 App Router 구조

- **기본 구조**: `src/app/` 디렉토리 사용
- **페이지 생성**: `page.tsx` 파일로 페이지 생성
- **API Routes**: `route.ts` 파일로 API 엔드포인트 생성
- **레이아웃**: `layout.tsx` 파일로 레이아웃 관리
- **동적 라우팅**: `[id]/page.tsx` 형태 사용

### 디렉토리 구조

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── auth/              # 인증 페이지
│   ├── cart/              # 장바구니 페이지
│   ├── orders/            # 주문 페이지
│   ├── products/          # 상품 페이지
│   └── profile/           # 프로필 페이지
├── components/            # React 컴포넌트
├── lib/                   # 유틸리티 및 설정
└── types/                 # TypeScript 타입 정의
```

## 🗄️ 데이터베이스 규칙

### Prisma 스키마 관리

- **스키마 파일**: `prisma/schema.prisma`만 수정 가능
- **스키마 변경 시**: 반드시 `npx prisma generate` 실행
- **마이그레이션**: `npx prisma db push` 또는 `npx prisma migrate dev` 사용
- **데이터베이스 URL**: 환경 변수에서 자동 읽기

### 테이블 규칙

- **총 18개 테이블**: users, accounts, sessions, verification_tokens, categories, products, product_images, product_variants, inventory, cart, cart_items, orders, order_items, payments, coupons, coupon_usage, reviews, refunds
- **UUID 사용**: 모든 ID는 `@db.Uuid` 타입 사용
- **타임스탬프**: `createdAt`, `updatedAt` 필드 필수 포함
- **관계 설정**: 적절한 `@relation` 및 `onDelete` 설정

### RLS (Row Level Security) 규칙

- **Supabase RLS**: 모든 테이블에 RLS 정책 적용 필요
- **정책 파일**: `scripts/fix-rls-policies.sql` 참조
- **서비스 역할**: Prisma 클라이언트용 서비스 역할 권한 필요
- **사용자 접근**: 사용자는 자신의 데이터만 접근 가능

## 🔐 인증 시스템 규칙

### NextAuth.js v5 사용

- **설정 파일**: `src/lib/auth.ts`
- **OAuth 제공자**: Google, Kakao 지원
- **JWT 전략**: 데이터베이스 연결 없이 동작
- **세션 관리**: `src/components/providers/session-provider.tsx`

### 사용자 역할

- **기본 역할**: `CUSTOMER`
- **관리자 역할**: `ADMIN`, `SELLER`
- **역할 확인**: API에서 `session.user.role` 확인

## 💳 결제 시스템 규칙

### 아임포트 (PortOne) 사용

- **설정 파일**: `src/lib/portone.ts`
- **브라우저 SDK**: `@portone/browser-sdk/v2` 사용
- **결제 모달**: `src/components/payment/payment-modal.tsx`
- **결제 버튼**: `src/components/payment/payment-button.tsx`
- **환불 시스템**: `src/components/payment/refund-button.tsx`

### 결제 API 규칙

- **결제 요청**: `POST /api/payments`
- **결제 확인**: `POST /api/payments/confirm`
- **환불 처리**: `POST /api/payments/refund`
- **웹훅 처리**: `POST /api/payments/webhook`

## 🎨 UI/UX 규칙

### Tailwind CSS 사용

- **스타일링**: Tailwind CSS 클래스 사용
- **컴포넌트**: Radix UI 기반 커스텀 컴포넌트
- **반응형**: 모바일 우선 반응형 디자인
- **다크 모드**: 다크 모드 지원

### 컴포넌트 구조

- **UI 컴포넌트**: `src/components/ui/` 디렉토리
- **기능 컴포넌트**: `src/components/` 하위 디렉토리별 분류
- **재사용성**: 가능한 한 재사용 가능한 컴포넌트 작성

## 🔧 개발 도구 규칙

### 코드 품질

- **린터**: ESLint 설정 준수
- **포맷터**: Prettier 자동 포맷팅
- **타입 체크**: TypeScript strict 모드 사용
- **커밋**: 의미 있는 커밋 메시지 작성

### 스크립트 사용

- **개발 서버**: `npm run dev`
- **빌드**: `npm run build`
- **린트**: `npm run lint`
- **포맷**: `npm run format`
- **데이터베이스**: `npm run db:*` 스크립트 사용

## 📋 파일 간 상호작용 규칙

### API Routes와 페이지 연동

- **API 수정 시**: 해당 페이지 컴포넌트도 함께 확인
- **타입 정의**: API 응답 타입을 TypeScript 인터페이스로 정의
- **에러 처리**: 일관된 에러 처리 방식 사용

### 데이터베이스 스키마 변경

- **스키마 수정**: `prisma/schema.prisma` 수정
- **클라이언트 재생성**: `npx prisma generate` 실행
- **타입 업데이트**: 변경된 타입에 맞게 코드 수정
- **마이그레이션**: 필요시 데이터베이스 마이그레이션 실행

### 컴포넌트 업데이트

- **Props 변경**: 인터페이스 정의 업데이트
- **스타일 변경**: Tailwind 클래스 일관성 유지
- **상태 관리**: React hooks 적절히 사용

## 🚨 주의사항

### 데이터베이스 연결

- **연결 문제**: Supabase 프로젝트 상태 확인 필요
- **RLS 오류**: 정책 설정 및 서비스 역할 권한 확인
- **환경 변수**: 읽기만 가능, 수정 절대 금지

### 결제 시스템

- **테스트 모드**: 개발 환경에서는 테스트 결제만 사용
- **실제 결제**: 운영 환경에서만 실제 결제 처리
- **보안**: 결제 관련 민감 정보 보안 유지

### 성능 최적화

- **이미지**: Next.js Image 컴포넌트 사용
- **로딩**: 적절한 로딩 상태 표시
- **에러 바운더리**: 에러 처리 컴포넌트 구현

## 📝 작업 우선순위

1. **환경 변수 관련**: 사용자 확인 후 진행
2. **데이터베이스 변경**: 스키마 → 클라이언트 재생성 → 코드 수정
3. **API 개발**: 엔드포인트 → 타입 정의 → 프론트엔드 연동
4. **컴포넌트 개발**: UI 컴포넌트 → 기능 컴포넌트 → 페이지 통합
5. **테스트**: 기능 테스트 → 통합 테스트 → 사용자 테스트

## 🔄 업데이트 규칙

### 규칙 변경 시

- **최소 변경**: 기존 규칙 유지, 필요한 부분만 수정
- **타임라인**: 최신 코드 변경사항 반영
- **완전성**: 모든 폴더와 파일 검토 후 규칙 업데이트
- **자율 처리**: 모호한 요청 시 독립적으로 분석 후 제안
